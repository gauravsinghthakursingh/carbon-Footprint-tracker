import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import FootprintCalculator from "./FootprintCalculator";
import { CalculatorData } from "../types";

// Mock motion/react to prevent Framer Motion's internal animation rendering issues from interfering with tests
vi.mock("motion/react", () => {
  const filterProps = ({ whileHover, whileTap, initial, animate, exit, transition, ...rest }: any) => rest;
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <div ref={ref} {...filterProps(props)}>{children}</div>
      )),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <button ref={ref} {...filterProps(props)}>{children}</button>
      )),
      section: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <section ref={ref} {...filterProps(props)}>{children}</section>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Setup mock baseline matching Suburban preset
const baseMockData: CalculatorData = {
  carMiles: 150,
  carType: "gas",
  transitMiles: 15,
  flightsCount: 2,
  dietType: "balanced",
  electricityBill: 120,
  cleanGrid: "no",
  heatingType: "gas",
  wasteGeneration: "moderate",
  compost: "no",
};

// Helper utility to read live carbon value directly from DOM element to avoid regex mismatches
const getLiveTotal = () => {
  const elem = document.getElementById("live-total-metric");
  return elem ? elem.textContent?.trim() : "";
};

describe("FootprintCalculator - Calculations and Logic Suites", () => {
  test("renders standard calculator content with correctly calculated live carbon metric (Suburban)", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    expect(screen.getByText(/1\. Carbon Assessment/i)).toBeInTheDocument();
    
    // Total should be exactly ~5.91 tons
    expect(getLiveTotal()).toContain("5.91");
  });

  test("uses carType multipliers correctly (gas, hybrid, ev, none)", () => {
    const handleChange = vi.fn();

    // 1. Gas carType
    const { rerender } = render(<FootprintCalculator data={{ ...baseMockData, carType: "gas" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.91");

    // 2. Hybrid carType (0.2 multiplier)
    rerender(<FootprintCalculator data={{ ...baseMockData, carType: "hybrid" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.13");

    // 3. EV carType (0.08 multiplier)
    rerender(<FootprintCalculator data={{ ...baseMockData, carType: "ev" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("4.71");

    // 4. Car-free 'none' carType (0 multiplier), carMiles = 0
    rerender(<FootprintCalculator data={{ ...baseMockData, carType: "none", carMiles: 0 }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("4.42");
  });

  test("calculates utilities renewables properly (cleanGrid = 'yes')", () => {
    const handleChange = vi.fn();
    
    // cleanGrid = 'yes'. Electricity becomes multiplier 0.08 rather than 0.82
    render(<FootprintCalculator data={{ ...baseMockData, cleanGrid: "yes" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.42");
  });

  test("calculates heating types correctly (gas, electric with clean grid options, other)", () => {
    const handleChange = vi.fn();

    // 1. Gas heatingType (defaults to 1.2 tons)
    const { rerender } = render(<FootprintCalculator data={{ ...baseMockData, heatingType: "gas" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.91");

    // 2. Electric heatingType with standard grid (cleanGrid: "no") (0.75 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, heatingType: "electric", cleanGrid: "no" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.46");

    // 3. Electric heatingType with clean renewable grid (cleanGrid: "yes") (0.25 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, heatingType: "electric", cleanGrid: "yes" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("4.47");

    // 4. Other heatingType (0.55 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, heatingType: "other" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.26");
  });

  test("calculates food patterns accurately (meat-heavy, balanced, vegetarian, vegan)", () => {
    const handleChange = vi.fn();

    // 1. Balanced: 1.7 tons. Total: 5.91 tons
    const { rerender } = render(<FootprintCalculator data={{ ...baseMockData, dietType: "balanced" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.91");

    // 2. Meat-heavy: 2.4 tons (+0.7 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, dietType: "meat-heavy" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("6.61");

    // 3. Vegetarian: 1.1 tons (-0.6 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, dietType: "vegetarian" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.31");

    // 4. Vegan: 0.7 tons (-1.0 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, dietType: "vegan" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("4.91");
  });

  test("evaluates waste tiers and composting savings multiplier", () => {
    const handleChange = vi.fn();

    // 1. Moderate waste, no composting: wasteTons = 0.4. Total: 5.91 tons
    const { rerender } = render(<FootprintCalculator data={{ ...baseMockData, wasteGeneration: "moderate", compost: "no" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.91");

    // 2. High waste, no composting: wasteTons = 0.6 (+0.2 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, wasteGeneration: "high", compost: "no" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("6.11");

    // 3. Low waste, no composting: wasteTons = 0.25 (-0.15 tons)
    rerender(<FootprintCalculator data={{ ...baseMockData, wasteGeneration: "low", compost: "no" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.76");

    // 4. Low waste with composting: wasteTons = 0.25 * 0.7 = 0.175 (-0.225 tons -> rounds to 5.68)
    rerender(<FootprintCalculator data={{ ...baseMockData, wasteGeneration: "low", compost: "yes" }} onChange={handleChange} />);
    expect(getLiveTotal()).toContain("5.68");
  });

  test("triggers active tab switching correctly", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    // We start in 'transport' tab with car powertrain controls
    expect(screen.getByText(/gasoline/i)).toBeInTheDocument();
    expect(screen.queryByText(/clean wind/i)).not.toBeInTheDocument();

    // Click 'Utilities' tab
    const utilitiesTab = screen.getByText("Utilities").closest("button");
    expect(utilitiesTab).toBeInTheDocument();
    fireEvent.click(utilitiesTab!);

    // Verify view swapped to utilities controls
    expect(screen.queryByText(/gasoline/i)).not.toBeInTheDocument();
    expect(screen.getByText(/clean wind/i)).toBeInTheDocument();

    // Click 'Diet & Waste' tab
    const dietWasteTab = screen.getByText("Diet & Waste").closest("button");
    expect(dietWasteTab).toBeInTheDocument();
    fireEvent.click(dietWasteTab!);

    // Verify view swapped to diet controls
    expect(screen.queryByText(/clean wind/i)).not.toBeInTheDocument();
    expect(screen.getByText(/dietary pattern/i)).toBeInTheDocument();
  });

  test("allows sliding mileages / bills to trigger state updates", () => {
    const handleChange = vi.fn();
    const { container } = render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    // Modify Car Mileage Slider (first range input on transport tab)
    const sliders = container.querySelectorAll("input[type='range']");
    expect(sliders.length).toBeGreaterThanOrEqual(2);
    
    fireEvent.change(sliders[0], { target: { value: "180" } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ carMiles: 180 }));
    handleChange.mockClear();

    // Modify Transit Mileage Slider (second range input on transport tab)
    fireEvent.change(sliders[1], { target: { value: "45" } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ transitMiles: 45 }));
    handleChange.mockClear();

    // Switch to utilities tab for electric bill
    fireEvent.click(screen.getByText("Utilities").closest("button")!);
    const utilSliders = container.querySelectorAll("input[type='range']");
    expect(utilSliders.length).toBeGreaterThanOrEqual(1);
    
    fireEvent.change(utilSliders[0], { target: { value: "150" } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ electricityBill: 150 }));
  });

  test("handles vehicle powertrain button state selection clicks correctly", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    // Click EV powertrain button
    const evButton = screen.getByText(/EV \/ Electric/i);
    fireEvent.click(evButton);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ carType: "ev" }));
    handleChange.mockClear();

    // Click Hybrid powertrain button
    const hybridButton = screen.getByText(/Hybrid/i);
    fireEvent.click(hybridButton);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ carType: "hybrid" }));
  });

  test("handles flight increments and decrements with bounded limits (0 to 30)", () => {
    const handleChange = vi.fn();

    // 1. Increment flights
    const { rerender } = render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);
    const plusButton = screen.getByText("+");
    fireEvent.click(plusButton);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ flightsCount: 3 }));
    handleChange.mockClear();

    // 2. Decrement flights
    const minusButton = screen.getByText("-");
    fireEvent.click(minusButton);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ flightsCount: 1 }));
    handleChange.mockClear();

    // 3. Lower limit validation
    rerender(<FootprintCalculator data={{ ...baseMockData, flightsCount: 0 }} onChange={handleChange} />);
    fireEvent.click(screen.getByText("-"));
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ flightsCount: 0 }));
    handleChange.mockClear();

    // 4. Upper limit validation
    rerender(<FootprintCalculator data={{ ...baseMockData, flightsCount: 30 }} onChange={handleChange} />);
    fireEvent.click(screen.getByText("+"));
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ flightsCount: 30 }));
  });

  test("loads scenario presets correctly on button click and matches active preset styling", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    // Preset Suburban matches baseMockData exactly, so check selected styling
    const suburbanButton = screen.getByText("Suburban").closest("button");
    expect(suburbanButton).toHaveClass("bg-[#5A5A40]");

    // Eco Hero preset is inactive, click it
    const ecoHeroButton = screen.getByText("Eco Hero").closest("button");
    expect(ecoHeroButton).toHaveClass("bg-white");
    
    fireEvent.click(ecoHeroButton!);
    // Verified that eco hero data is dispatched to baseline state
    expect(handleChange).toHaveBeenCalledWith({
      carMiles: 0,
      carType: "none",
      transitMiles: 60,
      flightsCount: 0,
      dietType: "vegan",
      electricityBill: 40,
      cleanGrid: "yes",
      heatingType: "electric",
      wasteGeneration: "low",
      compost: "yes",
    });
  });

  test("renders active controls on Utilities panel clicks", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);
    
    // Swap tab to utilities
    fireEvent.click(screen.getByText("Utilities").closest("button")!);

    // Toggle clean renewable renewable program
    const yesRenewable = screen.getByText(/Yes, clean/i);
    fireEvent.click(yesRenewable);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ cleanGrid: "yes" }));
    handleChange.mockClear();

    // Change thermal heating code
    const heatPump = screen.getByText(/Heat Pump \/ Elec/i);
    fireEvent.click(heatPump);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ heatingType: "electric" }));
  });

  test("handles Diet & Waste panel clicks for composting and dietary switches", () => {
    const handleChange = vi.fn();
    render(<FootprintCalculator data={baseMockData} onChange={handleChange} />);

    // Swap tab to diet
    fireEvent.click(screen.getByText("Diet & Waste").closest("button")!);

    // Toggle vegan option
    const veganOption = screen.getByText("Vegan").closest("button");
    fireEvent.click(veganOption!);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ dietType: "vegan" }));
    handleChange.mockClear();

    // Toggle compost option (scope child search within composting division to avoid Yes/No collisons)
    const compostLabel = screen.getByText(/Active Organic Composting/i);
    const compostContainer = compostLabel.closest("div");
    const yesButton = compostContainer?.querySelector("button:nth-child(1)");
    expect(yesButton).toBeInTheDocument();
    
    fireEvent.click(yesButton!);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ compost: "yes" }));
  });
});

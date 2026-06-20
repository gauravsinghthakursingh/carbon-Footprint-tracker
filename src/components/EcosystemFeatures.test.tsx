import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import GreenPledge from "./GreenPledge";
import ActionLogger from "./ActionLogger";
import EcoChat from "./EcoChat";
import AIEcoInsights from "./AIEcoInsights";
import { CalculatorData, LoggedAction } from "../types";

// Mock motion/react animations
window.HTMLElement.prototype.scrollIntoView = vi.fn();

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
      form: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <form ref={ref} {...filterProps(props)}>{children}</form>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const baseCalculatorData: CalculatorData = {
  carMiles: 120,
  carType: "hybrid",
  transitMiles: 10,
  flightsCount: 1,
  dietType: "balanced",
  electricityBill: 100,
  cleanGrid: "no",
  heatingType: "gas",
  wasteGeneration: "moderate",
  compost: "no",
};

describe("GreenPledge Component", () => {
  let writeTextMock: any;

  beforeEach(() => {
    writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
  });

  test("renders empty green pledge form by default", () => {
    render(<GreenPledge calculatorData={baseCalculatorData} />);
    expect(screen.getByText(/Terra Green Commitments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pledger Name \/ Authority/i)).toBeInTheDocument();
  });

  test("allows filling out name, selecting climate milestones and customizing text to generate signed credential seal", async () => {
    render(<GreenPledge calculatorData={baseCalculatorData} />);
    
    // Fill pledger name
    const input = screen.getByLabelText(/Pledger Name \/ Authority/i);
    fireEvent.change(input, { target: { value: "Aarav Sharma" } });

    // Choose secondary milestone preset
    const milestoneButton = screen.getByText("Circular Eco Citizen");
    fireEvent.click(milestoneButton);

    // Or type a custom carbon covenant
    const customArea = screen.getByLabelText(/Or Write a Custom Carbon Covenant/i);
    fireEvent.change(customArea, { target: { value: "I promise to minimize plastic usage entirely." } });

    // Click submit
    const submitBtn = screen.getByRole("button", { name: /Engrave Authorized Green Alliance/i });
    fireEvent.click(submitBtn);

    // Check certificate view is generated
    expect(screen.getByText("Certificate of Ecological Commitment")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText(/"I promise to minimize plastic usage entirely."/)).toBeInTheDocument();

    // Verify copy action calling navigator.clipboard.writeText
    const copyButton = screen.getByText(/Copy Verifiable Code/i);
    fireEvent.click(copyButton);
    expect(writeTextMock).toHaveBeenCalled();

    // Reset pledge back to drafting
    const resetBtn = screen.getByText(/Draft New Covenant/i);
    fireEvent.click(resetBtn);
    expect(screen.getByLabelText(/Pledger Name \/ Authority/i)).toBeInTheDocument();
  });
});

describe("ActionLogger Component", () => {
  const mockLoggedActions: LoggedAction[] = [
    { id: "1", title: "Commuted by bicycle", category: "Transport", kgSaved: 3.5, isCustom: false, timestamp: "12:00 PM" },
    { id: "2", title: "Ate vegetarian meal", category: "Diet", kgSaved: 1.2, isCustom: false, timestamp: "1:00 PM" },
  ];

  test("lists pre-configured habits matching active search inputs and selection filters", () => {
    const handleAddAction = vi.fn();
    const handleRemoveAction = vi.fn();
    render(
      <ActionLogger
        loggedActions={mockLoggedActions}
        onAddAction={handleAddAction}
        onRemoveAction={handleRemoveAction}
      />
    );

    // Matches titles in ECO_ACTION_PRESETS
    expect(screen.getByText(/2\. Ecological Actions/i)).toBeInTheDocument();
    expect(screen.getByText("Commuted by bicycle")).toBeInTheDocument();
    expect(screen.getByText("Ate vegetarian meal")).toBeInTheDocument();

    // Search query matching filter tests
    const searchInput = screen.getByLabelText(/Search verified eco habits/i);
    fireEvent.change(searchInput, { target: { value: "thermostat" } });
    
    // Only elements with "thermostat" should show, check something missing, like "Vegetarian Meal"
    expect(screen.queryByText("Eat fully plant-based for 1 day")).not.toBeInTheDocument();
  });

  test("triggers custom adhoc action form creation properly", () => {
    const handleAddAction = vi.fn();
    const handleRemoveAction = vi.fn();
    render(
      <ActionLogger
        loggedActions={mockLoggedActions}
        onAddAction={handleAddAction}
        onRemoveAction={handleRemoveAction}
      />
    );

    // Open custom action form
    const toggleBtn = screen.getByText("Custom Action");
    fireEvent.click(toggleBtn);

    const titleInput = screen.getByLabelText("Action Name");
    const kgInput = screen.getByLabelText(/Carbon Reduction/i);
    const submitBtn = screen.getByRole("button", { name: "Add to Diary" });

    fireEvent.change(titleInput, { target: { value: "Watered plants with rainwater" } });
    fireEvent.change(kgInput, { target: { value: "2.5" } });
    fireEvent.click(submitBtn);

    expect(handleAddAction).toHaveBeenCalledWith({
      title: "Watered plants with rainwater",
      category: "Transport", // default category in state
      kgSaved: 2.5,
      isCustom: true,
    });
  });
});

describe("EcoChat Component", () => {
  test("renders system chat logs and handles custom questions through triggers", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: "Reduce standard heating levels by 1.5 degrees." }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<EcoChat calculatorData={baseCalculatorData} loggedActions={[]} />);
    
    // Render introductory message
    expect(screen.getByText(/AI Eco Coach/i)).toBeInTheDocument();

    // Send question from quick questions list
    const quickQuestBtn = screen.getByText("Best home thermostat parameters to save CO2?");
    fireEvent.click(quickQuestBtn);

    expect(fetchMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Reduce standard heating levels by 1.5 degrees.")).toBeInTheDocument();
    });
  });
});

describe("AIEcoInsights Component", () => {
  test("renders climate rating and loads fallback locally calculated insights gracefully", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          summary: "Eco Practitioner",
          annualFootprintEstimate: 3.41,
          personalizedImpactScore: 82,
          highImpactActions: [
            {
              title: "Transition local driving to active cycling",
              category: "Transport",
              estimatedSavings: 800,
              difficulty: "Medium",
              rationale: "Cycling instead of driving saves carbon."
            }
          ],
          personalizedMessage: "Great job evaluating your carbon details!"
        }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const handleAddAction = vi.fn();
    render(<AIEcoInsights calculatorData={baseCalculatorData} loggedActions={[]} onAddAction={handleAddAction} />);

    // Starts with localized fallback or loaded defaults
    expect(screen.getByText(/Climate Rating/i)).toBeInTheDocument();
    
    // Wait for the 1200ms debounce to fire in real time
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1400));
    });

    // Check fallback title
    await waitFor(() => {
      expect(screen.getByText("Transition local driving to active cycling")).toBeInTheDocument();
    });

    // Adopt an action
    const adoptBtn = screen.getByRole("button", { name: "Log Daily Offset" });
    fireEvent.click(adoptBtn);

    expect(handleAddAction).toHaveBeenCalled();
  });
});

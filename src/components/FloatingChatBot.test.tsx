import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FloatingChatBot from "./FloatingChatBot";

// Mock framer-motion library to prevent console styling/prop warnings in vitest jsdom
vi.mock("motion/react", () => {
  const filterProps = (props: any) => {
    const { whileHover, whileTap, initial, animate, exit, transition, ...rest } = props;
    return rest;
  };
  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...filterProps(props)}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...filterProps(props)}>{children}</span>,
      p: ({ children, ...props }: any) => <p {...filterProps(props)}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("FloatingChatBot Component", () => {
  const dummyCalculator = {
    carMiles: 1000,
    carType: "petrol",
    transitMiles: 50,
    flightsCount: 2,
    dietType: "balanced",
    electricityBill: 120,
    cleanGrid: "no",
    heatingType: "gas",
    wasteGeneration: "moderate",
    compost: "no"
  };

  test("renders closed state by default with just the action trigger", () => {
    render(<FloatingChatBot calculatorData={dummyCalculator} loggedActions={[]} />);
    
    // Trigger is visible
    const trigger = screen.getByRole("button", { name: "Open persistent Free AI Eco Chat Bot" });
    expect(trigger).toBeInTheDocument();
    
    // Chat content is hidden
    expect(screen.queryByText("Gemini Eco Coach")).not.toBeInTheDocument();
  });

  test("toggles search panel visibility on trigger click", () => {
    render(<FloatingChatBot calculatorData={dummyCalculator} loggedActions={[]} />);
    
    const trigger = screen.getByRole("button", { name: "Open persistent Free AI Eco Chat Bot" });
    fireEvent.click(trigger);

    // Chat content should show up now
    expect(screen.getByText("Gemini Eco Coach")).toBeInTheDocument();
    expect(screen.getByText(/Hello! I am your Free Gemini AI Eco Coach/i)).toBeInTheDocument();

    // Re-clicking should close it (or clicking the X button)
    const closeBtn = screen.getByRole("button", { name: "Minimize chat conversation" });
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Gemini Eco Coach")).not.toBeInTheDocument();
  });

  test("successfully submits user prompts and renders AI responses", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            response: "This is a custom eco answer powered by Gemini server-side processing!"
          }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<FloatingChatBot calculatorData={dummyCalculator} loggedActions={[]} />);
    
    // Open chat
    const trigger = screen.getByRole("button", { name: "Open persistent Free AI Eco Chat Bot" });
    fireEvent.click(trigger);

    const input = screen.getByPlaceholderText("Ask our Free AI: 'Is gas heating bad?'");
    const sendBtn = screen.getByRole("button", { name: "" }); // Send button search icon

    fireEvent.change(input, { target: { value: "How major is flight carbon?" } });
    fireEvent.click(sendBtn);

    // Verify loading indicator/thinking text appears
    expect(screen.getByText("Eco Coach thinking...")).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(screen.getByText("This is a custom eco answer powered by Gemini server-side processing!")).toBeInTheDocument();
    });
  });
});

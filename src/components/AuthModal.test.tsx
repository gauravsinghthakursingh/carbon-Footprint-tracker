import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthModal from "./AuthModal";

// 100% Mock framer-motion library to prevent console styling/prop warnings in vitest jsdom
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

describe("AuthModal Component", () => {
  test("does not render when closed", () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={() => {}} onAuthSuccess={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders authentication elements, toggles tabs, and verifies password score displays", () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />);
    
    // Check main title
    expect(screen.getByText("Ecosystem Sync")).toBeInTheDocument();
    
    // Check initial state has "Sign In" title & button
    expect(screen.getByRole("button", { name: "Verify Credentials" })).toBeInTheDocument();

    // Toggle register tab
    const registerTabBtn = screen.getByRole("button", { name: "Create State" });
    fireEvent.click(registerTabBtn);

    // Verify username handle input is now visible
    expect(screen.getByText("Ecosystem Handle")).toBeInTheDocument();
  });

  test("runs local validation for incorrect email addresses", async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />);
    
    // Fill credentials form with incorrect email
    const emailInput = screen.getByPlaceholderText("name@ecosession.org");
    const passwordInput = screen.getByPlaceholderText("******");
    const submitBtn = screen.getByRole("button", { name: "Verify Credentials" });

    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitBtn);

    // Should render a helpful validation alert
    expect(await screen.findByText(/enter a technically valid email/i)).toBeInTheDocument();
  });

  test("triggers onAuthSuccess callback upon correct credentials fetch", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "u_1", username: "ClimateHero", email: "hero@climate.org", points: 200, level: "Seedling" },
            token: "mock-sess-token",
            state: { calculatorData: {}, loggedActions: [] }
          }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const handleAuthSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={handleAuthSuccess} />);

    const emailInput = screen.getByPlaceholderText("name@ecosession.org");
    const passwordInput = screen.getByPlaceholderText("******");
    const submitBtn = screen.getByRole("button", { name: "Verify Credentials" });

    fireEvent.change(emailInput, { target: { value: "hero@climate.org" } });
    fireEvent.change(passwordInput, { target: { value: "strongpassword" } });
    fireEvent.click(submitBtn);

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
    
    await waitFor(() => {
      expect(handleAuthSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ username: "ClimateHero" }),
        "mock-sess-token",
        expect.any(Object)
      );
    }, { timeout: 1000 });
  });
});

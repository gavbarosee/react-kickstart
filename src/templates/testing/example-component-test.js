import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "{{TEST_FRAMEWORK}}";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("App", () => {
  it("renders welcome message", () => {
    render(<App />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it("responds to user interactions", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Example interaction test
    const button = screen.getByRole("button");
    await user.click(button);

    // Assert the expected behavior
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});

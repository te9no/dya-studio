/**
 * Tests for HomePage component
 */
import { render, screen } from "@testing-library/react";
import { HomePage } from "../HomePage";

describe("HomePage", () => {
  it("should render welcome header", () => {
    render(<HomePage />);

    expect(screen.getByText("Welcome to DYA Studio")).toBeInTheDocument();
    expect(
      screen.getByText("Your hub for DYA keyboard configuration"),
    ).toBeInTheDocument();
  });

  it("should render getting started guide", () => {
    render(<HomePage />);

    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Connect Your Keyboard")).toBeInTheDocument();
    expect(screen.getByText("Explore the Tabs")).toBeInTheDocument();
    expect(screen.getByText("Customize & Save")).toBeInTheDocument();
  });

  it("should render DYA keyboards section", () => {
    render(<HomePage />);

    expect(screen.getByText("DYA Keyboards")).toBeInTheDocument();
    expect(screen.getByText("DYA Dash Keyboard")).toBeInTheDocument();
    expect(
      screen.getByText("Split keyboard with integrated trackball"),
    ).toBeInTheDocument();
  });

  it("should have link to DYA Dash keyboard GitHub", () => {
    render(<HomePage />);

    const link = screen.getByRole("link", { name: /DYA Dash Keyboard/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/cormoran/dya-dash-keyboard",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should show DY2 as coming soon", () => {
    render(<HomePage />);

    expect(screen.getByText("DY2")).toBeInTheDocument();
    expect(
      screen.getByText("Next generation DYA keyboard"),
    ).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("should render shop section", () => {
    render(<HomePage />);

    expect(screen.getByText("Get Your DYA Keyboard")).toBeInTheDocument();
    expect(screen.getByText("Visit DYA Shop")).toBeInTheDocument();
    expect(
      screen.getByText("Purchase DYA keyboards and accessories"),
    ).toBeInTheDocument();
  });

  it("should have link to shop", () => {
    render(<HomePage />);

    const link = screen.getByRole("link", { name: /Visit DYA Shop/i });
    expect(link).toHaveAttribute("href", "https://cormoran707.booth.pm/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should show info box about DYA Studio", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/DYA Studio is a web-based configuration tool/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /All configuration changes are applied directly to your keyboard/i,
      ),
    ).toBeInTheDocument();
  });
});

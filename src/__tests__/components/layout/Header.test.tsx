import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("renders the header with logo", () => {
    render(<Header />);
    expect(screen.getByText("Warehouse Manager")).toBeInTheDocument();
  });

  it("renders navigation links for unified warehouse", () => {
    render(<Header />);
    expect(screen.getByText("Warehouse")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
  });
});

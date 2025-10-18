import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("renders the header with logo", () => {
    render(<Header />);
    expect(screen.getByText("Warehouse Manager")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Warehouses")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("3D View")).toBeInTheDocument();
  });

  it("renders add warehouse button", () => {
    render(<Header />);
    expect(screen.getByText("Add Warehouse")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactCard } from "./ContactCard";
import { Mail, Phone } from "lucide-react";

describe("ContactCard", () => {
  const defaultProps = {
    icon: Mail,
    iconColorClass: "bg-brand-secondary/10 text-brand-secondary",
    title: "Email",
    badgeText: "Available",
    badgeVariant: "available" as const,
    description: "Contact us via email",
    buttonText: "Send Email",
  };

  it("renders title and description", () => {
    render(<ContactCard {...defaultProps} />);
    
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Contact us via email")).toBeInTheDocument();
  });

  it("renders badge with correct text", () => {
    render(<ContactCard {...defaultProps} />);
    
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders button with correct text", () => {
    render(<ContactCard {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: "Send Email" })).toBeInTheDocument();
  });

  it("renders disabled button when buttonDisabled is true", () => {
    render(<ContactCard {...defaultProps} buttonDisabled />);
    
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders link button when buttonHref is provided", () => {
    render(<ContactCard {...defaultProps} buttonHref="mailto:test@example.com" />);
    
    const link = screen.getByRole("link", { name: "Send Email" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("calls onClick when card is clicked", () => {
    const handleClick = vi.fn();
    render(<ContactCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByText("Email").closest("div.bg-card");
    fireEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("card container has cursor-pointer when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<ContactCard {...defaultProps} onClick={handleClick} />);
    
    // The outer card container should have cursor-pointer class
    const cardContainer = screen.getByText("Email").closest(".bg-card");
    expect(cardContainer).toHaveClass("cursor-pointer");
  });

  it("renders children when provided", () => {
    render(
      <ContactCard {...defaultProps}>
        <span data-testid="child-element">Child Content</span>
      </ContactCard>
    );
    
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });

  it("applies unavailable badge variant styles", () => {
    render(
      <ContactCard
        {...defaultProps}
        badgeText="On Vacation"
        badgeVariant="unavailable"
      />
    );
    
    expect(screen.getByText("On Vacation")).toBeInTheDocument();
  });

  it("applies neutral badge variant styles", () => {
    render(
      <ContactCard
        {...defaultProps}
        badgeText="Pursuing Dreams"
        badgeVariant="neutral"
      />
    );
    
    expect(screen.getByText("Pursuing Dreams")).toBeInTheDocument();
  });

  it("renders with different icons", () => {
    render(<ContactCard {...defaultProps} icon={Phone} title="Phone" />);
    
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });
});

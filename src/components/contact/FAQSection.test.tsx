import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FAQSection } from "./FAQSection";

describe("FAQSection", () => {
  const defaultItems = [
    { question: "What is this?", answer: "This is a test FAQ." },
    { question: "How does it work?", answer: "It works great!" },
    { question: "Is it free?", answer: "Yes, completely free." },
  ];

  it("renders title", () => {
    render(<FAQSection title="Frequently Asked Questions" items={defaultItems} />);
    
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("renders all questions", () => {
    render(<FAQSection title="FAQ" items={defaultItems} />);
    
    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("How does it work?")).toBeInTheDocument();
    expect(screen.getByText("Is it free?")).toBeInTheDocument();
  });

  it("expands accordion to show answer when clicked", async () => {
    render(<FAQSection title="FAQ" items={defaultItems} />);
    
    // Click the question trigger
    const trigger = screen.getByText("What is this?");
    fireEvent.click(trigger);
    
    // Answer should now be in the document after expanding
    expect(await screen.findByText("This is a test FAQ.")).toBeInTheDocument();
  });

  it("shows answer content after clicking question", async () => {
    render(<FAQSection title="FAQ" items={defaultItems} />);
    
    // Open first question
    fireEvent.click(screen.getByText("What is this?"));
    expect(await screen.findByText("This is a test FAQ.")).toBeInTheDocument();
    
    // Open second question
    fireEvent.click(screen.getByText("How does it work?"));
    expect(await screen.findByText("It works great!")).toBeInTheDocument();
  });

  it("renders empty state when no items provided", () => {
    render(<FAQSection title="Empty FAQ" items={[]} />);
    
    expect(screen.getByText("Empty FAQ")).toBeInTheDocument();
  });

  it("renders with single item", () => {
    const singleItem = [{ question: "Only question?", answer: "Only answer." }];
    render(<FAQSection title="Single FAQ" items={singleItem} />);
    
    expect(screen.getByText("Only question?")).toBeInTheDocument();
  });

  it("handles long questions and answers", () => {
    const longItems = [
      {
        question: "This is a very long question that spans multiple words and tests wrapping?",
        answer: "This is a comprehensive answer that provides detailed information about the topic at hand.",
      },
    ];
    render(<FAQSection title="FAQ" items={longItems} />);
    
    expect(screen.getByText(longItems[0].question)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(longItems[0].question));
    expect(screen.getByText(longItems[0].answer)).toBeVisible();
  });
});

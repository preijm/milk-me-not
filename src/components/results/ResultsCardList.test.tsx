import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResultsCardList } from "./ResultsCardList";
import type { AggregatedResult } from "@/hooks/useAggregatedResults";

const results: AggregatedResult[] = [
  {
    brand_id: "",
    brand_name: "Alnatura",
    product_id: "p1",
    product_name: "Oat",
    property_names: ["unsweetened"],
    flavors: undefined,
    flavor_names: ["matcha"],
    is_barista: true,
    avg_rating: 9.2,
    count: 3,
    most_recent_date: "2026-09-01",
  } as AggregatedResult,
  {
    brand_id: "",
    brand_name: "Joya",
    product_id: "p2",
    product_name: "Soya",
    property_names: [],
    flavor_names: [],
    is_barista: false,
    avg_rating: 6.4,
    count: 1,
    most_recent_date: "2026-08-01",
  } as AggregatedResult,
];

const renderList = (ranked?: boolean) =>
  render(
    <MemoryRouter>
      <ResultsCardList results={results} ranked={ranked} />
    </MemoryRouter>,
  );

describe("ResultsCardList", () => {
  // The number is the row's position in whatever sort is running. That is a
  // rank under "Highest score" and a row counter under everything else — and a
  // #1 beside a brand starting with A claims to be the best plant milk on the
  // site when it is only first alphabetically.
  it("numbers the rows when the list is a ranking", () => {
    renderList(true);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("drops the numbers when the sort is not a ranking", () => {
    renderList(false);
    expect(screen.queryByText("#1")).not.toBeInTheDocument();
    expect(screen.queryByText("#2")).not.toBeInTheDocument();
  });

  it("says nothing about position unless the caller says it is ranked", () => {
    renderList();
    expect(screen.queryByText("#1")).not.toBeInTheDocument();
  });

  // Whether or not the rows are numbered, they are still products you can open.
  it("keeps every row a real link to its product", () => {
    const { container } = renderList(false);
    const links = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/product/p1", "/product/p2"]);
  });

  it("shows the score, its tier and what the score is worth", () => {
    renderList(true);
    expect(screen.getByText("9.2")).toBeInTheDocument();
    expect(screen.getByText("Gem")).toBeInTheDocument();
    expect(screen.getByText("3 ratings")).toBeInTheDocument();
    expect(screen.getByText("1 rating")).toBeInTheDocument();
  });
});

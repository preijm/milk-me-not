import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RatingSelect } from "./RatingSelect";

const scoreBox = () => screen.getByLabelText("Score out of 10");

describe("RatingSelect", () => {
  it("shows the current score to one decimal", () => {
    render(<RatingSelect rating={7.5} setRating={vi.fn()} />);
    expect(scoreBox()).toHaveValue("7.5");
  });

  it("shows no score rather than 0.0 when nothing has been given yet", () => {
    // A rating of zero is not the same as an unrated carton, and the old
    // control displayed "0.0" for both.
    render(<RatingSelect rating={0} setRating={vi.fn()} />);
    expect(scoreBox()).toHaveValue("");
    expect(screen.getByText("of 10")).toBeInTheDocument();
  });

  it("names the tier for the current score", () => {
    render(<RatingSelect rating={9} setRating={vi.fn()} />);
    expect(screen.getByText("Gem")).toBeInTheDocument();
  });

  it("takes a typed score on blur-sm", () => {
    const setRating = vi.fn();
    render(<RatingSelect rating={5} setRating={setRating} />);
    fireEvent.change(scoreBox(), { target: { value: "7.3" } });
    fireEvent.blur(scoreBox());
    expect(setRating).toHaveBeenCalledWith(7.3);
  });

  it("clamps a typed score to 10", () => {
    const setRating = vi.fn();
    render(<RatingSelect rating={5} setRating={setRating} />);
    fireEvent.change(scoreBox(), { target: { value: "15" } });
    fireEvent.blur(scoreBox());
    expect(setRating).toHaveBeenCalledWith(10);
  });

  it("clears the score when the field is emptied", () => {
    const setRating = vi.fn();
    render(<RatingSelect rating={5} setRating={setRating} />);
    fireEvent.change(scoreBox(), { target: { value: "" } });
    fireEvent.blur(scoreBox());
    expect(setRating).toHaveBeenCalledWith(0);
  });

  it("nudges by a tenth in each direction", () => {
    const setRating = vi.fn();
    render(<RatingSelect rating={7} setRating={setRating} />);

    fireEvent.click(screen.getByLabelText("Increase by a tenth"));
    expect(setRating).toHaveBeenCalledWith(7.1);

    fireEvent.click(screen.getByLabelText("Decrease by a tenth"));
    expect(setRating).toHaveBeenCalledWith(6.9);
  });

  it("does not let the nudges leave the 0-10 scale", () => {
    const { rerender } = render(<RatingSelect rating={10} setRating={vi.fn()} />);
    expect(screen.getByLabelText("Increase by a tenth")).toBeDisabled();

    rerender(<RatingSelect rating={0} setRating={vi.fn()} />);
    expect(screen.getByLabelText("Decrease by a tenth")).toBeDisabled();
  });

  it("keeps tenths precision, which most real ratings use", () => {
    const setRating = vi.fn();
    render(<RatingSelect rating={6.8} setRating={setRating} />);
    expect(scoreBox()).toHaveValue("6.8");
    fireEvent.click(screen.getByLabelText("Increase by a tenth"));
    expect(setRating).toHaveBeenCalledWith(6.9);
  });
});

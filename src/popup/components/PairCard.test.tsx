import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { StoredPair } from "@/shared/types";
import { PairCard } from "./PairCard";
import { TooltipProvider } from "./ui/tooltip";

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: () => {}, handleRef: () => {} }),
}));

const basePair: StoredPair = {
  id: "1",
  key: "theme",
  values: ["dark", "light"],
  reloadAfterToggle: false,
  shortcut: "Ctrl+Shift+D",
  order: 0,
};

function renderCard(overrides: Partial<Parameters<typeof PairCard>[0]> = {}) {
  const onToggle = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(
    <TooltipProvider>
      <PairCard
        pair={basePair}
        index={0}
        currentValue="dark"
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        {...overrides}
      />
    </TooltipProvider>,
  );
  return { onToggle, onEdit, onDelete };
}

describe("<PairCard>", () => {
  it("renders the pair key", () => {
    renderCard();
    expect(screen.getByText("theme")).toBeInTheDocument();
  });

  it("renders all configured values", () => {
    renderCard();
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("highlights the current value via text-primary class", () => {
    renderCard({ currentValue: "light" });
    expect(screen.getByText("light")).toHaveClass("text-primary");
    expect(screen.getByText("dark")).not.toHaveClass("text-primary");
  });

  it("shows the shortcut when configured", () => {
    renderCard();
    expect(screen.getByText("Ctrl+Shift+D")).toBeInTheDocument();
  });

  it("omits the shortcut badge when null", () => {
    renderCard({ pair: { ...basePair, shortcut: null } });
    expect(screen.queryByText("Ctrl+Shift+D")).not.toBeInTheDocument();
  });

  it("calls onToggle when the toggle button is clicked", async () => {
    const { onToggle } = renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Toggle to next value" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("calls onEdit when the edit button is clicked", async () => {
    const { onEdit } = renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Edit pair" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("opens the delete dialog and calls onDelete on confirm", async () => {
    const { onDelete } = renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Delete pair" }));

    const confirm = await screen.findByRole("button", { name: "Delete" });
    await userEvent.click(confirm);
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

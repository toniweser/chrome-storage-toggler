import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PairForm } from "./PairForm";

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: () => {}, handleRef: () => {} }),
}));

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderForm() {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(<PairForm allPairs={[]} onSave={onSave} onCancel={onCancel} />);
  return { onSave, onCancel };
}

describe("<PairForm>", () => {
  it("keeps Save disabled until key + at least 2 non-empty values are filled", async () => {
    renderForm();
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText("localStorage key name"), "theme");
    expect(save).toBeDisabled();

    const [, firstValueInput, secondValueInput] = screen.getAllByRole("textbox");
    await userEvent.type(firstValueInput, "dark");
    expect(save).toBeDisabled();

    await userEvent.type(secondValueInput, "light");
    expect(save).toBeEnabled();
  });

  it("calls onSave with a trimmed key + values on submit", async () => {
    const { onSave } = renderForm();

    await userEvent.type(screen.getByPlaceholderText("localStorage key name"), "  theme  ");
    const [, firstValueInput, secondValueInput] = screen.getAllByRole("textbox");
    await userEvent.type(firstValueInput, "dark");
    await userEvent.type(secondValueInput, "light");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0][0]).toMatchObject({
      key: "theme",
      values: ["dark", "light"],
      reloadAfterToggle: true,
    });
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const { onCancel } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordField } from "./password-field";

describe("PasswordField", () => {
  it("associates its label and validation message with the input", () => {
    render(<PasswordField label="Kata Sandi" error="Kata sandi wajib diisi." />);

    const input = screen.getByLabelText("Kata Sandi");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("Kata sandi wajib diisi.").id).toBe(input.getAttribute("aria-describedby"));
  });

  it("keeps the password visibility control keyboard-operable", () => {
    render(<PasswordField label="Kata Sandi" />);
    const input = screen.getByLabelText("Kata Sandi");

    expect(input.getAttribute("type")).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(input.getAttribute("type")).toBe("text");
  });
});

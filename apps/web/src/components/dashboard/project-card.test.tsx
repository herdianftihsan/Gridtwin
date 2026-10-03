import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "./project-card";
import type { Project } from "../../types/api";

const project: Project = {
  id: "project-1",
  building_type: "Office",
  location: "Surabaya",
  monthly_bill: 4_500_000,
  budget: 50_000_000,
  objective: "save_money",
  created_at: "2026-08-01T00:00:00.000Z",
};

describe("ProjectCard", () => {
  it("provides a project link and a separate accessible delete action", () => {
    const onDelete = vi.fn();
    render(<ProjectCard project={project} onDelete={onDelete} />);

    expect(screen.getByRole("link", { name: /Office/ }).getAttribute("href")).toBe("/projects/project-1");
    const deleteButton = screen.getByRole("button", { name: "Hapus project Office" });
    expect(deleteButton.closest("a")).toBeNull();
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledOnce();
    expect(screen.queryByText("Aktif")).toBeNull();
  });
});

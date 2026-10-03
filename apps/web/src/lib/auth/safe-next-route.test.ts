import { describe, expect, it } from "vitest";
import { getSafeNextRoute } from "./safe-next-route";

describe("getSafeNextRoute", () => {
  it("preserves valid internal destinations", () => {
    expect(getSafeNextRoute("/projects/project-1?view=summary#result")).toBe(
      "/projects/project-1?view=summary#result",
    );
  });

  it.each([null, "", "dashboard", "//example.com", "/\\example.com", "https://example.com"]) (
    "falls back for unsafe destination %j",
    (candidate) => {
      expect(getSafeNextRoute(candidate)).toBe("/dashboard");
    },
  );
});

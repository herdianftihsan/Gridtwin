import { describe, expect, it } from "vitest";

import { API_ERROR_CODES } from "./index.js";

describe("@gridtwin/shared contract scaffold", () => {
  it("exposes the 10 standard error codes from api-contract v1.0.2", () => {
    expect(API_ERROR_CODES).toHaveLength(10);
    expect(API_ERROR_CODES).toContain("NO_FEASIBLE_SCENARIO");
    expect(API_ERROR_CODES).toContain("INFEASIBLE_EFFICIENCY_CONFIGURATION");
  });
});

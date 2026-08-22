import { describe, it, expect } from "vitest";
import { mapDbRoleToClient } from "../lib/persistence/crm-sync";

describe("Server role -> client perspective mapping", () => {
  it("maps privileged DB roles to the boss perspective", () => {
    expect(mapDbRoleToClient("owner")).toBe("boss");
    expect(mapDbRoleToClient("admin")).toBe("boss");
    expect(mapDbRoleToClient("boss")).toBe("boss");
  });

  it("maps management roles to the manager perspective", () => {
    expect(mapDbRoleToClient("manager")).toBe("manager");
    expect(mapDbRoleToClient("closer")).toBe("manager");
  });

  it("defaults unknown or missing roles to least privilege (salesperson)", () => {
    expect(mapDbRoleToClient("salesperson")).toBe("salesperson");
    expect(mapDbRoleToClient(null)).toBe("salesperson");
    expect(mapDbRoleToClient(undefined)).toBe("salesperson");
    expect(mapDbRoleToClient("hacker-role")).toBe("salesperson");
  });
});

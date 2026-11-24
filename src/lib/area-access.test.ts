import { describe, expect, it } from "vitest";
import { canEnterArea } from "./area-access";

describe("separate registration approval", () => {
  it("locks both areas for existing accounts awaiting review", () => {
    const existingAccount = { challenge: "pending", clinic: "pending" } as const;
    expect(canEnterArea(existingAccount.challenge)).toBe(false);
    expect(canEnterArea(existingAccount.clinic)).toBe(false);
  });
  it("does not let Challenge approval unlock Clinic Clients", () => {
    expect(canEnterArea("approved")).toBe(true);
    expect(canEnterArea("pending")).toBe(false);
  });
  it("does not let Clinic approval unlock the Challenge", () => {
    const access = { clinic: "approved", challenge: undefined } as const;
    expect(canEnterArea(access.clinic)).toBe(true);
    expect(canEnterArea(access.challenge)).toBe(false);
  });
  it("locks new registrations and declined access", () => {
    expect(canEnterArea(undefined)).toBe(false);
    expect(canEnterArea("declined")).toBe(false);
  });
});
import { describe, expect, it } from "vitest";

import {
  ACCESS_VALIDITY_MONTHS,
  REFUND_WINDOW_DAYS,
  computeAccessExpiry,
  computeRefundDeadline,
  isAccessValid,
} from "../access-policy";

describe("access-policy (épico GREENN/Brevo — slide 1)", () => {
  const purchasedAt = new Date("2026-01-10T12:00:00.000Z");

  it("uses the agreed validity and refund windows", () => {
    expect(ACCESS_VALIDITY_MONTHS).toBe(6);
    expect(REFUND_WINDOW_DAYS).toBe(7);
  });

  it("expires access 6 months after purchase", () => {
    expect(computeAccessExpiry(purchasedAt).toISOString()).toBe("2026-07-10T12:00:00.000Z");
  });

  it("sets the refund deadline 7 days after purchase", () => {
    expect(computeRefundDeadline(purchasedAt).toISOString()).toBe("2026-01-17T12:00:00.000Z");
  });

  it("validates access only before expiry", () => {
    const expiry = computeAccessExpiry(purchasedAt);
    expect(isAccessValid(expiry, new Date("2026-05-01T00:00:00.000Z"))).toBe(true);
    expect(isAccessValid(expiry, new Date("2026-08-01T00:00:00.000Z"))).toBe(false);
  });
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DAY_MS, activeNewBadgeUntil, chooseNewBadgeSettings,
  newBadgeDaysRemaining, newBadgeExpiry, readNewBadgeSettings,
} from "./new-arrival";

const launchTime = "2026-11-22T10:00:00.000Z";
const start = Date.parse(launchTime);

test("30, 60 and 90-day windows expire exactly when selected", () => {
  for (const durationDays of [30, 60, 90] as const) {
    const details = { newBadge: { durationDays, startedAt: launchTime } };
    const expiresAt = start + durationDays * DAY_MS;
    assert.equal(newBadgeExpiry(details.newBadge), new Date(expiresAt).toISOString());
    assert.equal(activeNewBadgeUntil(details, expiresAt - 1), new Date(expiresAt).toISOString());
    assert.equal(activeNewBadgeUntil(details, expiresAt), undefined);
    assert.equal(activeNewBadgeUntil(details, expiresAt + DAY_MS), undefined);
    assert.equal(newBadgeDaysRemaining(details.newBadge, start), durationDays);
    assert.equal(newBadgeDaysRemaining(details.newBadge, expiresAt), 0);
  }
});

test("invalid, missing and disabled settings never display a NEW label", () => {
  for (const details of [
    null, {}, { newBadge: { durationDays: 7, startedAt: launchTime } },
    { newBadge: { durationDays: 30, startedAt: "invalid" } },
    { newBadge: { durationDays: 30 } },
    { newBadge: [] },
    { newBadge: { durationDays: "30", startedAt: launchTime } },
  ]) {
    assert.equal(readNewBadgeSettings(details), undefined);
    assert.equal(activeNewBadgeUntil(details, start), undefined);
  }
});

test("editing preserves the original expiry; a deliberate restart renews it", () => {
  const existing = { durationDays: 30 as const, startedAt: launchTime };
  const later = new Date(start + 22 * DAY_MS);
  assert.deepEqual(chooseNewBadgeSettings(30, existing, false, later), existing);
  assert.deepEqual(chooseNewBadgeSettings(30, existing, true, later), {
    durationDays: 30, startedAt: later.toISOString(),
  });
  assert.deepEqual(chooseNewBadgeSettings(60, existing, false, later), {
    durationDays: 60, startedAt: later.toISOString(),
  });
  assert.equal(chooseNewBadgeSettings(null, existing, false, later), undefined);
});

test("an expired badge stays expired until an administrator restarts it", () => {
  const expired = { durationDays: 30 as const, startedAt: launchTime };
  const today = new Date(start + 60 * DAY_MS);
  assert.equal(activeNewBadgeUntil({ newBadge: expired }, today.getTime()), undefined);
  const unchanged = chooseNewBadgeSettings(30, expired, false, today);
  assert.equal(activeNewBadgeUntil({ newBadge: unchanged }, today.getTime()), undefined);
  const renewed = chooseNewBadgeSettings(30, expired, true, today);
  assert.ok(activeNewBadgeUntil({ newBadge: renewed }, today.getTime()));
});

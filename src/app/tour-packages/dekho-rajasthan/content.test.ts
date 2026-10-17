import test from "node:test";
import assert from "node:assert/strict";
import { INCLUDE_OPTIONS, MEAL_OPTIONS } from "@/lib/packages";
import { EXCLUSIONS, HIGHLIGHTS, INCLUDES, INCLUSIONS, ITINERARY, NOTES, ROUTE, ROUTE_STOPS } from "./content";

test("itinerary is 8 consecutive days", () => {
  assert.deepEqual(
    ITINERARY.map((d) => d.day),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );
});

test("every overnight stay is a route stop, and nights add up to 7", () => {
  for (const d of ITINERARY) {
    if (d.stay) assert.ok(ROUTE.includes(d.stay), `Day ${d.day} stays in "${d.stay}", not a route stop`);
  }
  assert.equal(
    ITINERARY.filter((d) => d.stay).length,
    7,
    "7 nights = every day but the last has an overnight stay"
  );
  assert.equal(
    ROUTE_STOPS.reduce((sum, s) => sum + s.NIGHTS, 0),
    7
  );
  assert.deepEqual(
    ROUTE_STOPS.map((s) => s.CITY),
    ROUTE
  );
  assert.equal(ROUTE_STOPS.find((s) => s.CITY === "Udaipur")?.NIGHTS, 2);
  assert.equal(ROUTE_STOPS.find((s) => s.CITY === "Chittorgarh")?.NIGHTS, 0);
});

test("meals and includes use the admin form's options", () => {
  for (const d of ITINERARY) for (const m of d.meals) assert.ok(MEAL_OPTIONS.includes(m), `Day ${d.day}: ${m}`);
  for (const i of INCLUDES) assert.ok(INCLUDE_OPTIONS.includes(i), i);
});

test("seed lists are non-empty and trimmed", () => {
  assert.ok(HIGHLIGHTS.length >= 6 && HIGHLIGHTS.length <= 10);
  for (const list of [HIGHLIGHTS, INCLUSIONS, EXCLUSIONS, NOTES]) {
    assert.ok(list.length > 0);
    for (const item of list) assert.equal(item, item.trim());
  }
});

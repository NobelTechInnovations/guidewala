import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INCLUDE_OPTIONS,
  MEAL_OPTIONS,
  TOUR_TYPES,
  SHOWN,
  isShown,
  linesToList,
  listToLines,
  htmlToText,
  looksLikeHtml,
  sortItinerary,
  durationLabel,
  hasDayNo,
  isDayWise,
  textToParagraphs,
} from "./packages";
import { DEFAULT_CANCELLATION_POLICY, cancellationPolicyFor, policySummary } from "./policies";

test("option lists match the spec values and order", () => {
  assert.deepEqual([...INCLUDE_OPTIONS], ["Hotel", "Meals", "Transport", "Sightseeing", "Guide", "Flight"]);
  assert.deepEqual([...MEAL_OPTIONS], ["Breakfast", "Lunch", "Dinner"]);
  assert.deepEqual([...TOUR_TYPES], ["Private Tour", "Group Tour", "Guide Only"]);
});

test("SHOWN is the $ne:N query fragment; isShown treats only 'N' as hidden", () => {
  assert.deepEqual(SHOWN, { $ne: "N" });
  assert.equal(isShown("Y"), true);
  assert.equal(isShown(undefined), true);
  assert.equal(isShown(null), true);
  assert.equal(isShown(""), true);
  assert.equal(isShown("N"), false);
});

test("linesToList splits on newlines, trims and drops empties", () => {
  assert.deepEqual(linesToList(" a \n\n b "), ["a", "b"]);
  assert.deepEqual(linesToList(""), []);
  assert.deepEqual(linesToList("one\r\ntwo\r\n"), ["one", "two"]);
});

test("listToLines joins with newlines and tolerates undefined", () => {
  assert.equal(listToLines(["a", "b"]), "a\nb");
  assert.equal(listToLines([]), "");
  assert.equal(listToLines(undefined), "");
});

test("htmlToText cleans the legacy PKG_DESC markup (nbsp -> ASCII space, empty paragraphs collapse)", () => {
  assert.equal(
    htmlToText("<p>Dekho Rajasthan&nbsp; 7 Nights and 8 Days</p><p><br></p><p><br></p>"),
    "Dekho Rajasthan  7 Nights and 8 Days",
  );
});

test("htmlToText keeps paragraph breaks and link text", () => {
  assert.equal(htmlToText("<p>One</p><p>Two</p>"), "One\nTwo");
  assert.equal(htmlToText('<p>See <a href="https://x.test">Click here</a> now</p>'), "See Click here now");
  assert.equal(htmlToText('<a href="x">Click here</a>'), "Click here");
});

test("htmlToText turns br, div, li and headings into line breaks", () => {
  assert.equal(htmlToText("a<br>b<br/>c<br />d"), "a\nb\nc\nd");
  assert.equal(htmlToText("<div>a</div><div>b</div>"), "a\nb");
  assert.equal(htmlToText("<ul><li>a</li><li>b</li></ul>"), "a\nb");
  assert.equal(htmlToText("<h2>Title</h2>Body"), "Title\nBody");
  assert.equal(htmlToText("<h1>A</h1><h6>B</h6>"), "A\nB");
});

test("htmlToText decodes the listed entities once (no double-decoding)", () => {
  assert.equal(htmlToText("a&amp;b &lt;c&gt; &quot;d&quot; &#39;e&#39;"), `a&b <c> "d" 'e'`);
  assert.equal(htmlToText("&amp;lt;"), "&lt;");
  assert.equal(htmlToText("x&nbsp;y"), "x y");
});

test("htmlToText collapses 3+ newlines to 2 and trims", () => {
  assert.equal(htmlToText("<p>a</p><p></p><p></p><p>b</p>"), "a\n\nb");
  assert.equal(htmlToText("  <p>a</p>  "), "a");
});

test("htmlToText leaves plain text alone and tolerates undefined/empty", () => {
  assert.equal(htmlToText("Plain text\nsecond line"), "Plain text\nsecond line");
  assert.equal(htmlToText(undefined), "");
  assert.equal(htmlToText(""), "");
});

test("htmlToText only strips real tags, never plain-text angle brackets", () => {
  assert.equal(htmlToText("Kids <5 free, adults >12 pay"), "Kids <5 free, adults >12 pay");
  assert.equal(htmlToText("Fee: 1 < 2 and 3 > 2 only"), "Fee: 1 < 2 and 3 > 2 only");
  // Real tags around such text are still stripped; the text between stays.
  assert.equal(htmlToText("<p>Kids <5 free, <b>adults</b> >12 pay</p>"), "Kids <5 free, adults >12 pay");
});

test("htmlToText drops HTML comments", () => {
  assert.equal(htmlToText("a<!-- hidden <b>note</b> -->b"), "ab");
  assert.equal(htmlToText("<p>x</p><!-- c --><p>y</p>"), "x\ny");
  assert.equal(htmlToText("a<!-- <br></p> -->b"), "ab"); // markup inside a comment adds no breaks
});

test("looksLikeHtml detects legacy HTML (leading tag) only", () => {
  assert.equal(looksLikeHtml("<p>x</p>"), true);
  assert.equal(looksLikeHtml("  <h4>x</h4>"), true);
  assert.equal(looksLikeHtml("\n<div>x</div>"), true);
  assert.equal(looksLikeHtml("</p>"), true);
  assert.equal(looksLikeHtml("<!-- c --><p>x</p>"), true);
  // Plain text with angle brackets is text, not HTML.
  assert.equal(looksLikeHtml("Pickup <hotel lobby>"), false);
  assert.equal(looksLikeHtml("a <br> b"), false);
  assert.equal(looksLikeHtml("<5 free"), false);
  assert.equal(looksLikeHtml("plain text"), false);
  assert.equal(looksLikeHtml("1 < 2 and 3 > 2"), false);
  assert.equal(looksLikeHtml(""), false);
});

test("sortItinerary: day-wise first by DAY_NO, undayed after, ties by ID", () => {
  const out = sortItinerary([{ ID: 3 }, { ID: 1, DAY_NO: 2 }, { ID: 2, DAY_NO: 1 }]);
  assert.deepEqual(out.map((i) => i.ID), [2, 1, 3]);
});

test("sortItinerary: treats null/0/NaN DAY_NO as undayed and breaks ties by ID", () => {
  const out = sortItinerary([
    { ID: 9, DAY_NO: null },
    { ID: 8, DAY_NO: 0 },
    { ID: 7, DAY_NO: Number.NaN },
    { ID: 6 },
    { ID: 5, DAY_NO: 1 },
    { ID: 4, DAY_NO: 1 },
  ]);
  assert.deepEqual(out.map((i) => i.ID), [4, 5, 6, 7, 8, 9]);
});

test("sortItinerary does not mutate its input", () => {
  const input = [{ ID: 3 }, { ID: 1, DAY_NO: 2 }, { ID: 2, DAY_NO: 1 }];
  const snapshot = input.map((i) => i.ID);
  const out = sortItinerary(input);
  assert.notEqual(out, input);
  assert.deepEqual(input.map((i) => i.ID), snapshot);
});

test("durationLabel", () => {
  assert.equal(durationLabel(8, 7), "8D / 7N");
  assert.equal(durationLabel(), "");
  assert.equal(durationLabel(1), "1 Day");
  assert.equal(durationLabel(1, 0), "1 Day");
  assert.equal(durationLabel(3), "3 Days");
  assert.equal(durationLabel(3, 0), "3 Days");
  assert.equal(durationLabel(0, 3), "");
  assert.equal(durationLabel(0, 0), "");
  assert.equal(durationLabel(undefined, 2), "");
});

test("cancellationPolicyFor falls back to the default for missing/blank text", () => {
  assert.equal(cancellationPolicyFor({}), DEFAULT_CANCELLATION_POLICY);
  assert.equal(cancellationPolicyFor({ CANCELLATION_POLICY: "  " }), DEFAULT_CANCELLATION_POLICY);
  assert.equal(cancellationPolicyFor({ CANCELLATION_POLICY: "" }), DEFAULT_CANCELLATION_POLICY);
});

test("cancellationPolicyFor returns a custom policy trimmed", () => {
  assert.equal(cancellationPolicyFor({ CANCELLATION_POLICY: " Free until 48h. " }), "Free until 48h.");
});

test("DEFAULT_CANCELLATION_POLICY is the verbatim site copy", () => {
  assert.equal(
    DEFAULT_CANCELLATION_POLICY,
    "If a booking is cancelled after confirmation, 30% of the booking amount is non-refundable and will be deducted as cancellation charges. The remaining 70% will be refunded.",
  );
});

test("hasDayNo / isDayWise: only a positive finite DAY_NO counts", () => {
  assert.equal(hasDayNo(1), true);
  for (const n of [0, -1, null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) assert.equal(hasDayNo(n), false);
  assert.equal(isDayWise([{}, { DAY_NO: null }, { DAY_NO: 0 }]), false);
  assert.equal(isDayWise([{}, { DAY_NO: 3 }]), true);
  assert.equal(isDayWise([]), false);
});

test("textToParagraphs: blank line = paragraph, single newline = line break (CRLF or LF)", () => {
  assert.deepEqual(textToParagraphs("Day one\r\nArrive Jaipur\r\n\r\nDay two"), [["Day one", "Arrive Jaipur"], ["Day two"]]);
  assert.deepEqual(textToParagraphs("a\nb\n\n\n\nc"), [["a", "b"], ["c"]]);
  assert.deepEqual(textToParagraphs("  \r\n x \r\n  "), [["x"]]);
  assert.deepEqual(textToParagraphs(""), []);
  assert.deepEqual(textToParagraphs(undefined), []);
});

test("policySummary: short form for the default, first sentence of a custom policy", () => {
  assert.equal(policySummary(DEFAULT_CANCELLATION_POLICY), "30% non-refundable if cancelled after confirmation.");
  assert.equal(policySummary("Free cancellation until 48h before.\r\nAfter that 50% is charged."), "Free cancellation until 48h before.");
  assert.equal(policySummary("No refunds"), "No refunds");
  assert.equal(policySummary("<p>Refund of 2.5 lakh max. Rest forfeited.</p>"), "Refund of 2.5 lakh max.");
});

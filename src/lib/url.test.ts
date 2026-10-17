import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { mediaAbsoluteUrl } from "./url";

const req = { nextUrl: { origin: "http://req.example:3000" } } as unknown as NextRequest;

test("mediaAbsoluteUrl uses NEXT_PUBLIC_SITE_URL when set, else the request origin", () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://site.example";
    assert.equal(mediaAbsoluteUrl("PromoCode", "x y.png", req), "https://site.example/uploads/PromoCode/x%20y.png");

    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(mediaAbsoluteUrl("pkgTitleImg", "a.jpg", req), "http://req.example:3000/uploads/pkgTitleImg/a.jpg");
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = saved;
  }
});

test("mediaAbsoluteUrl is null without a filename", () => {
  assert.equal(mediaAbsoluteUrl("PromoCode", "", req), null);
  assert.equal(mediaAbsoluteUrl("PromoCode", null, req), null);
  assert.equal(mediaAbsoluteUrl("PromoCode", undefined, req), null);
});

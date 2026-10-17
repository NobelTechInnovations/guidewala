/**
 * Copies the Dekho Rajasthan tour (src/app/tour-packages/dekho-rajasthan/content.ts,
 * the same data the static page renders) into package 19, so /packages/19 shows
 * the real 8-day tour instead of a lone "click for PDF" item.
 *
 * Re-runnable: the package's day-wise items are deleted and re-inserted, so
 * every run ends with the same 8 items. It never touches the title, price,
 * cover image, gallery or brochure.
 *
 * It writes to whatever database MONGODB_URI points at, so it prints the
 * database name first and refuses without --yes. The live database
 * (guidewala_app) additionally needs --production. A MONGODB_URI already in
 * the environment wins over .env.local (which holds the live URI), so for the
 * dev database export that URI first.
 *
 * Usage: npx tsx scripts/seed-dekho-rajasthan.ts --yes [--production]
 */
import { config as loadEnv } from "dotenv";
import path from "path";
loadEnv({ path: path.resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { PackageTitleMaster, PackageDescDetails } from "../src/models";
import { nextNumericId } from "../src/lib/ids";
import {
  EXCLUSIONS,
  HIGHLIGHTS,
  INCLUDES,
  INCLUSIONS,
  ITINERARY,
  NOTES,
  ROUTE_STOPS,
} from "../src/app/tour-packages/dekho-rajasthan/content";

const PKG_ID = 19;
const LIVE_DB = "guidewala_app";

/** Why the run must stop before writing, or null when the flags allow it. */
function refusal(dbName: string, flags: Set<string>): string | null {
  if (!flags.has("--yes")) return "Refusing to write: pass --yes to confirm this is the database you want.";
  if (dbName === LIVE_DB && !flags.has("--production"))
    return `Refusing to write to the live database "${LIVE_DB}": it also needs --production.`;
  return null;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (see .env.example).");

  await mongoose.connect(uri);
  const dbName = mongoose.connection.name;
  console.log(`Target database: ${dbName}`);

  // Read-only: show which package 19 this is (ids can differ between databases)
  // so the operator can confirm it's Dekho Rajasthan; abort if it isn't there.
  const existing = (await PackageTitleMaster.findOne({ PKG_ID }).select("TITLE_NAME -_id").lean()) as {
    TITLE_NAME?: string;
  } | null;
  if (!existing) {
    console.error(`❌ Package ${PKG_ID} does not exist in "${dbName}" — nothing to seed.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Package ${PKG_ID} TITLE_NAME: ${existing.TITLE_NAME ?? "(none)"}`);

  const stop = refusal(dbName, new Set(process.argv.slice(2)));
  if (stop) {
    console.error(`❌ ${stop}`);
    process.exitCode = 1;
    return;
  }

  const nights = ROUTE_STOPS.reduce((sum, s) => sum + s.NIGHTS, 0);
  const fields = {
    DURATION_DAYS: ITINERARY.length,
    DURATION_NIGHTS: nights,
    TOUR_TYPE: "Group Tour",
    PRICE_NOTE: "per person on twin sharing",
    ROUTE: ROUTE_STOPS,
    INCLUDES,
    HIGHLIGHTS,
    INCLUSIONS,
    EXCLUSIONS,
    NOTES,
    SHOW_ON_HOME: "Y",
  };

  // First, so a missing package aborts before any item is touched.
  const pkg = await PackageTitleMaster.updateOne({ PKG_ID }, { $set: fields });
  if (pkg.matchedCount === 0) throw new Error(`Package ${PKG_ID} does not exist in "${dbName}".`);
  console.log(`Package ${PKG_ID}: updated ${fields.DURATION_DAYS}D/${fields.DURATION_NIGHTS}N, ${ROUTE_STOPS.length} route stops.`);

  // Legacy items (no DAY_NO) are the old "click for PDF" entry: hide, don't delete.
  const hidden = await PackageDescDetails.updateMany({ PKG_ID, DAY_NO: null }, { $set: { IS_ACTIVE: "N" } });
  console.log(`Legacy items hidden: ${hidden.matchedCount}`);

  // Day-wise items are fully owned by this script (and test rows): replace them.
  const deleted = await PackageDescDetails.deleteMany({ PKG_ID, DAY_NO: { $ne: null } });
  console.log(`Day-wise items deleted: ${deleted.deletedCount}`);

  for (const d of ITINERARY) {
    await PackageDescDetails.create({
      ID: await nextNumericId(PackageDescDetails, "ID"),
      PKG_ID,
      DAY_NO: d.day,
      ITINERARY: d.title,
      // Transit on its own line above the text, as the static page shows it.
      PACKAGE_DESC: d.transit ? `${d.transit}\n${d.desc}` : d.desc,
      MEALS: d.meals,
      ...(d.stay ? { STAY: d.stay } : {}),
      IS_ACTIVE: "Y",
    });
  }

  const items = await PackageDescDetails.find({ PKG_ID }).sort({ ID: 1 }).lean();
  const days = items.filter((i) => i.DAY_NO != null);
  const legacy = items.filter((i) => i.DAY_NO == null);
  console.log(
    `Package ${PKG_ID} now has ${days.length} day-wise items (days ${days.map((i) => i.DAY_NO).join(",")}; ` +
      `IDs ${days.map((i) => i.ID).join(",")}) and ${legacy.length} legacy item(s), ` +
      `${legacy.filter((i) => i.IS_ACTIVE !== "N").length} of them still shown.`
  );
  console.log("✅ Done.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

/**
 * Wipes EVERY itinerary item (package_desc_details) so the itinerary list can
 * be rebuilt fresh. Packages themselves are not touched. A JSON backup of all
 * items is written to backups/ first, so the wipe can be undone by hand.
 *
 * Run scripts/seed-dekho-rajasthan.ts afterwards to add the Dekho Rajasthan days.
 *
 * Same safety as the seed: prints the database name, refuses without --yes,
 * and the live database (guidewala_app) also needs --production.
 *
 * Usage: npx tsx scripts/reset-itineraries.ts --yes [--production]
 */
import { config as loadEnv } from "dotenv";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
loadEnv({ path: path.resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { PackageDescDetails } from "../src/models";

const LIVE_DB = "guidewala_app";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (see .env.example).");

  await mongoose.connect(uri);
  const dbName = mongoose.connection.name;
  const items = await PackageDescDetails.find({}).lean();
  console.log(`Target database: ${dbName} — ${items.length} itinerary items`);

  const flags = new Set(process.argv.slice(2));
  if (!flags.has("--yes")) return fail("Refusing to write: pass --yes to confirm this is the database you want.");
  if (dbName === LIVE_DB && !flags.has("--production"))
    return fail(`Refusing to write to the live database "${LIVE_DB}": it also needs --production.`);

  const dir = path.resolve(__dirname, "../backups");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `package_desc_details-${dbName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(file, JSON.stringify(items, null, 2));
  console.log(`Backup written: ${file}`);

  const { deletedCount } = await PackageDescDetails.deleteMany({});
  console.log(`✅ Deleted ${deletedCount} itinerary items.`);
}

function fail(msg: string) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

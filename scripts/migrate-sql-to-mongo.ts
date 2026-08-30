/**
 * One-time data migration: SQL Server (GUIDEWALA_DB) -> MongoDB.
 *
 * Read-only against SQL Server — never writes back to it. Safe to re-run:
 * each collection is cleared and re-seeded from the current SQL snapshot.
 *
 * Usage:
 *   npx tsx scripts/migrate-sql-to-mongo.ts
 *
 * Requires (in .env.local or the environment):
 *   SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD   — source SQL Server
 *   MONGODB_URI                                        — target MongoDB
 */
import { config as loadEnv } from "dotenv";
import path from "path";
loadEnv({ path: path.resolve(__dirname, "../.env.local") });

import sql from "mssql";
import mongoose from "mongoose";
import {
  CityMaster,
  CountryMaster,
  StateMaster,
  LanguageMaster,
  GuideDetails,
  PackageTitleMaster,
  PackageDescDetails,
  PkgBookingDetails,
  TaxiBookingDetails,
  HotelMaster,
  HotelBookingDetails,
  PromoCodeMaster,
  CouponSendToMail,
  UsersLogin,
  VendorTypeMaster,
  VendorDetails,
  VendorLogin,
  VendorCustDetails,
} from "../src/models";

const sqlConfig: sql.config = {
  server: process.env.SQL_SERVER || "103.30.72.145",
  database: process.env.SQL_DATABASE || "GUIDEWALA_DB",
  user: process.env.SQL_USER || "GuideUserDB",
  password: process.env.SQL_PASSWORD || "",
  options: { encrypt: false, trustServerCertificate: true, connectTimeout: 15000 },
};

// Table -> Mongo model mapping. Order matters only for readability here;
// each table migrates independently.
const TABLES: { table: string; model: mongoose.Model<any> }[] = [
  { table: "CITIES_MASTER", model: CityMaster },
  { table: "COUNTRY_MASTER", model: CountryMaster },
  { table: "STATES_MASTER", model: StateMaster },
  { table: "LANGUAGE_MASTER", model: LanguageMaster },
  { table: "GUIDE_DETAILS", model: GuideDetails },
  { table: "PACKAGE_TITLE_MASTER", model: PackageTitleMaster },
  { table: "PACKAGE_DESC_DETAILS", model: PackageDescDetails },
  { table: "PKG_BOOKING_DETAILS", model: PkgBookingDetails },
  { table: "TAXI_BOOKING_DETAILS", model: TaxiBookingDetails },
  { table: "HOTEL_MASTER", model: HotelMaster },
  { table: "HOTEL_BOOKING_DETAILS", model: HotelBookingDetails },
  { table: "PROMO_CODE_MASTER", model: PromoCodeMaster },
  { table: "COUPON_SEND_TO_MAIL", model: CouponSendToMail },
  { table: "USERS_LOGIN", model: UsersLogin },
  { table: "VENDOR_TYPE_MASTER", model: VendorTypeMaster },
  { table: "VENDOR_DETAILS", model: VendorDetails },
  { table: "VENDOR_LOGIN", model: VendorLogin },
  { table: "VENDOR_CUST_DETAILS", model: VendorCustDetails },
];

async function main() {
  if (!process.env.SQL_PASSWORD) {
    console.error(
      "❌ SQL_PASSWORD not set. Put SQL_SERVER/SQL_DATABASE/SQL_USER/SQL_PASSWORD in .env.local before running this."
    );
    process.exit(1);
  }

  console.log(`Connecting to SQL Server ${sqlConfig.server}/${sqlConfig.database} (read-only)...`);
  const pool = await sql.connect(sqlConfig);
  console.log("✅ SQL Server connected");

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("✅ MongoDB connected");

  let totalRows = 0;

  for (const { table, model } of TABLES) {
    const result = await pool.request().query(`SELECT * FROM [${table}]`);
    const rows = result.recordset;

    // Wipe and re-seed this collection only — never touches SQL Server.
    await model.deleteMany({});
    if (rows.length > 0) {
      await model.insertMany(rows, { ordered: false });
    }

    console.log(`  ${table.padEnd(24)} -> ${String(rows.length).padStart(5)} rows migrated`);
    totalRows += rows.length;
  }

  console.log(`\n✅ Done. ${totalRows} total rows migrated across ${TABLES.length} collections.`);
  console.log(
    "⚠  USERS_LOGIN / VENDOR_LOGIN passwords were copied as plaintext (source system stored them that way)."
  );
  console.log("   Rehash them (e.g. bcrypt) before this app relies on them for auth.");

  await pool.close();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

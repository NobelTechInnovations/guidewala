import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Set it in .env.local (see .env.example)."
  );
}

/**
 * Cache the connection across hot-reloads in dev and across serverless
 * invocations in prod, so we don't open a new connection per request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Don't cache a failed connection attempt — otherwise every future call
    // in this process replays the same rejection forever, even after the
    // database comes back (e.g. Mongo restarts but the Node process doesn't).
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

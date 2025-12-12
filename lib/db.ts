import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Use globalThis and a fixed type, no undefined
declare global {
  var mongoose: MongooseCache;
}

// Initialize the cache
const globalMongoose: MongooseCache = globalThis.mongoose || {
  conn: null,
  promise: null,
};
globalThis.mongoose = globalMongoose;

export async function connectToDatabase(): Promise<Connection> {
  if (globalMongoose.conn) return globalMongoose.conn;

  if (!globalMongoose.promise) {
    globalMongoose.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m.connection);
  }

  try {
    globalMongoose.conn = await globalMongoose.promise;
  } catch (err) {
    globalMongoose.promise = null;
    throw err;
  }

  return globalMongoose.conn;
}

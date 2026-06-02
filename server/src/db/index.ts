import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    '⚠️  DATABASE_URL not set — running in demo mode with placeholder data'
  );
}

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!DATABASE_URL) return null;

  if (!db) {
    const connection = await mysql.createConnection(DATABASE_URL);
    db = drizzle(connection);
  }
  return db;
}

export function isDemoMode() {
  return !DATABASE_URL;
}

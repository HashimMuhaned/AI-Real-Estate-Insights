import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);

export const db = drizzle(sql);

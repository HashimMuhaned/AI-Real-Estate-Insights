import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const mode = process.env.DB_MODE ?? "local";

let db: any;

// ==========================
// 🧑‍💻 LOCAL DB (fast dev)
// ==========================
if (mode === "local") {
  const sql = postgres(process.env.DB_URL_LOCAL!, {
    max: 10,
  });

  db = drizzle(sql);
}

// ==========================
// 🌍 NEON DB (bypass uni + production)
// ==========================
else {
  const sql = neon(process.env.DB_URL!);

  const baseDb = drizzleNeon(sql);

  // ✅ SAFE execute wrapper (NO recursion)
  const originalExecute = baseDb.execute.bind(baseDb);

  db = Object.assign(baseDb, {
    async execute<T = any>(query: any): Promise<T[]> {
      const result = await originalExecute(query);
      return result.rows as T[];
    },
  });
}

export { db };
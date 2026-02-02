import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
const sql_demo_projects = postgres(process.env.NEXT_PUBLIC_DRIZZLE_DB_DEMO_PROJECTS_URL)

export const db = drizzle(sql);
export const db_demo_projects = drizzle(sql_demo_projects)

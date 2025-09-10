// db.js
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGSQL_USER,
  host: process.env.PGSQL_HOST,
  database: process.env.PGSQL_DB_NAME,
  password: process.env.PGSQL_PASS,
  port: 5432,
});

// Test connection on startup
pool
  .connect()
  .then((client: any) => {
    console.log("Database connected successfully");
    client.release();
  })
  .catch((err: any) => {
    console.error("Database connection failed:", err.message);
  });

export default pool;

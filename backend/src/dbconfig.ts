import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.NEON_DB_CONNECTION_PRODUCTION,
// });

const pool = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASS,
  host: process.env.PGSQL_HOST,
  port: Number(process.env.PGSQL_PORT),
  database: process.env.PGSQL_DB_NAME,
});

pool
  .connect()
  .then((client) => {
    console.log(`✅ Connected to Local DB successfully`);
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

export default pool;

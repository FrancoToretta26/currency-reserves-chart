import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

let password = process.env.REDSHIFT_PASSWORD || "";
password = password.replace(/\\/g, "");



const pool = new Pool({
  host: process.env.REDSHIFT_HOST,
  port: parseInt(process.env.REDSHIFT_PORT || "5439"),
  database: process.env.REDSHIFT_DB,
  user: process.env.REDSHIFT_USER,
  password: password,
  ssl: true,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

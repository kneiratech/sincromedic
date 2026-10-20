import { Pool } from "pg";
import { connection } from "next/server";

// Reutiliza el pool entre recargas en desarrollo
const globalForPg = globalThis;
const pool =
  globalForPg.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    options: "-c timezone=America/Lima",
  });
if (process.env.NODE_ENV !== "production") globalForPg.__pgPool = pool;

export async function query(text, params = []) {
  await connection(); // los datos siempre se leen en cada request
  const { rows } = await pool.query(text, params);
  return rows;
}

export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// Para Server Actions (sin connection())
export async function exec(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

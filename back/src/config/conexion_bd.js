import { createPool } from "mysql2/promise";
import "dotenv/config";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

export const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


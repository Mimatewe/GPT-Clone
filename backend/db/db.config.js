import mysql from "mysql2/promise";
import env from "../src/config/env.js";

// Teacher note:
// A connection pool keeps several reusable MySQL connections ready.
// This is better than opening a brand-new database connection for every request.
const db = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  enableKeepAlive: true,
  ssl: env.db.ssl ? { rejectUnauthorized: true } : undefined,
});

export default db;

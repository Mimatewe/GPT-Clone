import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.config.js";

// Teacher note:
// migrate.js reads schema.sql and runs it against MySQL.
// You use this when setting up the database tables for the project.
const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, "schema.sql");

function splitStatements(sql) {
  // schema.sql can contain multiple SQL statements separated by semicolons.
  // This simple splitter is enough for this project because the schema is small.
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

try {
  const schema = await readFile(schemaPath, "utf8");
  const statements = splitStatements(schema);

  // Run every CREATE TABLE statement in order.
  for (const statement of statements) {
    await db.execute(statement);
  }

  console.log(`Applied ${statements.length} migration statements.`);
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}

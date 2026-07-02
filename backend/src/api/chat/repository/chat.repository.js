import db from "../../../../db/db.config.js";

// Teacher note:
// Repository functions are the database layer. They contain SQL and return
// JavaScript objects that the rest of the app can use.
function mapConversation(row) {
  // MySQL uses snake_case field names. The API sends camelCase field names.
  // This mapper is the bridge between database shape and frontend shape.
  return {
    id: Number(row.id),
    role: row.role,
    content: row.content,
    tokenCount: row.token_count || 0,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  };
}

export async function listRecentConversations(limit) {
  // We ask MySQL for newest rows first because that is efficient with IDs.
  // Then we reverse below so the chat UI displays oldest-to-newest.
  const [rows] = await db.query(
    `
    SELECT id, role, content, token_count, created_at
    FROM conversations
    ORDER BY id DESC
    LIMIT ?
    `,
    [limit]
  );

  return rows.reverse().map(mapConversation);
}

export async function insertConversation({ role, content, tokenCount = 0 }) {
  // Parameter placeholders (?) protect the query from SQL injection.
  // Never build SQL by directly joining user input into the string.
  const [result] = await db.execute(
    `
    INSERT INTO conversations (role, content, token_count)
    VALUES (?, ?, ?)
    `,
    [role, content, tokenCount]
  );

  // After insert, fetch the saved row back from MySQL.
  // This gives the frontend the real id and createdAt timestamp.
  const [rows] = await db.query(
    `
    SELECT id, role, content, token_count, created_at
    FROM conversations
    WHERE id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  return mapConversation(rows[0]);
}

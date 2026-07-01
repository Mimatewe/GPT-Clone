-- Teacher note:
-- The conversations table stores every visible chat message.
-- A user question and an assistant answer are two separate rows.
CREATE TABLE IF NOT EXISTS conversations (
  -- id is the primary key. AUTO_INCREMENT lets MySQL create the next number.
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  -- role tells the frontend which side of the chat bubble to render.
  role ENUM('user', 'assistant') NOT NULL,
  -- content holds the actual message text.
  content LONGTEXT NOT NULL,
  -- token_count stores AI usage when Gemini provides it. User rows use 0.
  token_count INT UNSIGNED NOT NULL DEFAULT 0,
  -- created_at records when the row was inserted.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Indexes help MySQL read recent rows faster as the table grows.
  INDEX idx_conversations_created_at (created_at),
  INDEX idx_conversations_id_role (id, role)
);

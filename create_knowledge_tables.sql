-- Create the knowledge_bases table if it doesn't exist
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create the knowledge_base_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  knowledge_base_id INTEGER NOT NULL,
  document_path TEXT NOT NULL,
  document_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);

-- Create the knowledge_base_chunks table if it doesn't exist
CREATE TABLE IF NOT EXISTS knowledge_base_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  knowledge_base_id INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  text_chunk TEXT NOT NULL,
  embedding BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
); 
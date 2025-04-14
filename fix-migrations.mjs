import Database from 'better-sqlite3'; 
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.env.HOME, 'Library/Preferences/souls/data.db');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

// Create the knowledge_bases table if it doesn't exist
const createTableSql = `
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);`;

try {
  const result = db.exec(createTableSql);
  console.log('Table created successfully');
  console.log('Tables in database:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(tables);
} catch (error) {
  console.error('Error creating table:', error);
}

db.close(); 
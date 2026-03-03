const Database = require('better-sqlite3');
const path = require('path');

// Use /data on Render (persistent disk), otherwise use local __dirname
const dbDir = process.env.NODE_ENV === 'production' ? '/data' : __dirname;
const dbPath = path.join(dbDir, 'water_data.sqlite');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;

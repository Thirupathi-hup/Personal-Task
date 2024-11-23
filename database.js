const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./notes.db');

// Create the table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'Others',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Create a new note
app.post('/notes', (req, res) => {
    const { title, description, category } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
    }

    const stmt = db.prepare('INSERT INTO notes (title, description, category) VALUES (?, ?, ?)');
    stmt.run(title, description, category || 'Others', function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to create note." });
        }
        res.status(201).json({ id: this.lastID, title, description, category });
    });
});

// Get all notes
app.get('/notes', (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM notes WHERE 1=1';
    let params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND title LIKE ?';
        params.push(`%${search}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch notes." });
        }
        res.json(rows);
    });
});

// Update a note
app.put('/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
    }

    const stmt = db.prepare('UPDATE notes SET title = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(title, description, category || 'Others', id, function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to update note." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Note not found." });
        }
        res.json({ id, title, description, category });
    });
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id, function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to delete note." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Note not found." });
        }
        res.json({ message: "Note deleted successfully." });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('./stock.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      qty INTEGER,
      price REAL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create default admin if doesn't exist
  db.get("SELECT * FROM users WHERE email = ?", ['admin@admin.com'], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ['Admin User', 'admin@admin.com', 'admin123', 'admin'],
        (err) => {
          if (!err) console.log('Default admin user created');
        }
      );
    }
  });
});

// Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Auth endpoints
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, 'user'],
    function(err) {
      if (err) {
        res.status(400).json({ message: 'Email already exists' });
      } else {
        res.json({ 
          user: { id: this.lastID, name, email, role: 'user' } 
        });
      }
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err || !row) {
        res.status(401).json({ message: 'Invalid email or password' });
      } else {
        res.json({ user: row });
      }
    }
  );
});

// Items endpoints
app.get('/api/items', (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error fetching items' });
    } else {
      res.json(rows || []);
    }
  });
});

app.post('/api/items', (req, res) => {
  const { name, sku, qty, price, category } = req.body;
  const userId = 1; // In a real app, get from authenticated user

  db.run(
    "INSERT INTO items (user_id, name, sku, qty, price, category) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, name, sku, qty, price, category],
    function(err) {
      if (err) {
        res.status(500).json({ message: 'Error adding item' });
      } else {
        res.json({ id: this.lastID, user_id: userId, name, sku, qty, price, category });
      }
    }
  );
});

app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, sku, qty, price, category } = req.body;

  db.run(
    "UPDATE items SET name = ?, sku = ?, qty = ?, price = ?, category = ? WHERE id = ?",
    [name, sku, qty, price, category, id],
    (err) => {
      if (err) {
        res.status(500).json({ message: 'Error updating item' });
      } else {
        res.json({ message: 'Item updated' });
      }
    }
  );
});

app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM items WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ message: 'Error deleting item' });
    } else {
      res.json({ message: 'Item deleted' });
    }
  });
});

// User endpoints
app.get('/api/users', (req, res) => {
  db.all("SELECT id, name, email, role FROM users", (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error fetching users' });
    } else {
      res.json(rows || []);
    }
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  // Delete user's items first
  db.run("DELETE FROM items WHERE user_id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ message: 'Error deleting user items' });
      return;
    }

    // Delete user
    db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) {
        res.status(500).json({ message: 'Error deleting user' });
      } else {
        res.json({ message: 'User deleted' });
      }
    });
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

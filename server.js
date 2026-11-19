import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database file (restaurant.db)
const db = new Database('restaurant.db');

// Create tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chinese_name TEXT,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'Preparing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default menu items if table is empty
const rowCount = db.prepare('SELECT count(*) as count FROM menu').get();
if (rowCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO menu (name, chinese_name, category, price, description, image) 
    VALUES (@name, @chinese_name, @category, @price, @description, @image)
  `);

  const initialItems = [
    {
      name: 'Crystal Shrimp Har Gow',
      chinese_name: '水晶虾饺',
      category: 'DIM SUM',
      price: 8.50,
      description: 'Translucent steamed dumplings filled with whole succulent shrimp and bamboo shoots.',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Pork & Shrimp Siu Mai',
      chinese_name: '鲜虾烧卖',
      category: 'DIM SUM',
      price: 7.95,
      description: 'Open-topped steamed dumplings filled with seasoned pork, shrimp, and tobiko roe.',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Signature Xiao Long Bao',
      chinese_name: '小笼汤包',
      category: 'XIAOLONGBAO',
      price: 9.50,
      description: 'Delicate soup dumplings packed with savory pork filling and rich, hot ginger broth.',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Szechuan Dan Dan Noodles',
      chinese_name: '四川担担面',
      category: 'NOODLES',
      price: 11.25,
      description: 'Springy hand-pulled noodles topped with spicy minced pork, chili oil, scallions, and crushed peanuts.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Classic Chicken Chow Mein',
      chinese_name: '鸡肉炒面',
      category: 'CHOW MEIN',
      price: 10.75,
      description: 'Wok-tossed egg noodles with tender chicken strips, bok choy, bean sprouts, and dark soy.',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80'
    }
  ];

  initialItems.forEach(item => insert.run(item));
  console.log('🌱 SQLite: Default menu items populated.');
}

// --- API Endpoints ---

// 1. Get all menu items
app.get('/api/menu', (req, res) => {
  const items = db.prepare('SELECT * FROM menu').all();
  res.json(items);
});

// 2. Place an order (Saves into SQLite)
app.post('/api/orders', (req, res) => {
  const { customer_name, items, total } = req.body;
  if (!customer_name || !items || !items.length) {
    return res.status(400).json({ error: 'Customer name and items are required' });
  }

  const insert = db.prepare(`
    INSERT INTO orders (customer_name, items, total)
    VALUES (?, ?, ?)
  `);

  const info = insert.run(customer_name, JSON.stringify(items), total);
  res.json({ success: true, orderId: info.lastInsertRowid });
});

// 3. Get recent orders from SQLite
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all();
  const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
  res.json(parsed);
});

app.listen(PORT, () => {
  console.log(`🚀 SQLite backend running on http://localhost:${PORT}`);
});
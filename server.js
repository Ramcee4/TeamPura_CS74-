import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Automatically redirect root (localhost:5000) straight to the Vite kiosk frontend!
app.get('/', (req, res) => res.redirect('http://localhost:5173'));

// Initialize SQLite database (restaurant.db)
const db = new Database('restaurant.db');
db.pragma('journal_mode = WAL');

// ==========================================
// 1. CREATE EMPTY TABLES (ZERO SEED DATA)
// ==========================================
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    contact_number TEXT NOT NULL,
    points INTEGER DEFAULT 50,
    lifetime_points INTEGER DEFAULT 50,
    orders_count INTEGER DEFAULT 0,
    member_tier TEXT DEFAULT 'Silver',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chinese_name TEXT,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    tag TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    items TEXT NOT NULL,
    dining_option TEXT NOT NULL DEFAULT 'dine-in',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    subtotal REAL NOT NULL,
    service_fee REAL NOT NULL,
    total REAL NOT NULL,
    points_earned INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS treats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    cost_points INTEGER NOT NULL,
    icon_type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    treat_title TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ SQLite: Tables created. Database is 100% empty and ready for Admin and Students.');

// ==========================================
// 2. API ENDPOINTS (STORES REAL DATA ONLY)
// ==========================================

// --- MENU (ADDED ONLY BY ADMIN) ---

// 1. Get all menu items
app.get('/api/menu', (req, res) => {
  const items = db.prepare('SELECT * FROM menu ORDER BY id DESC').all();
  res.json(items);
});

// 2. Admin adds a product item into SQLite
app.post('/api/menu', (req, res) => {
  const { name, chinese_name, category, price, description, image, tag } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, Category, and Price are required.' });
  }

  const defaultImage = 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80';

  const insert = db.prepare(`
    INSERT INTO menu (name, chinese_name, category, price, description, image, tag)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = insert.run(
    name,
    chinese_name || '',
    category,
    parseFloat(price),
    description || '',
    image || defaultImage,
    tag || ''
  );

  const newItem = db.prepare('SELECT * FROM menu WHERE id = ?').get(info.lastInsertRowid);
  res.json({ success: true, item: newItem });
});

// 3. Admin deletes a product item from SQLite
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM menu WHERE id = ?').run(id);
  res.json({ success: true, message: 'Item deleted.' });
});

// --- STUDENTS (ADDED ONLY VIA REGISTRATION) ---

// 4. Student Login (Checks if 7-digit Student ID exists in SQLite)
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);

  if (!student) {
    return res.status(404).json({ error: 'Student ID not registered. Please register first.' });
  }
  res.json(student);
});

// 5. Student Registration (Stores real student in SQLite with 50 welcome points)
app.post('/api/students/register', (req, res) => {
  const { id, name, email, contact_number } = req.body;
  if (!id || !name || !contact_number) {
    return res.status(400).json({ error: 'ID, Name, and Contact Number are required.' });
  }

  try {
    db.prepare(`
      INSERT INTO students (id, name, email, contact_number, points, lifetime_points, orders_count, member_tier)
      VALUES (?, ?, ?, ?, 50, 50, 0, 'Silver')
    `).run(id, name, email || '', contact_number);

    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json({ success: true, student: newStudent });
  } catch (err) {
    res.status(400).json({ error: 'This Student ID is already registered!' });
  }
});

// --- ORDERS (CASH OR GCASH + POINTS EARNING) ---

// 6. Place Order with Cash or GCash and award reward points
app.post('/api/orders', (req, res) => {
  const { student_id, items, dining_option, payment_method, total } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order items are required.' });
  }

  const subtotal = total / 1.05;
  const serviceFee = total - subtotal;
  // Award 1 point per ₱100 spent (minimum 1 point for any order)
  const pointsEarned = Math.max(1, Math.floor(total / 100));

  const orderResult = db.prepare(`
    INSERT INTO orders (student_id, items, dining_option, payment_method, subtotal, service_fee, total, points_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student_id || 'GUEST',
    JSON.stringify(items),
    dining_option || 'dine-in',
    payment_method || 'cash',
    subtotal,
    serviceFee,
    total,
    pointsEarned
  );

  // Update registered student's accumulated points in SQLite
  if (student_id && student_id !== 'GUEST') {
    db.prepare(`
      UPDATE students 
      SET points = points + ?, 
          lifetime_points = lifetime_points + ?,
          orders_count = orders_count + 1
      WHERE id = ?
    `).run(pointsEarned, pointsEarned, student_id);
  }

  const updatedStudent = (student_id && student_id !== 'GUEST')
    ? db.prepare('SELECT * FROM students WHERE id = ?').get(student_id)
    : {
        id: 'GUEST',
        name: 'Guest',
        points: 0,
        lifetime_points: 0,
        orders_count: 1
      };

  res.json({
    success: true,
    orderId: orderResult.lastInsertRowid,
    pointsEarned,
    updatedStudent,
    student: updatedStudent
  });
});

// 7. Get recent orders log
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all();
  const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
  res.json(parsed);
});

// 8. Redeem a treat using student points
app.post('/api/treats/redeem', (req, res) => {
  const { student_id, treat_title, points_cost } = req.body;
  if (!student_id || !treat_title || !points_cost) {
    return res.status(400).json({ error: 'Missing redemption details.' });
  }

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  if (student.points < points_cost) {
    return res.status(400).json({ error: 'Not enough points to redeem this treat.' });
  }

  db.prepare('UPDATE students SET points = points - ? WHERE id = ?').run(points_cost, student_id);
  db.prepare('INSERT INTO redemptions (student_id, treat_title, points_spent) VALUES (?, ?, ?)').run(
    student_id,
    treat_title,
    points_cost
  );

  const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
  res.json({ success: true, updatedStudent, student: updatedStudent });
});

app.listen(PORT, () => {
  console.log(`🚀 MING 24 Server running on http://localhost:${PORT}`);
});
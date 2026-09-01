const express = require('express');
const cors = require('cors');
const path = require('path');
const { initialProducts, initialOrders, initialVisionFeeds } = require('./data');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Data Stores
let products = [...initialProducts];
let orders = [...initialOrders];
let visionFeeds = [...initialVisionFeeds];
let aiLogs = [
  { id: 1, timestamp: new Date().toLocaleTimeString(), message: "AI Shelf Camera 1: Stock drop detected for Headphones", level: "warning" },
  { id: 2, timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), message: "POS Kiosk #1: AI Visual checkout auto-scanned 2 items", level: "info" },
  { id: 3, timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), message: "Entrance AI: Footfall peak (+14 shoppers in last 10m)", level: "success" }
];

// --- PRODUCTS API ---
app.get('/api/products', (req, res) => {
  const { category, search, stockStatus } = req.query;
  let filtered = [...products];

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q));
  }

  if (stockStatus) {
    if (stockStatus === 'low') filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.minStock);
    if (stockStatus === 'out') filtered = filtered.filter(p => p.stock === 0);
    if (stockStatus === 'in') filtered = filtered.filter(p => p.stock > p.minStock);
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, data: product });
});

app.post('/api/products', (req, res) => {
  const { name, category, price, stock, minStock, image, sku, barcode } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, error: 'Name and price are required' });
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    sku: sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
    barcode: barcode || `${Math.floor(10000000 + Math.random() * 90000000)}`,
    category: category || 'General',
    price: parseFloat(price),
    stock: parseInt(stock) || 0,
    minStock: parseInt(minStock) || 5,
    image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
    aiTag: name.toLowerCase().replace(/\s+/g, '_')
  };

  products.unshift(newProduct);
  
  aiLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    message: `Inventory: New product '${name}' registered into database`,
    level: "info"
  });

  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Product not found' });

  const current = products[index];
  const updated = {
    ...current,
    ...req.body,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : current.price,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock) : current.stock,
    minStock: req.body.minStock !== undefined ? parseInt(req.body.minStock) : current.minStock
  };

  products[index] = updated;
  res.json({ success: true, data: updated });
});

app.patch('/api/products/:id/stock', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const { delta } = req.body;
  product.stock = Math.max(0, product.stock + parseInt(delta || 0));

  if (product.stock <= product.minStock) {
    aiLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message: `AI Alert: '${product.name}' stock level (${product.stock}) fell below threshold (${product.minStock})`,
      level: "warning"
    });
  }

  res.json({ success: true, data: product });
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Product not found' });

  const deleted = products.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

// --- ORDERS & POS API ---
app.get('/api/orders', (req, res) => {
  res.json({ success: true, count: orders.length, data: orders });
});

app.post('/api/orders', (req, res) => {
  const { items, paymentMethod, customer, discount = 0, checkoutType = "AI POS" } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
  }

  let subtotal = 0;
  const processedItems = [];

  // Deduct inventory stock
  for (const cartItem of items) {
    const p = products.find(prod => prod.id === cartItem.id);
    if (p) {
      const qty = cartItem.quantity || 1;
      p.stock = Math.max(0, p.stock - qty);
      subtotal += p.price * qty;
      processedItems.push({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: qty
      });

      if (p.stock <= p.minStock) {
        aiLogs.unshift({
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: `AI Inventory: Low stock warning triggered for '${p.name}' (${p.stock} remaining)`,
          level: "warning"
        });
      }
    }
  }

  const tax = subtotal * 0.08; // 8% sales tax
  const discAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal + tax - discAmount);

  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    customer: customer || 'Walk-in Shopper',
    items: processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    paymentMethod: paymentMethod || 'Contactless Card',
    status: 'Completed',
    checkoutType
  };

  orders.unshift(newOrder);

  aiLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    message: `POS Transaction Completed: Order #${newOrder.id} - Total $${newOrder.total.toFixed(2)} via ${newOrder.paymentMethod}`,
    level: "success"
  });

  res.status(201).json({ success: true, data: newOrder });
});

// --- ANALYTICS API ---
app.get('/api/analytics', (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeCameras = visionFeeds.length;

  // Category sales breakdown
  const categorySales = {};
  orders.forEach(ord => {
    ord.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      const cat = prod ? prod.category : 'General';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Sales Trend Mock Points
  const salesTrend = [
    { label: '09:00', sales: 120 },
    { label: '11:00', sales: 340 },
    { label: '13:00', sales: 580 },
    { label: '15:00', sales: 420 },
    { label: '17:00', sales: 790 },
    { label: '19:00', sales: parseFloat(totalRevenue.toFixed(2)) }
  ];

  // Footfall hourly statistics
  const footfall = [
    { hour: '8 AM', count: 18 },
    { hour: '10 AM', count: 45 },
    { hour: '12 PM', count: 92 },
    { hour: '2 PM', count: 74 },
    { hour: '4 PM', count: 110 },
    { hour: '6 PM', count: 145 },
    { hour: '8 PM', count: 68 }
  ];

  res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        lowStockCount,
        activeCameras,
        customerFootfallToday: 552
      },
      categorySales,
      salesTrend,
      footfall,
      recentLogs: aiLogs.slice(0, 10)
    }
  });
});

// --- AI VISION & CAMERA SIMULATOR API ---
app.get('/api/vision', (req, res) => {
  res.json({ success: true, feeds: visionFeeds, logs: aiLogs.slice(0, 15) });
});

app.post('/api/vision/simulate-scan', (req, res) => {
  // Randomly pick 2 to 3 available products to simulate AI visual scanner output
  const count = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const detected = shuffled.slice(0, count).map(p => ({
    product: p,
    confidence: (0.92 + Math.random() * 0.07).toFixed(2),
    quantity: 1
  }));

  aiLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    message: `AI Vision Checkout: Detected ${detected.length} items on scanning tray automatically`,
    level: "info"
  });

  res.json({ success: true, detectedItems: detected });
});

// Catch-all fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🛒 Smart Retail System running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`=================================================`);
});

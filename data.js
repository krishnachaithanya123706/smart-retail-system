const initialProducts = [
  {
    id: "prod-1",
    name: "Smart Watch Series 7",
    sku: "SKU-88219",
    category: "Electronics",
    price: 299.99,
    stock: 18,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
    aiTag: "smartwatch",
    barcode: "88219001"
  },
  {
    id: "prod-2",
    name: "Organic Whole Milk 1L",
    sku: "SKU-10492",
    category: "Groceries",
    price: 4.49,
    stock: 42,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80",
    aiTag: "milk_carton",
    barcode: "10492002"
  },
  {
    id: "prod-3",
    name: "Wireless Headphones Pro",
    sku: "SKU-49201",
    category: "Electronics",
    price: 189.50,
    stock: 4,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    aiTag: "headphones",
    barcode: "49201003"
  },
  {
    id: "prod-4",
    name: "Artisanal Coffee Beans 500g",
    sku: "SKU-30211",
    category: "Groceries",
    price: 16.99,
    stock: 25,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format&fit=crop&q=80",
    aiTag: "coffee_bag",
    barcode: "30211004"
  },
  {
    id: "prod-5",
    name: "Ergonomic Mechanical Keyboard",
    sku: "SKU-77402",
    category: "Electronics",
    price: 129.00,
    stock: 12,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80",
    aiTag: "keyboard",
    barcode: "77402005"
  },
  {
    id: "prod-6",
    name: "Fresh Green Apples (1kg)",
    sku: "SKU-11093",
    category: "Produce",
    price: 5.29,
    stock: 65,
    minStock: 20,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80",
    aiTag: "apples",
    barcode: "11093006"
  },
  {
    id: "prod-7",
    name: "Stainless Steel Water Bottle",
    sku: "SKU-66320",
    category: "Apparel & Lifestyle",
    price: 24.95,
    stock: 3,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop&q=80",
    aiTag: "water_bottle",
    barcode: "66320007"
  },
  {
    id: "prod-8",
    name: "4K AI Security Camera",
    sku: "SKU-99401",
    category: "Electronics",
    price: 149.99,
    stock: 9,
    minStock: 4,
    image: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&auto=format&fit=crop&q=80",
    aiTag: "security_camera",
    barcode: "99401008"
  }
];

const initialOrders = [
  {
    id: "ORD-9201",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: "Walk-in Customer",
    items: [
      { id: "prod-1", name: "Smart Watch Series 7", price: 299.99, quantity: 1 },
      { id: "prod-4", name: "Artisanal Coffee Beans 500g", price: 16.99, quantity: 2 }
    ],
    subtotal: 333.97,
    tax: 26.72,
    discount: 10.00,
    total: 350.69,
    paymentMethod: "Contactless Card",
    status: "Completed",
    checkoutType: "AI Smart Scanner"
  },
  {
    id: "ORD-9200",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: "VIP Loyalty #402",
    items: [
      { id: "prod-5", name: "Ergonomic Mechanical Keyboard", price: 129.00, quantity: 1 },
      { id: "prod-7", name: "Stainless Steel Water Bottle", price: 24.95, quantity: 1 }
    ],
    subtotal: 153.95,
    tax: 12.32,
    discount: 15.00,
    total: 151.27,
    paymentMethod: "AI FacePay",
    status: "Completed",
    checkoutType: "Automated Self-Checkout"
  },
  {
    id: "ORD-9199",
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    customer: "Walk-in Customer",
    items: [
      { id: "prod-2", name: "Organic Whole Milk 1L", price: 4.49, quantity: 3 },
      { id: "prod-6", name: "Fresh Green Apples (1kg)", price: 5.29, quantity: 2 }
    ],
    subtotal: 24.05,
    tax: 1.92,
    discount: 0.00,
    total: 25.97,
    paymentMethod: "Apple Pay",
    status: "Completed",
    checkoutType: "Standard POS"
  }
];

const initialVisionFeeds = [
  {
    id: "cam-1",
    name: "Shelf A1 - Electronics",
    status: "Active",
    fps: 30,
    resolution: "1080p AI",
    detectedObjects: [
      { label: "Smart Watch Series 7", confidence: 0.98, box: [15, 20, 35, 45], alert: false },
      { label: "Wireless Headphones", confidence: 0.94, box: [55, 30, 78, 65], alert: true, alertReason: "Low Stock Trigger" }
    ]
  },
  {
    id: "cam-2",
    name: "Smart POS Express Kiosk #1",
    status: "Active",
    fps: 60,
    resolution: "4K Vision",
    detectedObjects: [
      { label: "Customer Detected", confidence: 0.99, box: [10, 10, 90, 85], alert: false },
      { label: "Coffee Beans Bag", confidence: 0.96, box: [40, 50, 65, 75], alert: false }
    ]
  },
  {
    id: "cam-3",
    name: "Entrance & Footfall AI Scanner",
    status: "Active",
    fps: 30,
    resolution: "1080p AI",
    detectedObjects: [
      { label: "Person (Inbound)", confidence: 0.97, box: [20, 15, 50, 80], alert: false },
      { label: "Person (Outbound)", confidence: 0.92, box: [60, 20, 88, 85], alert: false }
    ]
  }
];

module.exports = {
  initialProducts,
  initialOrders,
  initialVisionFeeds
};

# 🛒 Smart Retail System (AI POS, Inventory, Vision & White-Background UI)

A full-stack **Smart Retail Platform** featuring an Express.js REST API backend, a light & crisp **white-background SPA frontend**, Point-of-Sale (POS) with simulated optical AI tray checkout, live inventory tracking with low-stock alerts, AI computer vision camera surveillance simulation, and full **Docker containerization**.

---

## 🌟 Key Features

- 🎨 **Clean White-Background Interface**: Minimalist white canvas UI with crisp slate typography, subtle borders, high contrast readability, and smooth micro-animations.
- 🛒 **Smart POS & AI Optical Checkout**: Fast manual barcode billing or 1-click **"Auto Scan Tray"** optical AI scanner simulation that auto-detects items on the checkout counter.
- 📦 **Inventory & Stock Management**: Product catalog with SKU/barcode tracking, stock adjusters (`+`/`-`), low-stock warnings, and product creation/editing modal.
- 📹 **AI Camera Surveillance & Telemetry**: Simulated live computer vision feeds with real-time animated bounding boxes (tracking shelf items, customer footfall, and low-stock alerts).
- 📊 **Executive Analytics Dashboard**: Sales trend SVG graph, category revenue breakdown progress bars, hourly footfall histogram, and real-time AI event stream.
- 🧾 **Digital Tax Invoice & Receipts**: View and print receipts directly from transactions or checkout completion.
- 🐳 **Docker Ready**: One-line build & run commands using Docker or Docker Compose.

---

## 🚀 Running with Docker (Recommended)

### Method 1: Using Docker Compose
```bash
docker-compose up --build
```
Access the application at: **`http://localhost:5000`**

### Method 2: Using Docker CLI directly
```bash
# 1. Build the Docker image
docker build -t smart-retail-system .

# 2. Run the Docker container
docker run -p 5000:5000 --name retail_app smart-retail-system
```
Access the application at: **`http://localhost:5000`**

---

## 💻 Local Development (Without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Open your browser at `http://localhost:5000`.

---

## 📂 Project Structure

```
smart retail system/
├── Dockerfile              # Docker build file (Node 18 Alpine)
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Excluded build context files
├── package.json            # Node.js dependencies & scripts
├── server.js               # Express REST API server & static host
├── data.js                 # Data seed store (products, orders, vision)
├── README.md               # Quickstart documentation
└── public/                 # Frontend SPA static directory
    ├── index.html          # Main HTML structure & tab panes
    ├── css/
    │   └── style.css       # White background design system
    └── js/
        ├── app.js          # SPA navigation & toast service
        ├── dashboard.js    # Metrics & SVG charts module
        ├── pos.js          # POS cart & AI tray checkout module
        ├── inventory.js    # Inventory table & CRUD modal module
        └── vision.js       # AI camera vision & canvas simulation
```

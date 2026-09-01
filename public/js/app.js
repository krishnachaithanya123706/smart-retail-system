/**
 * Smart Retail System - Global Application Module
 */

window.App = {
  currentTab: 'dashboard',
  products: [],
  orders: [],

  // Toast Notification Service
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // API Call Wrapper
  async apiCall(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (data) options.body = JSON.stringify(data);

      const response = await fetch(endpoint, options);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || `HTTP error ${response.status}`);
      }
      return json;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      this.showToast(err.message, 'error');
      throw err;
    }
  },

  // Tab Switch Handler
  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Nav Buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Tab Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Page titles update
    const titles = {
      dashboard: { title: "Executive Dashboard", sub: "Real-time store metrics, inventory tracking & AI vision surveillance" },
      pos: { title: "Smart POS & AI Checkout", sub: "Automated optical scanner, rapid barcode billing & digital invoices" },
      inventory: { title: "Inventory & Smart Shelves", sub: "Stock management, reorder alerts & product catalog" },
      vision: { title: "AI Vision & Surveillance", sub: "Live camera computer vision feeds & object detection telemetry" },
      orders: { title: "Transactions & Receipts", sub: "Searchable transaction history & digital tax invoices" }
    };

    if (titles[tabId]) {
      document.getElementById('page-title').textContent = titles[tabId].title;
      document.getElementById('page-subtitle').textContent = titles[tabId].sub;
    }

    // Refresh active tab module
    if (tabId === 'dashboard' && window.Dashboard) window.Dashboard.load();
    if (tabId === 'pos' && window.POS) window.POS.load();
    if (tabId === 'inventory' && window.Inventory) window.Inventory.load();
    if (tabId === 'vision' && window.Vision) window.Vision.load();
    if (tabId === 'orders') this.loadOrdersTable();
  },

  // Load Transactions Table
  async loadOrdersTable() {
    try {
      const res = await this.apiCall('/api/orders');
      this.orders = res.data;
      const tbody = document.getElementById('orders-table-body');
      if (!tbody) return;

      if (this.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No transactions recorded yet</td></tr>`;
        return;
      }

      tbody.innerHTML = this.orders.map(order => {
        const dateStr = new Date(order.timestamp).toLocaleString();
        const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
        return `
          <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${dateStr}</td>
            <td>${order.customer}</td>
            <td><span class="badge badge-accent">${order.checkoutType || 'Standard'}</span></td>
            <td><i class="fa-regular fa-credit-card"></i> ${order.paymentMethod}</td>
            <td>${itemCount} items</td>
            <td><strong>$${order.total.toFixed(2)}</strong></td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="App.viewReceipt('${order.id}')">
                <i class="fa-solid fa-receipt"></i> View Receipt
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error("Failed to load orders table", e);
    }
  },

  // View Receipt Modal
  viewReceipt(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const modalContent = document.getElementById('receipt-modal-content');
    const modal = document.getElementById('modal-receipt');

    modalContent.innerHTML = `
      <div class="receipt-box">
        <div class="receipt-header-txt">
          <h4>OmniRetail Smart Store</h4>
          <p>Store #01 - Flagship AI Retail</p>
          <p>Date: ${new Date(order.timestamp).toLocaleString()}</p>
          <p>Receipt ID: #${order.id}</p>
        </div>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Checkout:</strong> ${order.checkoutType}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <div class="receipt-divider"></div>
        <table class="receipt-items-table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th style="text-align:right">Price</th></tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td>${i.quantity}</td>
                <td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="receipt-divider"></div>
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>$${order.subtotal.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Tax (8%):</span><span>$${order.tax.toFixed(2)}</span></div>
        ${order.discount > 0 ? `<div style="display:flex; justify-content:space-between; color:var(--emerald);"><span>Discount:</span><span>-$${order.discount.toFixed(2)}</span></div>` : ''}
        <div class="receipt-divider"></div>
        <div style="display:flex; justify-content:space-between; font-size:1rem; font-weight:bold;"><span>TOTAL:</span><span>$${order.total.toFixed(2)}</span></div>
        <div class="receipt-header-txt" style="border:none; margin-top:1.5rem; margin-bottom:0;">
          <p>*** THANK YOU FOR SHOPPING ***</p>
          <p>Powered by Smart Retail AI</p>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  closeReceiptModal() {
    document.getElementById('modal-receipt').classList.remove('open');
  },

  // Init App
  init() {
    // Bind Tab Click Listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Quick POS Button
    document.getElementById('btn-quick-scan-pos').addEventListener('click', () => {
      this.switchTab('pos');
    });

    // Close Receipt Modal
    document.getElementById('btn-close-receipt-modal').addEventListener('click', () => this.closeReceiptModal());
    document.getElementById('btn-close-receipt').addEventListener('click', () => this.closeReceiptModal());

    // Initialize Default Tab (Dashboard)
    this.switchTab('dashboard');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});

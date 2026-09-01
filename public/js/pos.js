/**
 * Smart Retail System - POS Checkout Module
 */

window.POS = {
  products: [],
  cart: [],
  activeCategory: 'All',
  searchQuery: '',

  async load() {
    await this.fetchProducts();
    this.renderProducts();
    this.renderCart();
    this.bindEvents();
  },

  async fetchProducts() {
    try {
      const res = await window.App.apiCall('/api/products');
      this.products = res.data;
    } catch (e) {
      console.error("Failed to load POS products:", e);
    }
  },

  renderProducts() {
    const grid = document.getElementById('pos-products-grid');
    if (!grid) return;

    let filtered = [...this.products];

    if (this.activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.includes(q))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-muted);">No matching products found</div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      let stockClass = 'in';
      let stockText = `${p.stock} in stock`;
      if (p.stock <= p.minStock && p.stock > 0) {
        stockClass = 'low';
        stockText = `Low: ${p.stock}`;
      } else if (p.stock === 0) {
        stockClass = 'out';
        stockText = 'Out of Stock';
      }

      return `
        <div class="product-item-card" onclick="POS.addToCart('${p.id}')">
          <div class="product-img-wrapper">
            <img src="${p.image}" alt="${p.name}">
            <span class="stock-tag ${stockClass}">${stockText}</span>
          </div>
          <span class="prod-title">${p.name}</span>
          <span class="prod-sku">${p.sku}</span>
          <div class="prod-bottom">
            <span class="prod-price">$${p.price.toFixed(2)}</span>
            <button class="btn btn-sm btn-primary" ${p.stock === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  addToCart(productId, qty = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      window.App.showToast(`'${product.name}' is out of stock!`, 'warning');
      return;
    }

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      if (existing.quantity + qty > product.stock) {
        window.App.showToast(`Cannot add more than available stock (${product.stock})`, 'warning');
        return;
      }
      existing.quantity += qty;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    this.renderCart();
    window.App.showToast(`Added '${product.name}' to cart`, 'info');
  },

  updateCartQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    const prod = this.products.find(p => p.id === productId);
    if (delta > 0 && prod && item.quantity + delta > prod.stock) {
      window.App.showToast(`Stock limit reached (${prod.stock})`, 'warning');
      return;
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== productId);
    }

    this.renderCart();
  },

  clearCart() {
    this.cart = [];
    this.renderCart();
    window.App.showToast('Cart cleared', 'info');
  },

  renderCart() {
    const container = document.getElementById('cart-items-list');
    const completeBtn = document.getElementById('btn-complete-checkout');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <i class="fa-solid fa-basket-shopping"></i>
          <p>Cart is empty</p>
          <small>Click products or use AI Auto Scan to start checkout</small>
        </div>
      `;
      document.getElementById('cart-subtotal').textContent = '$0.00';
      document.getElementById('cart-tax').textContent = '$0.00';
      document.getElementById('cart-total').textContent = '$0.00';
      if (completeBtn) {
        completeBtn.disabled = true;
        completeBtn.innerHTML = `<i class="fa-solid fa-check"></i> Complete & Print Receipt ($0.00)`;
      }
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-row">
        <div>
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price.toFixed(2)} each</span>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="POS.updateCartQty('${item.id}', -1)">-</button>
          <span style="font-weight:600; font-size:0.85rem;">${item.quantity}</span>
          <button class="qty-btn" onclick="POS.updateCartQty('${item.id}', 1)">+</button>
          <span style="font-weight:700; margin-left:0.5rem; font-size:0.85rem;">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
    `).join('');

    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.08;
    const discount = parseFloat(document.getElementById('cart-discount-input')?.value || 0);
    const total = Math.max(0, subtotal + tax - discount);

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    if (completeBtn) {
      completeBtn.disabled = false;
      completeBtn.innerHTML = `<i class="fa-solid fa-check"></i> Complete & Print Receipt ($${total.toFixed(2)})`;
    }
  },

  // AI Visual Checkout Scan Simulation
  async simulateAiTrayScan() {
    const scanBtn = document.getElementById('btn-ai-scan-tray');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI Scanning Optical Tray...`;
    }

    try {
      const res = await window.App.apiCall('/api/vision/simulate-scan', 'POST');
      if (res.detectedItems) {
        res.detectedItems.forEach(item => {
          this.addToCart(item.product.id, 1);
        });
        window.App.showToast(`AI Scanner auto-detected ${res.detectedItems.length} items on checkout tray!`, 'success');
      }
    } catch (e) {
      console.error("AI Scan failed:", e);
    } finally {
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Auto Scan Tray`;
      }
    }
  },

  // Submit Order
  async completeCheckout() {
    if (this.cart.length === 0) return;

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'Contactless Card';
    const discount = parseFloat(document.getElementById('cart-discount-input')?.value || 0);

    try {
      const res = await window.App.apiCall('/api/orders', 'POST', {
        items: this.cart,
        paymentMethod,
        discount,
        customer: 'Shopper #' + Math.floor(100 + Math.random() * 900),
        checkoutType: 'AI Optical POS'
      });

      if (res.data) {
        window.App.showToast(`Order #${res.data.id} completed successfully!`, 'success');
        this.cart = [];
        this.renderCart();
        await this.fetchProducts();
        this.renderProducts();
        window.App.viewReceipt(res.data.id);
      }
    } catch (e) {
      console.error("Checkout failed:", e);
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('pos-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderProducts();
      };
    }

    // Category pills
    document.querySelectorAll('#pos-category-pills .pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('#pos-category-pills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.dataset.category;
        this.renderProducts();
      };
    });

    // Discount change
    const discInput = document.getElementById('cart-discount-input');
    if (discInput) {
      discInput.oninput = () => this.renderCart();
    }

    // Clear cart
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => this.clearCart());

    // AI Tray Scan
    document.getElementById('btn-ai-scan-tray')?.addEventListener('click', () => this.simulateAiTrayScan());

    // Complete Checkout
    document.getElementById('btn-complete-checkout')?.addEventListener('click', () => this.completeCheckout());
  }
};

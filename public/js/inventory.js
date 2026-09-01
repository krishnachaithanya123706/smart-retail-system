/**
 * Smart Retail System - Inventory Management Module
 */

window.Inventory = {
  products: [],
  stockFilter: 'all',
  searchQuery: '',

  async load() {
    await this.fetchProducts();
    this.renderTable();
    this.bindEvents();
  },

  async fetchProducts() {
    try {
      const res = await window.App.apiCall('/api/products');
      this.products = res.data;
    } catch (e) {
      console.error("Error loading inventory products:", e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    let filtered = [...this.products];

    if (this.stockFilter === 'in') filtered = filtered.filter(p => p.stock > p.minStock);
    if (this.stockFilter === 'low') filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.minStock);
    if (this.stockFilter === 'out') filtered = filtered.filter(p => p.stock === 0);

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.includes(q))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No products match filter criteria</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      let badge = `<span class="badge badge-success">In Stock</span>`;
      if (p.stock <= p.minStock && p.stock > 0) {
        badge = `<span class="badge badge-warning">Low Stock Warning</span>`;
      } else if (p.stock === 0) {
        badge = `<span class="badge badge-danger">Out of Stock</span>`;
      }

      return `
        <tr>
          <td>
            <div class="table-prod-cell">
              <img src="${p.image}" class="table-prod-img" alt="${p.name}">
              <div>
                <strong>${p.name}</strong>
                <small style="display:block; color: var(--text-muted);">ID: ${p.id}</small>
              </div>
            </div>
          </td>
          <td><span class="badge badge-accent">${p.category}</span></td>
          <td>
            <div><strong>${p.sku}</strong></div>
            <small style="color:var(--text-muted);"><i class="fa-solid fa-barcode"></i> ${p.barcode}</small>
          </td>
          <td><strong>$${p.price.toFixed(2)}</strong></td>
          <td>${badge}</td>
          <td>
            <div style="display:flex; align-items:center; gap: 0.5rem;">
              <button class="qty-btn" onclick="Inventory.adjustStock('${p.id}', -1)">-</button>
              <strong style="min-width: 25px; text-align:center;">${p.stock}</strong>
              <button class="qty-btn" onclick="Inventory.adjustStock('${p.id}', 1)">+</button>
              <small style="color:var(--text-muted);">(Min: ${p.minStock})</small>
            </div>
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-sm btn-secondary" onclick="Inventory.openEditModal('${p.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-light-danger" onclick="Inventory.deleteProduct('${p.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async adjustStock(productId, delta) {
    try {
      const res = await window.App.apiCall(`/api/products/${productId}/stock`, 'PATCH', { delta });
      if (res.data) {
        const prod = this.products.find(p => p.id === productId);
        if (prod) prod.stock = res.data.stock;
        this.renderTable();
        window.App.showToast(`Updated stock for '${res.data.name}' to ${res.data.stock}`, 'info');
      }
    } catch (e) {
      console.error("Stock adjustment failed:", e);
    }
  },

  openAddModal() {
    document.getElementById('modal-product-title').textContent = "Add New Product";
    document.getElementById('form-product-id').value = "";
    document.getElementById('product-form').reset();
    document.getElementById('modal-product').classList.add('open');
  },

  openEditModal(productId) {
    const p = this.products.find(prod => prod.id === productId);
    if (!p) return;

    document.getElementById('modal-product-title').textContent = "Edit Product";
    document.getElementById('form-product-id').value = p.id;
    document.getElementById('form-name').value = p.name;
    document.getElementById('form-category').value = p.category;
    document.getElementById('form-price').value = p.price;
    document.getElementById('form-stock').value = p.stock;
    document.getElementById('form-min-stock').value = p.minStock;
    document.getElementById('form-sku').value = p.sku;
    document.getElementById('form-barcode').value = p.barcode;
    document.getElementById('form-image').value = p.image;

    document.getElementById('modal-product').classList.add('open');
  },

  closeModal() {
    document.getElementById('modal-product').classList.remove('open');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('form-product-id').value;
    const data = {
      name: document.getElementById('form-name').value,
      category: document.getElementById('form-category').value,
      price: parseFloat(document.getElementById('form-price').value),
      stock: parseInt(document.getElementById('form-stock').value),
      minStock: parseInt(document.getElementById('form-min-stock').value),
      sku: document.getElementById('form-sku').value,
      barcode: document.getElementById('form-barcode').value,
      image: document.getElementById('form-image').value
    };

    try {
      if (id) {
        // Update
        const res = await window.App.apiCall(`/api/products/${id}`, 'PUT', data);
        window.App.showToast(`Product '${res.data.name}' updated!`, 'success');
      } else {
        // Create
        const res = await window.App.apiCall('/api/products', 'POST', data);
        window.App.showToast(`New product '${res.data.name}' added to inventory!`, 'success');
      }

      this.closeModal();
      await this.fetchProducts();
      this.renderTable();
    } catch (err) {
      console.error("Form submission failed:", err);
    }
  },

  async deleteProduct(productId) {
    const p = this.products.find(prod => prod.id === productId);
    if (!p || !confirm(`Are you sure you want to delete '${p.name}'?`)) return;

    try {
      await window.App.apiCall(`/api/products/${productId}`, 'DELETE');
      window.App.showToast(`Deleted '${p.name}' from inventory`, 'warning');
      await this.fetchProducts();
      this.renderTable();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderTable();
      };
    }

    // Filter select
    const filterSelect = document.getElementById('inventory-stock-filter');
    if (filterSelect) {
      filterSelect.onchange = (e) => {
        this.stockFilter = e.target.value;
        this.renderTable();
      };
    }

    // Modal open / close
    document.getElementById('btn-open-add-product-modal')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('btn-close-product-modal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-cancel-product')?.addEventListener('click', () => this.closeModal());

    // Form submit
    document.getElementById('product-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }
};

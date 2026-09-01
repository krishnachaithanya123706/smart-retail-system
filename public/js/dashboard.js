/**
 * Smart Retail System - Dashboard Module
 */

window.Dashboard = {
  async load() {
    try {
      const res = await window.App.apiCall('/api/analytics');
      const { metrics, categorySales, salesTrend, footfall, recentLogs } = res.data;

      // Update KPI Metrics
      document.getElementById('kpi-revenue').textContent = `$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('kpi-orders').textContent = metrics.totalOrders;
      document.getElementById('kpi-low-stock').textContent = metrics.lowStockCount;
      document.getElementById('kpi-cameras').textContent = `${metrics.activeCameras} / ${metrics.activeCameras}`;

      // Update nav low stock badge
      const navBadge = document.getElementById('nav-low-stock-count');
      if (navBadge) {
        navBadge.textContent = metrics.lowStockCount;
        navBadge.style.display = metrics.lowStockCount > 0 ? 'inline-flex' : 'none';
      }

      // Render Charts
      this.renderSalesChart(salesTrend);
      this.renderCategoryChart(categorySales);
      this.renderFootfallChart(footfall);
      this.renderLogs(recentLogs);

    } catch (e) {
      console.error("Error loading dashboard metrics:", e);
    }
  },

  renderSalesChart(data) {
    const container = document.getElementById('sales-chart-wrapper');
    if (!container || !data || data.length === 0) return;

    const width = 600;
    const height = 240;
    const padding = 40;

    const maxVal = Math.max(...data.map(d => d.sales), 100) * 1.2;
    const points = data.map((d, index) => {
      const x = padding + (index * ((width - padding * 2) / (data.length - 1)));
      const y = height - padding - ((d.sales / maxVal) * (height - padding * 2));
      return { x, y, label: d.label, val: d.sales };
    });

    const dPath = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
    const areaPath = `${dPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; overflow:visible;">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e2e8f0" stroke-width="1" />
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 4" />

        <!-- Area Fill -->
        <path d="${areaPath}" fill="url(#salesGrad)" />

        <!-- Line -->
        <path d="${dPath}" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" />

        <!-- Points & Labels -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" stroke="#4f46e5" stroke-width="3" />
          <text x="${p.x}" y="${height - 15}" text-anchor="middle" font-size="12" fill="#64748b" font-weight="500">${p.label}</text>
          <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" font-size="11" fill="#0f172a" font-weight="700">$${p.val}</text>
        `).join('')}
      </svg>
    `;

    container.innerHTML = svgHtml;
  },

  renderCategoryChart(categories) {
    const container = document.getElementById('category-chart-container');
    if (!container) return;

    const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    const html = Object.entries(categories).map(([cat, amount], idx) => {
      const pct = Math.round((amount / total) * 100);
      const color = colors[idx % colors.length];
      return `
        <div class="cat-bar-item">
          <div class="cat-bar-info">
            <span>${cat}</span>
            <strong>$${amount.toFixed(2)} (${pct}%)</strong>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html || `<p class="text-muted">No sales recorded by category yet</p>`;
  },

  renderFootfallChart(footfall) {
    const container = document.getElementById('footfall-chart-container');
    if (!container || !footfall) return;

    const maxCount = Math.max(...footfall.map(f => f.count), 1);

    const html = footfall.map(f => {
      const heightPct = Math.max(10, Math.round((f.count / maxCount) * 100));
      return `
        <div class="histo-col">
          <div class="histo-bar" style="height: ${heightPct}%;" data-val="${f.count}"></div>
          <span class="histo-label">${f.hour}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  renderLogs(logs) {
    const container = document.getElementById('dashboard-log-stream');
    if (!container || !logs) return;

    container.innerHTML = logs.map(log => `
      <div class="log-item">
        <span class="log-badge ${log.level || 'info'}"></span>
        <span class="log-time">${log.timestamp}</span>
        <span class="log-msg">${log.message}</span>
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-refresh-dashboard')?.addEventListener('click', () => {
    window.Dashboard.load();
    window.App.showToast('Dashboard reloaded', 'info');
  });
});

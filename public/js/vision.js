/**
 * Smart Retail System - AI Vision & Surveillance Module
 */

window.Vision = {
  activeCamId: 'cam-1',
  feeds: [],
  logs: [],
  animFrameId: null,

  async load() {
    await this.fetchData();
    this.renderSidebar();
    this.startCanvasSimulation();
    this.bindEvents();
  },

  async fetchData() {
    try {
      const res = await window.App.apiCall('/api/vision');
      this.feeds = res.feeds;
      this.logs = res.logs;
    } catch (e) {
      console.error("Error fetching vision data:", e);
    }
  },

  renderSidebar() {
    const feed = this.feeds.find(f => f.id === this.activeCamId) || this.feeds[0];
    if (!feed) return;

    // Update active camera header title
    const titleEl = document.getElementById('active-camera-title');
    if (titleEl) titleEl.textContent = `Camera Feed: ${feed.name}`;

    // Render detections list
    const detList = document.getElementById('detections-list');
    if (detList) {
      detList.innerHTML = feed.detectedObjects.map(obj => `
        <div class="detection-item">
          <div>
            <strong>${obj.label}</strong>
            <small style="display:block; color:var(--text-muted);">Confidence: ${(obj.confidence * 100).toFixed(0)}%</small>
          </div>
          <span class="badge ${obj.alert ? 'badge-danger' : 'badge-success'}">
            ${obj.alert ? (obj.alertReason || 'Alert') : 'Tracking'}
          </span>
        </div>
      `).join('');
    }

    // Render telemetry logs
    const logsContainer = document.getElementById('vision-telemetry-logs');
    if (logsContainer) {
      logsContainer.innerHTML = this.logs.slice(0, 8).map(log => `
        <div class="log-item" style="padding:0.4rem 0.6rem;">
          <span class="log-badge ${log.level}"></span>
          <span style="font-weight:600; color:var(--text-muted); min-width:55px;">${log.timestamp}</span>
          <span>${log.message}</span>
        </div>
      `).join('');
    }
  },

  startCanvasSimulation() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const canvas = document.getElementById('vision-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;

    const renderFrame = () => {
      t += 0.03;
      document.getElementById('camera-timestamp').textContent = new Date().toLocaleTimeString();

      // Clear Canvas Background (Dark simulated camera lens feed)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid overlay lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Camera Specific Simulated Objects & AI Bounding Boxes
      if (this.activeCamId === 'cam-1') {
        // Shelf Cam
        this.drawShelfObjects(ctx, t);
      } else if (this.activeCamId === 'cam-2') {
        // POS Kiosk
        this.drawPosObjects(ctx, t);
      } else {
        // Entrance Cam
        this.drawEntranceObjects(ctx, t);
      }

      this.animFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  },

  drawBoundingBox(ctx, x, y, w, h, label, conf, isAlert, alertTxt) {
    const color = isAlert ? '#ef4444' : '#10b981';

    // Bounding Box Rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Corner Accents
    const len = 12;
    ctx.lineWidth = 4;
    // Top-left
    ctx.beginPath(); ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len); ctx.stroke();

    // Label Header Tag
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 24, Math.max(140, ctx.measureText(label).width + 50), 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${label} (${(conf * 100).toFixed(0)}%)`, x + 6, y - 8);

    if (isAlert && alertTxt) {
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(x, y + h + 4, ctx.measureText(alertTxt).width + 16, 20);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(alertTxt, x + 8, y + h + 18);
    }
  },

  drawShelfObjects(ctx, t) {
    // Draw Simulated Shelf Lines
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(80, 160, 640, 12);
    ctx.fillRect(80, 320, 640, 12);

    // Product 1: Smart Watch (Shelf top)
    const dx1 = Math.sin(t * 0.5) * 2;
    this.drawBoundingBox(ctx, 120 + dx1, 80, 130, 75, "SmartWatch S7", 0.98, false);

    // Product 2: Headphones (Shelf bottom - Low Stock Alert)
    const dx2 = Math.cos(t * 0.5) * 2;
    this.drawBoundingBox(ctx, 480 + dx2, 230, 150, 85, "Headphones Pro", 0.94, true, "LOW STOCK (4 Left)");
  },

  drawPosObjects(ctx, t) {
    // Simulated Checkout Tray
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(150, 120, 500, 260);

    // Customer Hands / Tray scan object
    const dx = Math.sin(t) * 4;
    this.drawBoundingBox(ctx, 220 + dx, 160, 140, 100, "Coffee Beans 500g", 0.97, false);
    this.drawBoundingBox(ctx, 400 - dx, 200, 160, 120, "Keyboard Mechanical", 0.95, false);
  },

  drawEntranceObjects(ctx, t) {
    // Sliding entrance door lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(200, 40, 400, 380);

    // Person Inbound
    const y1 = 100 + (Math.sin(t * 0.8) * 30);
    this.drawBoundingBox(ctx, 260, y1, 110, 220, "Shopper #408 (In)", 0.99, false);

    // Person Outbound
    const y2 = 140 - (Math.sin(t * 0.8) * 30);
    this.drawBoundingBox(ctx, 430, y2, 110, 220, "Shopper #392 (Out)", 0.96, false);
  },

  bindEvents() {
    // Camera switcher buttons
    document.querySelectorAll('#camera-selector .btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#camera-selector .btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCamId = btn.dataset.cam;
        this.renderSidebar();
      };
    });
  }
};

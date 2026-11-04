const zlib = require('zlib');

// Helper to convert hex to RGB
function hexToRgb(hex, fallback = { r: 255, g: 255, b: 255 }) {
  if (!hex) return fallback;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }
  return fallback;
}

// Pure Node.js zero-dependency PNG encoder
function createPurePNG(width, height, drawFn) {
  const bpp = 4;
  const stride = 1 + width * bpp;
  const raw = Buffer.alloc(height * stride);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * stride + 1 + x * bpp;
    raw[idx] = r;
    raw[idx + 1] = g;
    raw[idx + 2] = b;
    raw[idx + 3] = a;
  }

  drawFn(setPixel, width, height);

  const idatData = zlib.deflateSync(raw, { level: 6 });

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate SVG representation of wallpaper
function buildSVG({ width, height, viewMode, bg, past, current, future, stats, topText, offsetFactor = 0.095 }) {
  const isMonthMode = (viewMode === 'month');
  const isGoalsMode = (viewMode === 'goals');

  let cols = 15;
  if (isMonthMode) {
    cols = 7;
  } else if (isGoalsMode) {
    if (stats.total <= 35) cols = 7;
    else if (stats.total <= 100) cols = 10;
    else cols = 15;
  }
  const rows = Math.ceil(stats.total / cols);

  const maxBoundW = width * (isMonthMode ? 0.58 : (isGoalsMode ? 0.65 : 0.68));
  const maxBoundH = height * (isMonthMode ? 0.40 : (isGoalsMode ? 0.50 : 0.64));

  const gapRatio = 0.65;
  const cellSpanW = cols + (cols - 1) * gapRatio;
  const cellSpanH = rows + (rows - 1) * gapRatio;

  const cellSize = Math.min(maxBoundW / cellSpanW, maxBoundH / cellSpanH);
  const gapSize = cellSize * gapRatio;

  const gridTotalW = (cols * cellSize) + ((cols - 1) * gapSize);
  const gridTotalH = (rows * cellSize) + ((rows - 1) * gapSize);

  // Top Text measurements (opcional, posicionado elegantemente acima das bolinhas)
  const hasTopText = Boolean(topText && topText.trim().length > 0);
  const cleanTopText = hasTopText ? topText.trim().toUpperCase() : '';
  const topTextFontSize = Math.max(13, height * 0.015);
  const topTextSpacing = height * 0.025;
  const topTextTotalHeight = hasTopText ? (topTextFontSize + topTextSpacing) : 0;

  // Footer measurements
  const footerFontSize = Math.max(13, height * 0.0145);
  const footerSpacing = height * 0.03;
  const footerTotalHeight = footerFontSize + footerSpacing;

  const totalCompositionH = topTextTotalHeight + gridTotalH + footerTotalHeight;
  // Deslocamento vertical para baixo (respiro perfeito abaixo do relógio da tela de bloqueio)
  const verticalOffset = height * (typeof offsetFactor === 'number' ? offsetFactor : 0.095);
  const topContentY = ((height - totalCompositionH) / 2) + verticalOffset;
  const textY = topContentY + (topTextFontSize / 2);
  const startX = (width - gridTotalW) / 2;
  const startY = topContentY + topTextTotalHeight;
  const footerY = startY + gridTotalH + footerSpacing + (footerFontSize / 2);

  let elementsSvg = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= stats.total) break;

      const x = startX + c * (cellSize + gapSize);
      const y = startY + r * (cellSize + gapSize);

      let color = future;
      if (idx < stats.currentIndex) {
        color = past;
      } else if (idx === stats.currentIndex) {
        color = current;
      }

      const cx = (x + cellSize / 2).toFixed(1);
      const cy = (y + cellSize / 2).toFixed(1);
      const rad = (cellSize / 2).toFixed(1);
      elementsSvg += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${color}"/>\n`;
    }
  }

  let topTextSvg = '';
  if (hasTopText) {
    const safeText = cleanTopText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    topTextSvg = `
    <text x="${width / 2}" y="${textY}" font-family="Inter, -apple-system, sans-serif" font-size="${topTextFontSize}" font-weight="600" letter-spacing="3" fill="${past}" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
    `;
  }

  const daysText = `${stats.remaining}d left`;
  const percentText = ` · ${Math.round(stats.percent)}%`;
  const footerSvg = `
    <g transform="translate(${width / 2}, ${footerY})" font-family="Inter, -apple-system, sans-serif" font-size="${footerFontSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle">
      <text>
        <tspan fill="${current}">${daysText}</tspan>
        <tspan fill="#71717a">${percentText}</tspan>
      </text>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${topTextSvg}
  ${elementsSvg}
  ${footerSvg}
</svg>`;
}

// Main handler for Vercel Serverless Function
module.exports = async function handler(req, res) {
  try {
    let q = req.query;
    if (!q || Object.keys(q).length === 0) {
      try {
        const parsedUrl = new URL(req.url || '', 'http://localhost');
        q = Object.fromEntries(parsedUrl.searchParams.entries());
      } catch (e) {
        q = q || {};
      }
    }
    const reqUrl = req.url || '';

    const width = Math.min(5000, Math.max(300, parseInt(q.width || q.w, 10) || 1170));
    const height = Math.min(8000, Math.max(300, parseInt(q.height || q.h, 10) || 2532));
    const viewMode = (q.view === 'goals' || q.view === 'meta' || reqUrl.includes('/goals')) ? 'goals' : ((q.view === 'month' || reqUrl.includes('/month')) ? 'month' : 'year');
    const rawText = (q.text || q.topText || '').trim();
    const topText = (rawText.toUpperCase() === 'MEMENTO MORI') ? '' : rawText.toUpperCase();
    const bg = q.bg || '#0e0e0e';
    const past = q.past || '#ffffff';
    const current = q.current || '#f56b3f';
    const future = q.future || '#333336';
    const offsetQuery = parseFloat(q.offset || q.y);
    const offsetFactor = !isNaN(offsetQuery) ? Math.min(0.25, Math.max(0, offsetQuery / 100)) : 0.095;

    // Time calculations using local time (UTC-3 for Brazil or UTC)
    const tzOffsetMs = 3 * 60 * 60 * 1000;
    const now = new Date(Date.now() - tzOffsetMs);

    let stats = {};
    if (viewMode === 'goals') {
      const goalDays = Math.min(365, Math.max(7, parseInt(q.days || q.goalDays || 30, 10)));
      const startParam = q.start || q.startDate;
      const start = startParam ? new Date(startParam + 'T00:00:00Z') : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const msInDay = 24 * 60 * 60 * 1000;
      let elapsed = Math.floor((today - start) / msInDay);
      if (isNaN(elapsed)) elapsed = 0;
      const currentIdx = Math.min(goalDays - 1, Math.max(0, elapsed));
      const remaining = Math.max(0, goalDays - (currentIdx + 1));
      const percent = Math.min(100, Math.max(0, ((currentIdx + 1) / goalDays) * 100));

      stats = {
        total: goalDays,
        completed: currentIdx + 1,
        currentIndex: currentIdx,
        remaining: remaining,
        percent: percent,
        isGoalsMode: true
      };
    } else if (viewMode === 'month') {
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      // Total days in current month
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const dayOfMonth = now.getUTCDate(); // 1..31

      stats = {
        total: daysInMonth,
        completed: dayOfMonth - 1,
        currentIndex: dayOfMonth - 1,
        remaining: Math.max(0, daysInMonth - dayOfMonth),
        percent: Math.min(100, Math.round((dayOfMonth / daysInMonth) * 100)),
        month: month + 1,
        year: year
      };
    } else {
      // Year Mode
      const year = now.getUTCFullYear();
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const totalDays = isLeap ? 366 : 365;

      const todayStart = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate()));
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const msInDay = 24 * 60 * 60 * 1000;
      const dayOfYear = Math.min(totalDays - 1, Math.max(0, Math.round((todayStart - startOfYear) / msInDay)));

      stats = {
        total: totalDays,
        completed: dayOfYear,
        currentIndex: dayOfYear,
        remaining: Math.max(0, totalDays - (dayOfYear + 1)),
        percent: ((dayOfYear + 1) / totalDays) * 100,
        year: year
      };
    }

    // Try @resvg/resvg-js if installed in environment
    try {
      const { Resvg } = require('@resvg/resvg-js');
      const svg = buildSVG({ width, height, viewMode, bg, past, current, future, stats, topText, offsetFactor });
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: width }
      });
      const pngBuffer = resvg.render().asPng();

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
      return res.end(pngBuffer);
    } catch (err) {
      // If resvg not installed, check if client wants SVG or generate pure PNG
      if (q.format === 'svg') {
        const svg = buildSVG({ width, height, viewMode, bg, past, current, future, stats, topText, offsetFactor });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
        return res.end(svg);
      }

      // Fast Pure PNG Fallback (0 dependencies, 100% native Node.js)
      const bgRgb = hexToRgb(bg, { r: 14, g: 14, b: 14 });
      const pastRgb = hexToRgb(past, { r: 255, g: 255, b: 255 });
      const curRgb = hexToRgb(current, { r: 245, g: 107, b: 63 });
      const futRgb = hexToRgb(future, { r: 51, g: 51, b: 54 });

      const isMonthMode = (viewMode === 'month');
      const isGoalsMode = (viewMode === 'goals');

      let cols = 15;
      if (isMonthMode) {
        cols = 7;
      } else if (isGoalsMode) {
        if (stats.total <= 35) cols = 7;
        else if (stats.total <= 100) cols = 10;
        else cols = 15;
      }
      const rows = Math.ceil(stats.total / cols);

      const maxBoundW = width * (isMonthMode ? 0.58 : (isGoalsMode ? 0.65 : 0.68));
      const maxBoundH = height * (isMonthMode ? 0.40 : (isGoalsMode ? 0.50 : 0.64));

      const gapRatio = 0.65;
      const cellSpanW = cols + (cols - 1) * gapRatio;
      const cellSpanH = rows + (rows - 1) * gapRatio;

      const cellSize = Math.min(maxBoundW / cellSpanW, maxBoundH / cellSpanH);
      const gapSize = cellSize * gapRatio;

      const gridTotalW = (cols * cellSize) + ((cols - 1) * gapSize);
      const gridTotalH = (rows * cellSize) + ((rows - 1) * gapSize);

      const hasTopText = Boolean(topText && topText.trim().length > 0);
      const topTextFontSize = Math.max(13, height * 0.015);
      const topTextSpacing = height * 0.025;
      const topTextTotalHeight = hasTopText ? (topTextFontSize + topTextSpacing) : 0;

      const footerFontSize = Math.max(13, height * 0.0145);
      const footerSpacing = height * 0.03;
      const footerTotalHeight = footerFontSize + footerSpacing;

      const totalCompositionH = topTextTotalHeight + gridTotalH + footerTotalHeight;
      const verticalOffset = height * offsetFactor;
      const topContentY = ((height - totalCompositionH) / 2) + verticalOffset;
      const startX = (width - gridTotalW) / 2;
      const startY = topContentY + topTextTotalHeight;

      const pngData = createPurePNG(width, height, (setPixel, w, h) => {
        // Fill background
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            setPixel(x, y, bgRgb.r, bgRgb.g, bgRgb.b, 255);
          }
        }

        // Draw dots
        const radius = cellSize / 2;
        const radSquared = radius * radius;
        const totalItems = stats.total;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx >= totalItems) break;

            const cx = startX + c * (cellSize + gapSize) + radius;
            const cy = startY + r * (cellSize + gapSize) + radius;

            let color = futRgb;
            if (idx < stats.currentIndex) color = pastRgb;
            else if (idx === stats.currentIndex) color = curRgb;

            const minX = Math.floor(cx - radius);
            const maxX = Math.ceil(cx + radius);
            const minY = Math.floor(cy - radius);
            const maxY = Math.ceil(cy + radius);

            for (let py = minY; py <= maxY; py++) {
              for (let px = minX; px <= maxX; px++) {
                const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
                if (d2 <= radSquared) {
                  setPixel(px, py, color.r, color.g, color.b, 255);
                }
              }
            }
          }
        }
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
      return res.end(pngData);
    }
  } catch (error) {
    console.error('API Wallpaper Error:', error);
    if (res.json) {
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      if (typeof res.status === 'function') {
        res.status(500);
      } else {
        res.statusCode = 500;
      }
      return res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
    }
  }
};

const zlib = require('zlib');

// Complete 5x7 bitmap font definitions (ASCII characters)
const FONT_5X7 = {
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
  '!': [0x04,0x04,0x04,0x04,0x04,0x00,0x04],
  '"': [0x0a,0x0a,0x00,0x00,0x00,0x00,0x00],
  '#': [0x0a,0x0a,0x1f,0x0a,0x1f,0x0a,0x0a],
  '$': [0x04,0x0f,0x14,0x0e,0x05,0x1e,0x04],
  '%': [0x19,0x19,0x02,0x04,0x08,0x13,0x13],
  '&': [0x0c,0x12,0x14,0x08,0x15,0x12,0x0d],
  '\'': [0x04,0x04,0x02,0x00,0x00,0x00,0x00],
  '(': [0x02,0x04,0x08,0x08,0x08,0x04,0x02],
  ')': [0x08,0x04,0x02,0x02,0x02,0x04,0x08],
  '*': [0x00,0x04,0x15,0x0e,0x15,0x04,0x00],
  '+': [0x00,0x04,0x04,0x1f,0x04,0x04,0x00],
  ',': [0x00,0x00,0x00,0x00,0x06,0x06,0x04],
  '-': [0x00,0x00,0x00,0x1f,0x00,0x00,0x00],
  '.': [0x00,0x00,0x00,0x00,0x00,0x0c,0x0c],
  '/': [0x00,0x01,0x02,0x04,0x08,0x10,0x00],
  '0': [0x0e,0x11,0x13,0x15,0x19,0x11,0x0e],
  '1': [0x04,0x0c,0x04,0x04,0x04,0x04,0x0e],
  '2': [0x0e,0x11,0x01,0x02,0x04,0x08,0x1f],
  '3': [0x1f,0x01,0x02,0x0e,0x01,0x11,0x0e],
  '4': [0x02,0x06,0x0a,0x12,0x1f,0x02,0x02],
  '5': [0x1f,0x10,0x1e,0x01,0x01,0x11,0x0e],
  '6': [0x06,0x08,0x10,0x1e,0x11,0x11,0x0e],
  '7': [0x1f,0x01,0x02,0x04,0x08,0x08,0x08],
  '8': [0x0e,0x11,0x11,0x0e,0x11,0x11,0x0e],
  '9': [0x0e,0x11,0x11,0x0f,0x01,0x02,0x0c],
  ':': [0x00,0x0c,0x0c,0x00,0x0c,0x0c,0x00],
  ';': [0x00,0x0c,0x0c,0x00,0x0c,0x04,0x08],
  '<': [0x02,0x04,0x08,0x10,0x08,0x04,0x02],
  '=': [0x00,0x1f,0x00,0x1f,0x00,0x00,0x00],
  '>': [0x08,0x04,0x02,0x01,0x02,0x04,0x08],
  '?': [0x0e,0x11,0x01,0x02,0x04,0x00,0x04],
  '@': [0x0e,0x11,0x01,0x0d,0x15,0x15,0x0e],
  'A': [0x0e,0x11,0x11,0x1f,0x11,0x11,0x11],
  'B': [0x1e,0x11,0x11,0x1e,0x11,0x11,0x1e],
  'C': [0x0e,0x11,0x10,0x10,0x10,0x11,0x0e],
  'D': [0x1e,0x11,0x11,0x11,0x11,0x11,0x1e],
  'E': [0x1f,0x10,0x10,0x1e,0x10,0x10,0x1f],
  'F': [0x1f,0x10,0x10,0x1e,0x10,0x10,0x10],
  'G': [0x0e,0x11,0x10,0x17,0x11,0x11,0x0f],
  'H': [0x11,0x11,0x11,0x1f,0x11,0x11,0x11],
  'I': [0x0e,0x04,0x04,0x04,0x04,0x04,0x0e],
  'J': [0x07,0x02,0x02,0x02,0x02,0x12,0x0c],
  'K': [0x11,0x12,0x14,0x18,0x14,0x12,0x11],
  'L': [0x10,0x10,0x10,0x10,0x10,0x10,0x1f],
  'M': [0x11,0x1b,0x15,0x15,0x11,0x11,0x11],
  'N': [0x11,0x19,0x15,0x13,0x11,0x11,0x11],
  'O': [0x0e,0x11,0x11,0x11,0x11,0x11,0x0e],
  'P': [0x1e,0x11,0x11,0x1e,0x10,0x10,0x10],
  'Q': [0x0e,0x11,0x11,0x11,0x15,0x12,0x0d],
  'R': [0x1e,0x11,0x11,0x1e,0x14,0x12,0x11],
  'S': [0x0e,0x11,0x10,0x0e,0x01,0x11,0x0e],
  'T': [0x1f,0x04,0x04,0x04,0x04,0x04,0x04],
  'U': [0x11,0x11,0x11,0x11,0x11,0x11,0x0e],
  'V': [0x11,0x11,0x11,0x11,0x11,0x0a,0x04],
  'W': [0x11,0x11,0x11,0x15,0x15,0x1b,0x11],
  'X': [0x11,0x11,0x0a,0x04,0x0a,0x11,0x11],
  'Y': [0x11,0x11,0x0a,0x04,0x04,0x04,0x04],
  'Z': [0x1f,0x01,0x02,0x04,0x08,0x10,0x1f],
  '[': [0x0e,0x08,0x08,0x08,0x08,0x08,0x0e],
  '\\': [0x00,0x10,0x08,0x04,0x02,0x01,0x00],
  ']': [0x0e,0x02,0x02,0x02,0x02,0x02,0x0e],
  '^': [0x04,0x0a,0x11,0x00,0x00,0x00,0x00],
  '_': [0x00,0x00,0x00,0x00,0x00,0x00,0x1f],
  '`': [0x08,0x04,0x02,0x00,0x00,0x00,0x00],
  'a': [0x00,0x00,0x0e,0x01,0x0f,0x11,0x0f],
  'b': [0x10,0x10,0x16,0x19,0x11,0x11,0x1e],
  'c': [0x00,0x00,0x0e,0x10,0x10,0x11,0x0e],
  'd': [0x01,0x01,0x0d,0x13,0x11,0x11,0x0f],
  'e': [0x00,0x00,0x0e,0x11,0x1f,0x10,0x0f],
  'f': [0x06,0x09,0x08,0x1c,0x08,0x08,0x08],
  'g': [0x00,0x00,0x0f,0x11,0x0f,0x01,0x0e],
  'h': [0x10,0x10,0x16,0x19,0x11,0x11,0x11],
  'i': [0x04,0x00,0x0c,0x04,0x04,0x04,0x0e],
  'j': [0x02,0x00,0x06,0x02,0x02,0x12,0x0c],
  'k': [0x10,0x10,0x12,0x14,0x18,0x14,0x12],
  'l': [0x0c,0x04,0x04,0x04,0x04,0x04,0x0e],
  'm': [0x00,0x00,0x1a,0x15,0x15,0x11,0x11],
  'n': [0x00,0x00,0x16,0x19,0x11,0x11,0x11],
  'o': [0x00,0x00,0x0e,0x11,0x11,0x11,0x0e],
  'p': [0x00,0x00,0x1e,0x11,0x1e,0x10,0x10],
  'q': [0x00,0x00,0x0d,0x13,0x0f,0x01,0x01],
  'r': [0x00,0x00,0x16,0x19,0x10,0x10,0x10],
  's': [0x00,0x00,0x0f,0x10,0x0e,0x01,0x1e],
  't': [0x08,0x08,0x1c,0x08,0x08,0x09,0x06],
  'u': [0x00,0x00,0x11,0x11,0x11,0x13,0x0d],
  'v': [0x00,0x00,0x11,0x11,0x11,0x0a,0x04],
  'w': [0x00,0x00,0x11,0x11,0x15,0x15,0x0a],
  'x': [0x00,0x00,0x11,0x0a,0x04,0x0a,0x11],
  'y': [0x00,0x00,0x11,0x11,0x0f,0x01,0x0e],
  'z': [0x00,0x00,0x1f,0x02,0x04,0x08,0x1f],
  '·': [0x00,0x00,0x00,0x0e,0x0e,0x00,0x00]
};

function getGlyph(ch) {
  if (FONT_5X7[ch]) return FONT_5X7[ch];
  const upper = ch.toUpperCase();
  if (FONT_5X7[upper]) return FONT_5X7[upper];
  return FONT_5X7[' '];
}

function measureBitmapText(text, scale) {
  let w = 0;
  const charWidth = 5 * scale;
  const charSpacing = scale >= 3 ? Math.round(scale * 1.2) : scale;
  const spaceWidth = 3 * scale;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      w += spaceWidth;
    } else {
      w += charWidth + charSpacing;
    }
  }
  return w > 0 ? w - charSpacing : 0;
}

function drawBitmapText(setPixel, text, startX, startY, scale, color) {
  let curX = startX;
  const charWidth = 5 * scale;
  const charSpacing = scale >= 3 ? Math.round(scale * 1.2) : scale;
  const spaceWidth = 3 * scale;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') {
      curX += spaceWidth;
      continue;
    }
    const glyph = getGlyph(ch);
    for (let r = 0; r < 7; r++) {
      const bits = glyph[r];
      for (let c = 0; c < 5; c++) {
        if (bits & (1 << (4 - c))) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              setPixel(curX + c * scale + dx, startY + r * scale + dy, color.r, color.g, color.b, 255);
            }
          }
        }
      }
    }
    curX += charWidth + charSpacing;
  }
}

// Helper to convert hex to RGB
function hexToRgb(hex, fallback = { r: 161, g: 161, b: 170 }) {
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

// Convert RGB (0..255) to HSL (0..1)
function rgbToHsl(r, g, b) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h = 0, s = 0, l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
      case gf: h = (bf - rf) / d + 2; break;
      case bf: h = (rf - gf) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

// Convert HSL (0..1) to RGB (0..255)
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Automatic Matte Treatment: ensures any color chosen by user is rendered with matte finish
function toMatteHex(hex) {
  if (!hex || typeof hex !== 'string') return hex;
  const rgb = hexToRgb(hex);
  const diff = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  let { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (diff < 24) {
    // True neutral / off-white / gray: cap lightness to 65% so pure white never glares
    s = Math.min(s, 0.04);
    if (l > 0.65) l = 0.65;
  } else {
    // Chromatic: cap saturation to 52% (removes neon glow) and balance lightness
    if (s > 0.52) s = 0.52;
    if (l > 0.52) l = 0.52;
    if (l < 0.42) l = 0.42;
  }

  const res = hslToRgb(h, s, l);
  return '#' + ((1 << 24) + (res.r << 16) + (res.g << 8) + res.b).toString(16).slice(1);
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
function buildSVG({ width, height, viewMode, bg, past, current, future, stats, topText, offsetFactor = 0.095, dotScale = 1.0 }) {
  const mattePast = toMatteHex(past);
  const matteCurrent = toMatteHex(current);
  const matteFuture = toMatteHex(future);

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

  const scale = (typeof dotScale === 'number' && dotScale > 0) ? dotScale : 1.0;
  const maxBoundW = width * (isMonthMode ? 0.65 : (isGoalsMode ? 0.70 : 0.74)) * scale;
  const maxBoundH = height * (isMonthMode ? 0.42 : (isGoalsMode ? 0.52 : 0.65)) * scale;

  const gapRatio = 0.48;
  const cellSpanW = cols + (cols - 1) * gapRatio;
  const cellSpanH = rows + (rows - 1) * gapRatio;

  const cellSize = Math.min(maxBoundW / cellSpanW, maxBoundH / cellSpanH);
  const gapSize = cellSize * gapRatio;

  const gridTotalW = (cols * cellSize) + ((cols - 1) * gapSize);
  const gridTotalH = (rows * cellSize) + ((rows - 1) * gapSize);

  // Top Text measurements
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

      let color = matteFuture;
      if (idx < stats.currentIndex) {
        color = mattePast;
      } else if (idx === stats.currentIndex) {
        color = matteCurrent;
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
    <text x="${width / 2}" y="${textY}" font-family="Inter, -apple-system, sans-serif" font-size="${topTextFontSize}" font-weight="600" letter-spacing="3" fill="${mattePast}" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
    `;
  }

  const daysText = `${stats.remaining}d left`;
  const percentText = ` · ${Math.round(stats.percent)}%`;
  const footerSvg = `
    <g transform="translate(${width / 2}, ${footerY})" font-family="Inter, -apple-system, sans-serif" font-size="${footerFontSize}" font-weight="500" text-anchor="middle" dominant-baseline="middle">
      <text>
        <tspan fill="${matteCurrent}">${daysText}</tspan>
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
    const topText = rawText ? rawText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() : '';
    const bg = q.bg || '#0e0e0e';
    const past = q.past || '#a1a1aa';
    const current = q.current || '#c85a38';
    const future = q.future || '#2c2c30';
    const offsetQuery = parseFloat(q.offset || q.y);
    const offsetFactor = !isNaN(offsetQuery) ? Math.min(0.25, Math.max(0, offsetQuery / 100)) : 0.095;
    const sizeParam = parseFloat(q.size || q.scale || q.dotScale);
    const dotScale = (!isNaN(sizeParam) && sizeParam >= 50 && sizeParam <= 200) ? (sizeParam / 100) : (
      (!isNaN(sizeParam) && sizeParam >= 0.5 && sizeParam <= 2.0) ? sizeParam : 1.0
    );

    // Time calculations using local time (UTC-3 for Brazil)
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
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const dayOfMonth = now.getUTCDate();

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

    // Client explicitly asked for SVG
    if (q.format === 'svg') {
      const svg = buildSVG({ width, height, viewMode, bg, past, current, future, stats, topText, offsetFactor, dotScale });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
      return res.end(svg);
    }

    // Fast, 100% Reliable Native PNG Renderer (with complete font & text rasterization)
    const bgRgb = hexToRgb(bg, { r: 14, g: 14, b: 14 });
    const pastRgb = hexToRgb(toMatteHex(past), { r: 161, g: 161, b: 170 });
    const curRgb = hexToRgb(toMatteHex(current), { r: 200, g: 90, b: 56 });
    const futRgb = hexToRgb(toMatteHex(future), { r: 44, g: 44, b: 48 });

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

    const maxBoundW = width * (isMonthMode ? 0.65 : (isGoalsMode ? 0.70 : 0.74)) * dotScale;
    const maxBoundH = height * (isMonthMode ? 0.42 : (isGoalsMode ? 0.52 : 0.65)) * dotScale;

    const gapRatio = 0.48;
    const cellSpanW = cols + (cols - 1) * gapRatio;
    const cellSpanH = rows + (rows - 1) * gapRatio;

    const cellSize = Math.min(maxBoundW / cellSpanW, maxBoundH / cellSpanH);
    const gapSize = cellSize * gapRatio;

    const gridTotalW = (cols * cellSize) + ((cols - 1) * gapSize);
    const gridTotalH = (rows * cellSize) + ((rows - 1) * gapSize);

    const hasTopText = Boolean(topText && topText.trim().length > 0);
    const cleanTopText = hasTopText ? topText.trim().toUpperCase() : '';
    const topTextFontSize = Math.max(13, height * 0.015);
    const topTextSpacing = height * 0.025;
    const topTextTotalHeight = hasTopText ? (topTextFontSize + topTextSpacing) : 0;

    const footerFontSize = Math.max(13, height * 0.0145);
    const footerSpacing = height * 0.03;
    const footerTotalHeight = footerFontSize + footerSpacing;

    const totalCompositionH = topTextTotalHeight + gridTotalH + footerTotalHeight;
    const verticalOffset = height * offsetFactor;
    const topContentY = ((height - totalCompositionH) / 2) + verticalOffset;
    const textY = topContentY + (topTextFontSize / 2);
    const startX = (width - gridTotalW) / 2;
    const startY = topContentY + topTextTotalHeight;
    const footerY = startY + gridTotalH + footerSpacing + (footerFontSize / 2);

    const pngData = createPurePNG(width, height, (setPixel, w, h) => {
      // 1. Fill background
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          setPixel(x, y, bgRgb.r, bgRgb.g, bgRgb.b, 255);
        }
      }

      // 2. Draw Top Text (if present)
      if (hasTopText) {
        const topScale = Math.max(1, Math.round(topTextFontSize / 7));
        const topH = 7 * topScale;
        const topW = measureBitmapText(cleanTopText, topScale);
        const topStartX = Math.round((w - topW) / 2);
        const topStartY = Math.round(textY - (topH / 2));
        drawBitmapText(setPixel, cleanTopText, topStartX, topStartY, topScale, pastRgb);
      }

      // 3. Draw Dots Matrix (Circles)
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

      // 4. Draw Footer Text ("57d left · 84%")
      const footerScale = Math.max(1, Math.round(footerFontSize / 7));
      const fontH = 7 * footerScale;
      const footerStartY = Math.round(footerY - (fontH / 2));

      const part1 = `${stats.remaining}d left`;
      const part2 = ` · ${Math.round(stats.percent)}%`;
      const fullFooter = part1 + part2;
      const totalFooterW = measureBitmapText(fullFooter, footerScale);
      const footerStartX = Math.round((w - totalFooterW) / 2);

      // Part 1: "57d left" in current color (accent)
      drawBitmapText(setPixel, part1, footerStartX, footerStartY, footerScale, curRgb);

      // Part 2: " · 84%" in subtle gray
      const part1W = measureBitmapText(part1, footerScale);
      const charSpacing = footerScale >= 3 ? Math.round(footerScale * 1.2) : footerScale;
      const part2StartX = footerStartX + part1W + charSpacing;
      const grayRgb = { r: 113, g: 113, b: 122 };
      drawBitmapText(setPixel, part2, part2StartX, footerStartY, footerScale, grayRgb);
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    return res.end(pngData);
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

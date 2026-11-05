/**
 * Dias Passados - Core Canvas Renderer & Exporter
 * High-resolution canvas rendering engine for mobile wallpapers
 */

// Helper to convert hex to RGB
function hexToRgb(hex, fallback = { r: 161, g: 161, b: 170 }) {
  if (!hex || typeof hex !== 'string') return fallback;
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

// Automatic Matte Treatment: ensures any color chosen by the user is rendered with matte finish
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

function drawWallpaper(canvas, targetWidth, targetHeight, state, stats) {
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Background
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Automatic matte colors for dots and typography
  const mattePast = toMatteHex(state.pastColor);
  const matteCurrent = toMatteHex(state.currentColor);
  const matteFuture = toMatteHex(state.futureColor);

  if (!stats) {
    stats = window.calculateStats(state);
  }

  const isMonth = stats.isMonthMode;
  const isGoals = stats.isGoalsMode;

  // Columns & Rows definition: 7 cols for month, 7-15 cols for goals, 15 cols for year
  let cols = 15;
  if (isMonth) {
    cols = 7;
  } else if (isGoals) {
    if (stats.total <= 35) cols = 7;
    else if (stats.total <= 100) cols = 10;
    else cols = 15;
  }
  const rows = Math.ceil(stats.total / cols);

  // Harmonious bounds across phone screens (aumentado para melhor visualização das bolinhas)
  const dotScale = (typeof state.dotScale === 'number' && state.dotScale > 0) ? state.dotScale : 1.0;
  const maxBoundW = targetWidth * (isMonth ? 0.65 : (isGoals ? 0.70 : 0.74)) * dotScale;
  const maxBoundH = targetHeight * (isMonth ? 0.42 : (isGoals ? 0.52 : 0.65)) * dotScale;

  // Standardized gap ratio and sizing (reduzido para 0.48 para bolinhas maiores e mais presentes)
  const gapRatio = 0.48;
  const cellSpanW = cols + (cols - 1) * gapRatio;
  const cellSpanH = rows + (rows - 1) * gapRatio;

  const cellSize = Math.min(maxBoundW / cellSpanW, maxBoundH / cellSpanH);
  const gapSize = cellSize * gapRatio;
  const radius = cellSize / 2;

  const gridTotalW = (cols * cellSize) + ((cols - 1) * gapSize);
  const gridTotalH = (rows * cellSize) + ((rows - 1) * gapSize);

  // Top Text measurements
  const hasTopText = Boolean(state.topText && state.topText.trim().length > 0);
  const cleanTopText = hasTopText ? state.topText.trim().toUpperCase() : '';
  const topTextFontSize = Math.max(13, targetHeight * 0.015);
  const topTextSpacing = targetHeight * 0.025;
  const topTextTotalHeight = hasTopText ? (topTextFontSize + topTextSpacing) : 0;

  // Footer measurements
  const footerFontSize = Math.max(13, targetHeight * 0.0145);
  const footerSpacing = targetHeight * 0.03;
  const footerTotalHeight = footerFontSize + footerSpacing;

  // Mathematical Centering com respiro ideal abaixo do relógio da tela de bloqueio
  const totalCompositionH = topTextTotalHeight + gridTotalH + footerTotalHeight;
  const offsetFactor = (typeof state.verticalOffset === 'number') ? (state.verticalOffset / 100) : 0.095;
  const verticalOffset = targetHeight * offsetFactor;
  const topContentY = ((targetHeight - totalCompositionH) / 2) + verticalOffset;
  const textY = topContentY + (topTextFontSize / 2);
  const startX = (targetWidth - gridTotalW) / 2;
  const startY = topContentY + topTextTotalHeight;
  const footerY = startY + gridTotalH + footerSpacing + (footerFontSize / 2);

  // Draw Top Text (se preenchido)
  if (hasTopText) {
    ctx.save();
    ctx.font = `600 ${topTextFontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = mattePast;
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '3px';
    }
    ctx.fillText(cleanTopText, targetWidth / 2, textY);
    ctx.restore();
  }

  // Draw Circles (Bolinhas)
  const totalItems = stats.total;
  const currentIndex = stats.currentIndex;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      if (index >= totalItems) break;

      const x = startX + c * (cellSize + gapSize);
      const y = startY + r * (cellSize + gapSize);

      if (index < currentIndex) {
        ctx.fillStyle = mattePast;
      } else if (index === currentIndex) {
        ctx.fillStyle = matteCurrent;
      } else {
        ctx.fillStyle = matteFuture;
      }

      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Standardized Minimalist Footer: "57d left · 84%"
  ctx.font = `500 ${footerFontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textBaseline = 'middle';

  const part1 = `${stats.remaining}d left`;
  const part2 = ` · ${Math.round(stats.percent)}%`;

  const w1 = ctx.measureText(part1).width;
  const w2 = ctx.measureText(part2).width;
  const totalW = w1 + w2;
  const textStartX = (targetWidth - totalW) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = matteCurrent;
  ctx.fillText(part1, textStartX, footerY);

  ctx.fillStyle = '#71717a';
  ctx.fillText(part2, textStartX + w1, footerY);
}

function downloadWallpaper(state, stats, btn, showToast) {
  const originalContent = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Gerando PNG...';
  }

  setTimeout(() => {
    try {
      const offscreenCanvas = document.createElement('canvas');
      drawWallpaper(offscreenCanvas, state.width, state.height, state, stats);

      offscreenCanvas.toBlob(blob => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalContent;
        }

        if (!blob) {
          if (showToast) showToast('Erro ao gerar imagem. Tente novamente.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `diaspassados-${state.viewMode}-${state.width}x${state.height}-${dateStr}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (showToast) showToast('Wallpaper baixado com sucesso!');
      }, 'image/png');
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
      if (showToast) showToast('Erro ao exportar. Tente novamente.');
    }
  }, 50);
}

window.drawWallpaper = drawWallpaper;
window.downloadWallpaper = downloadWallpaper;
window.toMatteHex = toMatteHex;


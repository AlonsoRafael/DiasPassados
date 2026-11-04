/**
 * Dias Passados - Core Canvas Renderer & Exporter
 * High-resolution canvas rendering engine for mobile wallpapers
 */

function drawWallpaper(canvas, targetWidth, targetHeight, state, stats) {
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Background
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

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

  // Harmonious bounds across phone screens
  const maxBoundW = targetWidth * (isMonth ? 0.58 : (isGoals ? 0.65 : 0.68));
  const maxBoundH = targetHeight * (isMonth ? 0.40 : (isGoals ? 0.50 : 0.64));

  // Standardized gap ratio and sizing
  const gapRatio = 0.65;
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
    ctx.fillStyle = state.pastColor;
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
        ctx.fillStyle = state.pastColor;
      } else if (index === currentIndex) {
        ctx.fillStyle = state.currentColor;
      } else {
        ctx.fillStyle = state.futureColor;
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
  ctx.fillStyle = state.currentColor;
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


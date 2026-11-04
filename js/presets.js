/**
 * Dias Passados - Presets & Constants
 * Default color palettes, month names, and device screen dimensions
 */

const PALETTES = {
  coral: {
    bg: '#0e0e0e',
    past: '#ffffff',
    current: '#f56b3f',
    future: '#333336'
  },
  obsidian: {
    bg: '#09090b',
    past: '#f8fafc',
    current: '#38bdf8',
    future: '#27272a'
  },
  emerald: {
    bg: '#05130e',
    past: '#10b981',
    current: '#34d399',
    future: '#064e3b'
  },
  amber: {
    bg: '#18110d',
    past: '#f59e0b',
    current: '#fbbf24',
    future: '#38251b'
  },
  midnight: {
    bg: '#030712',
    past: '#818cf8',
    current: '#6366f1',
    future: '#1e1b4b'
  },
  monochrome: {
    bg: '#000000',
    past: '#e5e5e5',
    current: '#ffffff',
    future: '#262626'
  }
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DEVICE_PRESETS = {
  ios: [
    { label: 'iPhone 18 Pro Max / 17 / 16 Pro Max (1320 × 2868)', val: '1320x2868', w: 1320, h: 2868 },
    { label: 'iPhone 18 Pro / 17 / 16 Pro (1206 × 2622)', val: '1206x2622', w: 1206, h: 2622 },
    { label: 'iPhone 15 / 14 Pro Max (1290 × 2796)', val: '1290x2796', w: 1290, h: 2796 },
    { label: 'iPhone 15 / 14 Pro (1179 × 2556)', val: '1179x2556', w: 1179, h: 2556 },
    { label: 'iPhone 14 / 13 / 12 Pro (1170 × 2532)', val: '1170x2532', w: 1170, h: 2532, isDefault: true },
    { label: 'iPhone XS / X / 11 Pro (1125 × 2436)', val: '1125x2436', w: 1125, h: 2436 },
    { label: 'iPhone 13 mini / 12 mini (1080 × 2340)', val: '1080x2340', w: 1080, h: 2340 },
    { label: 'Personalizado (Manual)', val: 'custom' }
  ],
  android: [
    { label: 'Samsung Galaxy S24 Ultra / S23 Ultra (1440 × 3120)', val: '1440x3120', w: 1440, h: 3120, isDefault: true },
    { label: 'Samsung Galaxy S24 / S23 / S22 (1080 × 2340)', val: '1080x2340', w: 1080, h: 2340 },
    { label: 'Google Pixel 8 / 9 (1080 × 2400)', val: '1080x2400', w: 1080, h: 2400 },
    { label: 'Google Pixel 8 Pro / 9 Pro XL (1344 × 2992)', val: '1344x2992', w: 1344, h: 2992 },
    { label: 'Xiaomi 14 Pro / 13 Pro (1440 × 3200)', val: '1440x3200', w: 1440, h: 3200 },
    { label: 'Padrão Android FHD+ (1080 × 2400)', val: '1080x2400', w: 1080, h: 2400 },
    { label: 'Personalizado (Manual)', val: 'custom' }
  ]
};

// Export to window for global access
window.PALETTES = PALETTES;
window.MONTH_NAMES = MONTH_NAMES;
window.DEVICE_PRESETS = DEVICE_PRESETS;


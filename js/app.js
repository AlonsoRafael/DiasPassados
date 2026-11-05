/**
 * Dias Passados - Main Application Controller
 * Handles UI interactions, state synchronization, events and simulator
 */

(function () {
  'use strict';

  // Application State
  const state = {
    platform: 'ios', // 'ios' | 'android'
    width: 1170,
    height: 2532,
    viewMode: 'year', // 'year' | 'month' | 'goals'
    topText: '',
    goalDays: 30,
    goalStartDate: new Date().toISOString().split('T')[0],
    verticalOffset: 9.5,
    dotScale: 1.0,
    bgColor: '#0e0e0e',
    pastColor: '#ffffff',
    currentColor: '#f56b3f',
    futureColor: '#333336',
    showLockOverlay: true
  };

  // DOM Elements
  const elements = {
    previewCanvas: document.getElementById('previewCanvas'),
    screenContainer: document.getElementById('screenContainer'),
    phoneBezel: document.getElementById('phoneBezel'),
    phoneCameraCutout: document.getElementById('phoneCameraCutout'),
    phoneBottomBar: document.getElementById('phoneBottomBar'),
    statusTime: document.getElementById('statusTime'),
    bottomShortcutLeft: document.getElementById('bottomShortcutLeft'),
    bottomShortcutRight: document.getElementById('bottomShortcutRight'),
    lockScreenOverlay: document.getElementById('lockScreenOverlay'),
    lockScreenTime: document.getElementById('lockScreenTime'),
    lockScreenDate: document.getElementById('lockScreenDate'),
    toggleLockScreenOverlay: document.getElementById('toggleLockScreenOverlay'),
    resolutionBadge: document.getElementById('resolutionBadge'),
    
    // Stats
    statPercent: document.getElementById('statPercent'),
    statPercentSub: document.getElementById('statPercentSub'),
    statCompleted: document.getElementById('statCompleted'),
    statCompletedLabel: document.getElementById('statCompletedLabel'),
    statCompletedSub: document.getElementById('statCompletedSub'),
    statRemaining: document.getElementById('statRemaining'),
    statRemainingLabel: document.getElementById('statRemainingLabel'),
    statRemainingSub: document.getElementById('statRemainingSub'),
    statPeriod: document.getElementById('statPeriod'),
    statPeriodLabel: document.getElementById('statPeriodLabel'),
    statPeriodSub: document.getElementById('statPeriodSub'),

    // Controls
    viewModeRadios: document.querySelectorAll('input[name="viewMode"]'),
    topTextInput: document.getElementById('topTextInput'),
    goalsConfigContainer: document.getElementById('goalsConfigContainer'),
    goalSummaryBadge: document.getElementById('goalSummaryBadge'),
    goalDaysInput: document.getElementById('goalDaysInput'),
    goalStartDateInput: document.getElementById('goalStartDateInput'),
    goalPresetBtns: document.querySelectorAll('.goal-preset-btn'),
    offsetRange: document.getElementById('offsetRange'),
    offsetValBadge: document.getElementById('offsetValBadge'),
    dotSizeRange: document.getElementById('dotSizeRange'),
    dotSizeValBadge: document.getElementById('dotSizeValBadge'),
    platformIosBtn: document.getElementById('platformIosBtn'),
    platformAndroidBtn: document.getElementById('platformAndroidBtn'),
    deviceModelLabel: document.getElementById('deviceModelLabel'),
    devicePresetSelect: document.getElementById('devicePresetSelect'),
    widthInput: document.getElementById('widthInput'),
    heightInput: document.getElementById('heightInput'),

    // Colors
    bgColorInput: document.getElementById('bgColorInput'),
    bgColorText: document.getElementById('bgColorText'),
    pastColorInput: document.getElementById('pastColorInput'),
    pastColorText: document.getElementById('pastColorText'),
    currentColorInput: document.getElementById('currentColorInput'),
    currentColorText: document.getElementById('currentColorText'),
    futureColorInput: document.getElementById('futureColorInput'),
    futureColorText: document.getElementById('futureColorText'),
    paletteButtons: document.querySelectorAll('.palette-preset'),

    // Buttons & Actions
    openAutomationModalBtn: document.getElementById('openAutomationModalBtn'),
    fallbackDownloadBtn: document.getElementById('fallbackDownloadBtn'),
    resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toastMsg'),

    // Modal Elements
    automationModal: document.getElementById('automationModal'),
    modalCard: document.getElementById('modalCard'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalLayoutStyleSelect: document.getElementById('modalLayoutStyleSelect'),
    modalPlatformIosBtn: document.getElementById('modalPlatformIosBtn'),
    modalPlatformAndroidBtn: document.getElementById('modalPlatformAndroidBtn'),
    modalPhoneModelLabel: document.getElementById('modalPhoneModelLabel'),
    modalPhoneModelSelect: document.getElementById('modalPhoneModelSelect'),
    modalInstructionsIos: document.getElementById('modalInstructionsIos'),
    modalInstructionsAndroid: document.getElementById('modalInstructionsAndroid'),
    modalUrlInput: document.getElementById('modalUrlInput'),
    modalCopyUrlBtn: document.getElementById('modalCopyUrlBtn'),
    modalUrlInputAndroid: document.getElementById('modalUrlInputAndroid'),
    modalCopyUrlBtnAndroid: document.getElementById('modalCopyUrlBtnAndroid'),
    modalBackBtn: document.getElementById('modalBackBtn'),
    modalCloseBtn: document.getElementById('modalCloseBtn')
  };

  // Toast Notification
  let toastTimer = null;
  function showToast(msg) {
    if (!elements.toast || !elements.toastMsg) return;
    elements.toastMsg.textContent = msg;
    elements.toast.classList.remove('translate-y-20', 'opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

  // Populate Device Dropdown
  function populateDeviceDropdown(selectElem, platform, selectedVal) {
    if (!selectElem) return;
    selectElem.innerHTML = '';
    const list = window.DEVICE_PRESETS[platform] || window.DEVICE_PRESETS.ios;
    let matched = false;
    list.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.val;
      opt.textContent = item.label;
      if (item.val === selectedVal) {
        opt.selected = true;
        matched = true;
      }
      selectElem.appendChild(opt);
    });
    if (!matched) {
      const defaultItem = list.find(i => i.isDefault) || list[0];
      selectElem.value = defaultItem.val;
    }
  }

  // Update Phone Simulator Bezel
  function updatePhoneSimulatorBezel() {
    if (!elements.phoneBezel || !elements.screenContainer) return;
    const isIos = (state.platform === 'ios');

    if (isIos) {
      elements.phoneBezel.className = "relative w-full bg-zinc-950 border-[6px] sm:border-[7px] border-zinc-800 rounded-[2.8rem] sm:rounded-[3.2rem] p-2 sm:p-2.5 phone-shadow transition-all duration-300 overflow-hidden";
      elements.screenContainer.className = "relative w-full overflow-hidden rounded-[2.2rem] sm:rounded-[2.6rem] bg-black select-none max-h-[64vh] sm:max-h-[580px] flex flex-col justify-between";

      if (elements.phoneCameraCutout) {
        elements.phoneCameraCutout.className = "transition-all duration-300 flex items-center justify-center";
        elements.phoneCameraCutout.innerHTML = `
          <div class="w-24 h-5 sm:w-26 sm:h-5.5 bg-black rounded-full shadow-inner flex items-center justify-between px-2.5 pointer-events-none ring-1 ring-zinc-800/80">
            <div class="w-2.5 h-2.5 rounded-full bg-zinc-950 ring-1 ring-zinc-900"></div>
            <div class="w-2 h-2 rounded-full bg-indigo-950/80"></div>
          </div>
        `;
      }

      if (elements.phoneBottomBar) {
        elements.phoneBottomBar.className = "w-28 sm:w-32 h-1 bg-white/70 rounded-full";
      }

      if (elements.bottomShortcutLeft) {
        elements.bottomShortcutLeft.title = "Lanterna";
        elements.bottomShortcutLeft.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6c0 2-2 4-2 7v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5c0-3-2-5-2-7a4 4 0 0 1 8 0z"/>
          </svg>
        `;
      }
      if (elements.bottomShortcutRight) {
        elements.bottomShortcutRight.title = "Câmera";
        elements.bottomShortcutRight.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        `;
      }
    } else {
      elements.phoneBezel.className = "relative w-full bg-zinc-950 border-[5px] sm:border-[6px] border-zinc-700/80 rounded-[1.8rem] sm:rounded-[2.2rem] p-2 sm:p-2.5 phone-shadow transition-all duration-300 overflow-hidden";
      elements.screenContainer.className = "relative w-full overflow-hidden rounded-[1.4rem] sm:rounded-[1.7rem] bg-black select-none max-h-[64vh] sm:max-h-[580px] flex flex-col justify-between";

      if (elements.phoneCameraCutout) {
        elements.phoneCameraCutout.className = "transition-all duration-300 flex items-center justify-center";
        elements.phoneCameraCutout.innerHTML = `
          <div class="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black rounded-full ring-1 ring-zinc-700/80 flex items-center justify-center shadow-inner">
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-950/90 ring-1 ring-zinc-900"></div>
          </div>
        `;
      }

      if (elements.phoneBottomBar) {
        elements.phoneBottomBar.className = "w-16 sm:w-20 h-1 bg-white/60 rounded-full";
      }

      if (elements.bottomShortcutLeft) {
        elements.bottomShortcutLeft.title = "Telefone";
        elements.bottomShortcutLeft.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        `;
      }
      if (elements.bottomShortcutRight) {
        elements.bottomShortcutRight.title = "Câmera";
        elements.bottomShortcutRight.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.5 10a1.5 1.5 0 0 0-1.5-1.5h-1l-1.5-2h-7l-1.5 2h-1A1.5 1.5 0 0 0 4 10v9a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V10z"/>
          </svg>
        `;
      }
    }
  }

  function setPlatform(newPlatform, updateDimensions = false) {
    state.platform = newPlatform;

    const isIos = (newPlatform === 'ios');
    if (elements.platformIosBtn && elements.platformAndroidBtn) {
      if (isIos) {
        elements.platformIosBtn.className = "platform-btn px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition border-brand-500 bg-brand-500/10 text-brand-400 shadow-sm";
        elements.platformAndroidBtn.className = "platform-btn px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200";
      } else {
        elements.platformIosBtn.className = "platform-btn px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200";
        elements.platformAndroidBtn.className = "platform-btn px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition border-brand-500 bg-brand-500/10 text-brand-400 shadow-sm";
      }
    }

    if (elements.modalPlatformIosBtn && elements.modalPlatformAndroidBtn) {
      if (isIos) {
        elements.modalPlatformIosBtn.className = "px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition border-brand-500 bg-brand-500/10 text-brand-400";
        elements.modalPlatformAndroidBtn.className = "px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200";
      } else {
        elements.modalPlatformIosBtn.className = "px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200";
        elements.modalPlatformAndroidBtn.className = "px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition border-brand-500 bg-brand-500/10 text-brand-400";
      }
    }

    if (elements.deviceModelLabel) {
      elements.deviceModelLabel.textContent = isIos ? 'Modelo do iPhone' : 'Modelo do Android';
    }
    if (elements.modalPhoneModelLabel) {
      elements.modalPhoneModelLabel.textContent = isIos ? 'Modelo do iPhone' : 'Modelo do Android';
    }

    if (elements.modalInstructionsIos && elements.modalInstructionsAndroid) {
      if (isIos) {
        elements.modalInstructionsIos.classList.remove('hidden');
        elements.modalInstructionsAndroid.classList.add('hidden');
      } else {
        elements.modalInstructionsIos.classList.add('hidden');
        elements.modalInstructionsAndroid.classList.remove('hidden');
      }
    }

    const list = window.DEVICE_PRESETS[newPlatform] || window.DEVICE_PRESETS.ios;
    const defaultItem = list.find(i => i.isDefault) || list[0];
    const currentResKey = `${state.width}x${state.height}`;

    if (updateDimensions) {
      state.width = defaultItem.w;
      state.height = defaultItem.h;
    }

    populateDeviceDropdown(elements.devicePresetSelect, newPlatform, updateDimensions ? defaultItem.val : currentResKey);
    populateDeviceDropdown(elements.modalPhoneModelSelect, newPlatform, updateDimensions ? defaultItem.val : currentResKey);

    updatePhoneSimulatorBezel();
    syncStateToInputs();
    syncStateToUrl();
    renderPreview();
    updateModalControls();
  }

  // URL Parameters Support
  function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    const plat = params.get('platform');
    if (plat === 'android' || plat === 'ios') {
      state.platform = plat;
    }

    const w = parseInt(params.get('width') || params.get('w'), 10);
    const h = parseInt(params.get('height') || params.get('h'), 10);
    if (!isNaN(w) && w >= 300) state.width = w;
    if (!isNaN(h) && h >= 300) state.height = h;

    const view = params.get('view') || params.get('mode');
    if (view === 'month' || view === 'year' || view === 'goals' || view === 'meta') {
      state.viewMode = (view === 'meta') ? 'goals' : view;
    }

    const text = params.get('text') || params.get('topText');
    if (text && text.trim().length > 0) {
      state.topText = text.trim();
    } else {
      state.topText = '';
    }

    const days = parseInt(params.get('days') || params.get('goalDays'), 10);
    if (!isNaN(days) && days >= 7 && days <= 365) {
      state.goalDays = days;
    }
    const start = params.get('start') || params.get('startDate');
    if (start && /^\d{4}-\d{2}-\d{2}$/.test(start)) {
      state.goalStartDate = start;
    }

    const offset = parseFloat(params.get('offset') || params.get('y'));
    if (!isNaN(offset) && offset >= 0 && offset <= 25) {
      state.verticalOffset = offset;
    }

    const sizeParam = parseFloat(params.get('size') || params.get('scale'));
    if (!isNaN(sizeParam)) {
      if (sizeParam >= 50 && sizeParam <= 200) {
        state.dotScale = sizeParam / 100;
      } else if (sizeParam >= 0.5 && sizeParam <= 2.0) {
        state.dotScale = sizeParam;
      }
    }

    const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const bg = params.get('bg');
    if (bg && hexRegex.test(bg)) state.bgColor = bg;
    const past = params.get('past');
    if (past && hexRegex.test(past)) state.pastColor = past;
    const current = params.get('current');
    if (current && hexRegex.test(current)) state.currentColor = current;
    const future = params.get('future');
    if (future && hexRegex.test(future)) state.futureColor = future;
  }

  function syncStateToUrl() {
    const url = new URL(window.location);
    url.searchParams.set('platform', state.platform);
    url.searchParams.set('width', state.width);
    url.searchParams.set('height', state.height);
    url.searchParams.set('view', state.viewMode);
    url.searchParams.set('bg', state.bgColor);
    url.searchParams.set('past', state.pastColor);
    url.searchParams.set('current', state.currentColor);
    url.searchParams.set('future', state.futureColor);

    url.searchParams.delete('title');
    url.searchParams.delete('topText');

    if (state.topText && state.topText.trim()) {
      url.searchParams.set('text', state.topText.trim());
    } else {
      url.searchParams.delete('text');
    }

    if (state.verticalOffset !== 9.5) {
      url.searchParams.set('offset', state.verticalOffset);
    } else {
      url.searchParams.delete('offset');
    }

    const sizePct = Math.round((state.dotScale || 1.0) * 100);
    if (sizePct !== 100) {
      url.searchParams.set('size', sizePct);
    } else {
      url.searchParams.delete('size');
    }

    if (state.viewMode === 'goals') {
      url.searchParams.set('days', state.goalDays);
      url.searchParams.set('start', state.goalStartDate);
    } else {
      url.searchParams.delete('days');
      url.searchParams.delete('start');
    }

    window.history.replaceState({}, '', url);
  }

  // Sync UI Form With State
  function syncStateToInputs() {
    elements.widthInput.value = state.width;
    elements.heightInput.value = state.height;

    elements.viewModeRadios.forEach(radio => {
      radio.checked = (radio.value === state.viewMode);
    });

    if (elements.topTextInput) {
      elements.topTextInput.value = state.topText || '';
    }

    if (elements.goalsConfigContainer) {
      if (state.viewMode === 'goals') {
        elements.goalsConfigContainer.classList.remove('hidden');
      } else {
        elements.goalsConfigContainer.classList.add('hidden');
      }
    }

    if (elements.goalDaysInput) {
      elements.goalDaysInput.value = state.goalDays;
    }
    if (elements.goalStartDateInput) {
      elements.goalStartDateInput.value = state.goalStartDate;
    }

    if (elements.offsetRange) {
      elements.offsetRange.value = state.verticalOffset;
    }
    if (elements.offsetValBadge) {
      elements.offsetValBadge.textContent = `+${state.verticalOffset}%`;
    }

    if (elements.dotSizeRange) {
      const sizePct = Math.round((state.dotScale || 1.0) * 100);
      elements.dotSizeRange.value = sizePct;
      if (elements.dotSizeValBadge) {
        elements.dotSizeValBadge.textContent = sizePct === 100 ? 'Padrão' : `${sizePct}%`;
      }
    }

    if (elements.goalPresetBtns) {
      elements.goalPresetBtns.forEach(btn => {
        const days = parseInt(btn.dataset.days, 10);
        if (days === state.goalDays) {
          btn.className = "goal-preset-btn py-1.5 rounded-lg border border-brand-500 bg-brand-500/20 text-brand-400 font-semibold transition text-center shadow-sm";
        } else {
          btn.className = "goal-preset-btn py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition text-center";
        }
      });
    }

    elements.bgColorInput.value = state.bgColor;
    elements.bgColorText.value = state.bgColor.toUpperCase();
    elements.pastColorInput.value = state.pastColor;
    elements.pastColorText.value = state.pastColor.toUpperCase();
    elements.currentColorInput.value = state.currentColor;
    elements.currentColorText.value = state.currentColor.toUpperCase();
    elements.futureColorInput.value = state.futureColor;
    elements.futureColorText.value = state.futureColor.toUpperCase();

    const currentResKey = `${state.width}x${state.height}`;
    let matched = false;
    for (const opt of elements.devicePresetSelect.options) {
      if (opt.value === currentResKey) {
        elements.devicePresetSelect.value = currentResKey;
        matched = true;
        break;
      }
    }
    if (!matched) elements.devicePresetSelect.value = 'custom';

    elements.resolutionBadge.textContent = `${state.width} × ${state.height} px`;
    elements.screenContainer.style.aspectRatio = `${state.width} / ${state.height}`;
  }

  // Update Stats in DOM
  function updateStatsDOM(stats) {
    elements.statPercent.textContent = `${stats.percent.toFixed(1)}%`;

    if (stats.isGoalsMode) {
      elements.statPercentSub.textContent = `da meta concluída`;

      elements.statCompletedLabel.textContent = 'Dia Atual';
      elements.statCompleted.textContent = `${stats.completed}`;
      elements.statCompletedSub.textContent = `de ${stats.total} dias`;

      elements.statRemainingLabel.textContent = 'Dias Restantes';
      elements.statRemaining.textContent = `${stats.remaining}`;
      elements.statRemainingSub.textContent = `restantes da meta`;

      elements.statPeriodLabel.textContent = 'Meta';
      elements.statPeriod.className = "text-lg sm:text-xl font-bold font-mono text-amber-400 truncate";
      elements.statPeriod.textContent = `${stats.total}d`;
      elements.statPeriodSub.textContent = `desafio ativo`;

      if (elements.goalSummaryBadge) {
        elements.goalSummaryBadge.textContent = `Dia ${stats.completed} de ${stats.total}`;
      }
    } else if (stats.isMonthMode) {
      elements.statPercentSub.textContent = `do mês de ${stats.monthName}`;

      elements.statCompletedLabel.textContent = 'Dias no Mês';
      elements.statCompleted.textContent = stats.completed.toLocaleString('pt-BR');
      elements.statCompletedSub.textContent = `de ${stats.total} dias`;

      elements.statRemainingLabel.textContent = 'Dias Restantes';
      elements.statRemaining.textContent = `${stats.remaining}`;
      elements.statRemainingSub.textContent = `restantes no mês`;

      elements.statPeriodLabel.textContent = 'Mês Atual';
      elements.statPeriod.className = "text-sm sm:text-base font-bold font-sans text-amber-400 truncate leading-tight";
      elements.statPeriod.textContent = stats.monthName;
      elements.statPeriodSub.textContent = `${stats.year} • Mês atual`;
    } else {
      elements.statPercentSub.textContent = `do ano de ${stats.year}`;

      elements.statCompletedLabel.textContent = 'Dias Vividos';
      elements.statCompleted.textContent = stats.completed.toLocaleString('pt-BR');
      elements.statCompletedSub.textContent = `de ${stats.total} dias`;

      elements.statRemainingLabel.textContent = 'Dias Restantes';
      elements.statRemaining.textContent = `${stats.remaining}`;
      elements.statRemainingSub.textContent = `restantes no ano`;

      elements.statPeriodLabel.textContent = 'Ano Atual';
      elements.statPeriod.className = "text-lg sm:text-xl font-bold font-mono text-amber-400 truncate";
      elements.statPeriod.textContent = stats.year;
      elements.statPeriodSub.textContent = `ano corrente`;
    }
  }

  // Render Live Preview
  function renderPreview() {
    const stats = window.calculateStats(state);
    window.drawWallpaper(elements.previewCanvas, state.width, state.height, state, stats);
    updateStatsDOM(stats);
  }

  // Realtime Clock on Phone Simulator
  function updateLockScreenClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes}`;

    if (elements.lockScreenTime) {
      elements.lockScreenTime.textContent = timeFormatted;
    }
    if (elements.statusTime) {
      elements.statusTime.textContent = timeFormatted;
    }

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateString = now.toLocaleDateString('pt-BR', options);
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    if (elements.lockScreenDate) {
      elements.lockScreenDate.textContent = dateString;
    }
  }

  // Automation Modal & URL Generator
  function getAutomationUrl() {
    const origin = window.location.origin;
    const base = (origin && origin !== 'null' && !origin.startsWith('file')) ? origin : 'https://diaspassados.vercel.app';
    const params = new URLSearchParams();
    params.set('view', state.viewMode);
    params.set('width', state.width);
    params.set('height', state.height);
    params.set('bg', state.bgColor);
    params.set('past', state.pastColor);
    params.set('current', state.currentColor);
    params.set('future', state.futureColor);

    if (state.topText && state.topText.trim()) {
      params.set('text', state.topText.trim());
    }
    if (state.viewMode === 'goals') {
      params.set('days', state.goalDays);
      params.set('start', state.goalStartDate);
    }
    if (state.verticalOffset !== 9.5) {
      params.set('offset', state.verticalOffset);
    }
    const sizePct = Math.round((state.dotScale || 1.0) * 100);
    if (sizePct !== 100) {
      params.set('size', sizePct);
    }

    return `${base}/api/wallpaper?${params.toString()}`;
  }

  function updateModalControls() {
    if (elements.modalLayoutStyleSelect) {
      elements.modalLayoutStyleSelect.value = state.viewMode;
    }
    const currentResKey = `${state.width}x${state.height}`;
    if (elements.modalPhoneModelSelect) {
      elements.modalPhoneModelSelect.value = currentResKey;
      if (!elements.modalPhoneModelSelect.value) {
        const list = window.DEVICE_PRESETS[state.platform] || window.DEVICE_PRESETS.ios;
        const def = list.find(i => i.isDefault) || list[0];
        elements.modalPhoneModelSelect.value = def.val;
      }
    }
    const generatedUrl = getAutomationUrl();
    if (elements.modalUrlInput) {
      elements.modalUrlInput.value = generatedUrl;
    }
    if (elements.modalUrlInputAndroid) {
      elements.modalUrlInputAndroid.value = generatedUrl;
    }
  }

  function openModal() {
    updateModalControls();
    elements.automationModal.classList.remove('opacity-0', 'pointer-events-none');
    elements.modalCard.classList.remove('translate-y-8', 'sm:scale-95');
  }

  function closeModal() {
    elements.automationModal.classList.add('opacity-0', 'pointer-events-none');
    elements.modalCard.classList.add('translate-y-8', 'sm:scale-95');
  }

  // --- EVENT LISTENERS ---

  // Platform selection (Sidebar)
  elements.platformIosBtn.addEventListener('click', () => setPlatform('ios', true));
  elements.platformAndroidBtn.addEventListener('click', () => setPlatform('android', true));

  // Platform selection (Modal)
  elements.modalPlatformIosBtn.addEventListener('click', () => setPlatform('ios', true));
  elements.modalPlatformAndroidBtn.addEventListener('click', () => setPlatform('android', true));

  // View Mode Toggle (Sidebar)
  elements.viewModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.viewMode = e.target.value;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    });
  });

  // View Mode Toggle (Modal)
  elements.modalLayoutStyleSelect.addEventListener('change', (e) => {
    state.viewMode = e.target.value;
    syncStateToInputs();
    syncStateToUrl();
    renderPreview();
    updateModalControls();
  });

  // Top text input
  if (elements.topTextInput) {
    elements.topTextInput.addEventListener('input', (e) => {
      state.topText = e.target.value;
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    });
  }

  // Goal Days input
  if (elements.goalDaysInput) {
    elements.goalDaysInput.addEventListener('change', (e) => {
      const days = parseInt(e.target.value, 10);
      if (!isNaN(days) && days >= 7 && days <= 365) {
        state.goalDays = days;
        syncStateToInputs();
        syncStateToUrl();
        renderPreview();
        updateModalControls();
      }
    });
  }

  // Goal Start Date input
  if (elements.goalStartDateInput) {
    elements.goalStartDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        state.goalStartDate = e.target.value;
        syncStateToUrl();
        renderPreview();
        updateModalControls();
      }
    });
  }

  // Goal Preset Buttons
  if (elements.goalPresetBtns) {
    elements.goalPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days, 10);
        if (!isNaN(days)) {
          state.goalDays = days;
          syncStateToInputs();
          syncStateToUrl();
          renderPreview();
          updateModalControls();
        }
      });
    });
  }

  // Vertical Offset Slider
  if (elements.offsetRange) {
    elements.offsetRange.addEventListener('input', (e) => {
      state.verticalOffset = parseFloat(e.target.value);
      if (elements.offsetValBadge) {
        elements.offsetValBadge.textContent = `+${state.verticalOffset}%`;
      }
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    });
  }

  // Dot Size Slider
  if (elements.dotSizeRange) {
    elements.dotSizeRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.dotScale = val / 100;
      if (elements.dotSizeValBadge) {
        elements.dotSizeValBadge.textContent = val === 100 ? 'Padrão' : `${val}%`;
      }
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    });
  }

  // Device Preset Selection (Sidebar)
  elements.devicePresetSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'custom') {
      const [w, h] = val.split('x').map(Number);
      state.width = w;
      state.height = h;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    }
  });

  // Phone Model Selection (Modal)
  elements.modalPhoneModelSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'custom') {
      const [w, h] = val.split('x').map(Number);
      state.width = w;
      state.height = h;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    }
  });

  // Manual Width / Height
  elements.widthInput.addEventListener('change', (e) => {
    const w = parseInt(e.target.value, 10);
    if (!isNaN(w) && w >= 300 && w <= 8000) {
      state.width = w;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    }
  });
  elements.heightInput.addEventListener('change', (e) => {
    const h = parseInt(e.target.value, 10);
    if (!isNaN(h) && h >= 300 && h <= 10000) {
      state.height = h;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    }
  });

  // Colors
  function handleColorChange(type, hex) {
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      state[type] = hex;
      syncStateToInputs();
      syncStateToUrl();
      renderPreview();
      updateModalControls();
    }
  }

  elements.bgColorInput.addEventListener('input', e => handleColorChange('bgColor', e.target.value));
  elements.bgColorText.addEventListener('change', e => handleColorChange('bgColor', e.target.value));

  elements.pastColorInput.addEventListener('input', e => handleColorChange('pastColor', e.target.value));
  elements.pastColorText.addEventListener('change', e => handleColorChange('pastColor', e.target.value));

  elements.currentColorInput.addEventListener('input', e => handleColorChange('currentColor', e.target.value));
  elements.currentColorText.addEventListener('change', e => handleColorChange('currentColor', e.target.value));

  elements.futureColorInput.addEventListener('input', e => handleColorChange('futureColor', e.target.value));
  elements.futureColorText.addEventListener('change', e => handleColorChange('futureColor', e.target.value));

  // Quick Palettes
  elements.paletteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      const p = window.PALETTES[key];
      if (p) {
        state.bgColor = p.bg;
        state.pastColor = p.past;
        state.currentColor = p.current;
        state.futureColor = p.future;
        syncStateToInputs();
        syncStateToUrl();
        renderPreview();
        updateModalControls();
        showToast(`Paleta ${btn.querySelector('span').textContent} aplicada!`);
      }
    });
  });

  // Toggle Lock Screen Overlay
  elements.toggleLockScreenOverlay.addEventListener('change', (e) => {
    state.showLockOverlay = e.target.checked;
    elements.lockScreenOverlay.style.opacity = state.showLockOverlay ? '1' : '0';
  });

  // Modal Triggers
  elements.openAutomationModalBtn.addEventListener('click', () => {
    if (elements.topTextInput) {
      state.topText = elements.topTextInput.value.trim();
    }
    openModal();
  });
  elements.fallbackDownloadBtn.addEventListener('click', () => {
    if (elements.topTextInput) {
      state.topText = elements.topTextInput.value.trim();
    }
    const stats = window.calculateStats(state);
    window.downloadWallpaper(state, stats, elements.fallbackDownloadBtn, showToast);
  });

  elements.modalBackBtn.addEventListener('click', closeModal);
  elements.modalCloseBtn.addEventListener('click', closeModal);
  elements.modalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Copy Modal Automation URL
  function copyModalUrl(inputElem) {
    if (!inputElem) return;
    navigator.clipboard.writeText(inputElem.value).then(() => {
      showToast('URL da foto copiada para automação!');
    }).catch(() => {
      showToast('Erro ao copiar URL');
    });
  }

  elements.modalCopyUrlBtn.addEventListener('click', () => copyModalUrl(elements.modalUrlInput));
  if (elements.modalCopyUrlBtnAndroid) {
    elements.modalCopyUrlBtnAndroid.addEventListener('click', () => copyModalUrl(elements.modalUrlInputAndroid));
  }

  // Reset Defaults
  elements.resetDefaultsBtn.addEventListener('click', () => {
    state.platform = 'ios';
    state.width = 1170;
    state.height = 2532;
    state.viewMode = 'year';
    state.topText = '';
    state.goalDays = 30;
    state.goalStartDate = new Date().toISOString().split('T')[0];
    state.verticalOffset = 9.5;
    state.dotScale = 1.0;
    state.bgColor = '#0e0e0e';
    state.pastColor = '#ffffff';
    state.currentColor = '#f56b3f';
    state.futureColor = '#333336';

    setPlatform('ios', false);
    syncStateToInputs();
    syncStateToUrl();
    renderPreview();
    updateModalControls();
    showToast('Configurações restauradas para o padrão.');
  });

  // Window resize listener
  window.addEventListener('resize', () => {
    renderPreview();
  });

  // INITIALIZATION
  loadFromUrlParams();
  setPlatform(state.platform, false);
  syncStateToInputs();
  updateLockScreenClock();
  setInterval(updateLockScreenClock, 1000);
  renderPreview();

})();


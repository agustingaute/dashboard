// ============================================
// Dashboard - Main Orchestrator
// ============================================

import { refreshDollar } from './modules/dollar.js';
import { refreshCrypto } from './modules/crypto.js';
import { refreshWeather } from './modules/weather.js';
import { refreshFootball } from './modules/football.js';
import { refreshCalendar } from './modules/calendar.js';

// Refresh intervals (milliseconds)
const INTERVALS = {
  dollar:   5  * 60 * 1000,   // 5 minutes
  crypto:   5  * 60 * 1000,   // 5 minutes
  weather:  30 * 60 * 1000,   // 30 minutes
  football: 60 * 60 * 1000,   // 60 minutes
  calendar: 30 * 60 * 1000,   // 30 minutes
};

// Module registry for retry functionality
const modules = {
  dollar:   refreshDollar,
  crypto:   refreshCrypto,
  weather:  refreshWeather,
  football: refreshFootball,
  calendar: refreshCalendar,
};

// Global retry handler (used by error state buttons)
window._retry = function (moduleName) {
  const fn = modules[moduleName];
  if (fn) fn();
};

// Schedule a module to run immediately then on an interval
function schedule(fn, interval) {
  fn();
  setInterval(fn, interval);
}

// Live clock
function startClock() {
  function tick() {
    const now = new Date();
    const clock = document.getElementById('clock');
    const dateEl = document.getElementById('date-display');

    if (clock) {
      clock.textContent = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  tick();
  setInterval(tick, 1000);
}

// Boot
function init() {
  startClock();

  schedule(refreshDollar,   INTERVALS.dollar);
  schedule(refreshCrypto,   INTERVALS.crypto);
  schedule(refreshWeather,  INTERVALS.weather);
  schedule(refreshFootball, INTERVALS.football);
  schedule(refreshCalendar, INTERVALS.calendar);
}

init();

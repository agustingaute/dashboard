const BA = { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires' };

const WMO = {
  0: 'Despejado',  1: 'Despejado',            2: 'Parcialmente nublado',
  3: 'Nublado',   45: 'Niebla',              48: 'Niebla',
  51: 'Llovizna', 53: 'Llovizna',            55: 'Llovizna',
  61: 'Lluvia',   63: 'Lluvia',              65: 'Lluvia fuerte',
  71: 'Nieve',    80: 'Chubascos',           95: 'Tormenta',
};

const ICONS = {
  sun: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>`,
  partcloud: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    <line x1="12" y1="2" x2="12" y2="4"/><line x1="18.36" y1="5.64" x2="16.95" y2="7.05"/>
    <line x1="20" y1="11" x2="18" y2="11"/>
  </svg>`,
  cloud: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
  </svg>`,
  rain: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
    <line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/>
    <line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/>
  </svg>`,
  fog: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    <line x1="3" y1="20" x2="21" y2="20"/><line x1="5" y1="23" x2="19" y2="23"/>
  </svg>`,
  snow: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
  </svg>`,
  storm: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
    <polyline points="13 11 9 17 15 17 11 23"/>
  </svg>`,
};

function getIcon(code) {
  if ([0, 1].includes(code))                   return ICONS.sun;
  if (code === 2)                              return ICONS.partcloud;
  if (code === 3)                              return ICONS.cloud;
  if ([45, 48].includes(code))                 return ICONS.fog;
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return ICONS.rain;
  if ([71,73,75].includes(code))               return ICONS.snow;
  if ([95,96,99].includes(code))               return ICONS.storm;
  return ICONS.cloud;
}

function buildUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`;
}

function rowHTML(label, current) {
  const desc = WMO[current.weather_code] ?? '—';
  const temp = Math.round(current.temperature_2m);
  const hum  = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);

  return `
    <div class="weather-row">
      <div class="weather-left">
        <span class="weather-icon">${getIcon(current.weather_code)}</span>
        <span class="weather-place">${label}</span>
      </div>
      <div class="weather-right">
        <span class="weather-temp">${temp}°</span>
        <span class="weather-note">${desc} · ${hum}% · ${wind}km/h</span>
      </div>
    </div>
  `;
}

export async function refreshWeather() {
  try {
    const res = await fetch(buildUrl(BA.lat, BA.lon));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { current } = await res.json();

    let html = `<div class="weather-grid">${rowHTML(BA.name, current)}`;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const r = await fetch(buildUrl(pos.coords.latitude, pos.coords.longitude));
          const { current: c } = await r.json();
          const grid = document.querySelector('#weather-content .weather-grid');
          if (grid) grid.insertAdjacentHTML('beforeend', rowHTML('Tu ubicación', c));
        } catch (_) {}
      }, () => {});
    }

    html += '</div>';
    document.getElementById('weather-content').innerHTML = html;

  } catch (err) {
    document.getElementById('weather-content').innerHTML =
      `<div class="error-state"><span>Sin datos</span><span class="error-msg">${err.message}</span>
       <button class="retry-btn" onclick="window._retry('weather')">Reintentar</button></div>`;
  }
}

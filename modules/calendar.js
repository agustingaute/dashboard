const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPE     = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly';

let gapiReady = false, gisReady = false, tokenClient = null, hasToken = false;

const TOKEN_KEY = 'gcal_token';

function saveToken(tokenResponse) {
  const expiry = Date.now() + (tokenResponse.expires_in - 60) * 1000;
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: tokenResponse.access_token, expiry }));
}

function loadToken() {
  try {
    const stored = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
    if (stored && stored.expiry > Date.now()) return stored.token;
  } catch {}
  return null;
}

function applyToken(accessToken) {
  gapi.client.setToken({ access_token: accessToken });
  hasToken = true;
}

function initGapi() {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({ apiKey: CONFIG.GOOGLE_API_KEY, discoveryDocs: [DISCOVERY] });
      gapiReady = true;
      // Restore saved token into gapi client if still valid
      const saved = loadToken();
      if (saved) applyToken(saved);
      tryInit();
    } catch (e) { showError('Error Google API: ' + e.message); }
  });
}

function initGis() {
  if (!CONFIG.GOOGLE_CLIENT_ID) { showNoConfig(); return; }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: (r) => {
      if (r.error) { showError('Error auth: ' + r.error); return; }
      saveToken(r);
      applyToken(r.access_token);
      // Marcar que el usuario ya autorizó alguna vez
      localStorage.setItem('gcal_authorized', '1');
      listEvents();
    },
  });
  gisReady = true;
  tryInit();
}

// Support both: script onload fires before module, or module loads first
window._gapiLoaded = initGapi;
window._gisLoaded  = initGis;

// If the Google scripts already loaded before this module ran, init now
if (window.gapi) initGapi();
if (window.google?.accounts) initGis();

function tryInit() {
  if (!gapiReady || !gisReady) return;
  const saved = loadToken();
  if (saved) {
    // Token válido → cargar directo
    listEvents();
  } else if (localStorage.getItem('gcal_authorized')) {
    // Ya autorizó antes pero el token expiró → pedir nuevo sin pantalla de consent
    // prompt: '' evita pedir consent de nuevo si los scopes ya fueron otorgados
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    // Primera vez → mostrar botón
    showConnect();
  }
}

function showNoConfig() {
  document.getElementById('calendar-content').innerHTML = `
    <div class="cal-connect">
      <p class="cal-connect-text">Configurá tu Google Client ID en config.js para activar el calendario</p>
    </div>`;
}

function showConnect() {
  document.getElementById('calendar-content').innerHTML = `
    <div class="cal-connect">
      <p class="cal-connect-text">Conectá tu Google Calendar para ver tus eventos</p>
      <button class="connect-btn" id="cal-btn">Conectar calendario</button>
    </div>`;
  document.getElementById('cal-btn')?.addEventListener('click', () => {
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

function showError(msg) {
  document.getElementById('calendar-content').innerHTML =
    `<div class="error-state"><span>Error</span><span class="error-msg">${msg}</span></div>`;
}

// Calendarios a mostrar: nombre parcial (case-insensitive) → color del dot
const CAL_CONFIG = [
  { match: null,           color: '#f59e0b', key: 'primary' }, // primary = ámbar
  { match: 'river plate',  color: '#ef4444', key: 'rp'      }, // River Plate = rojo
  { match: 'river content',color: '#60a5fa', key: 'rc'      }, // River Content = azul
];

// Resolved calendar list: { id, color }
let resolvedCals = [];

async function getCalendars() {
  try {
    const r = await gapi.client.calendar.calendarList.list({ minAccessRole: 'reader' });
    const all = r.result.items || [];
    resolvedCals = [];
    for (const cal of all) {
      const name = cal.summary?.toLowerCase() || '';
      if (cal.primary) {
        resolvedCals.push({ id: cal.id, color: '#f59e0b' });
      } else if (name.includes('river plate') || name.includes('riverplate')) {
        resolvedCals.push({ id: cal.id, color: '#ef4444' });
      } else if (name.includes('river content')) {
        resolvedCals.push({ id: cal.id, color: '#60a5fa' });
      }
    }
    if (!resolvedCals.length) resolvedCals = [{ id: 'primary', color: '#f59e0b' }];
    return resolvedCals;
  } catch {
    return [{ id: 'primary', color: '#f59e0b' }];
  }
}

async function listEvents() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  try {
    const cals = await getCalendars();

    const results = await Promise.allSettled(
      cals.map(cal =>
        gapi.client.calendar.events.list({
          calendarId:   cal.id,
          timeMin:      start.toISOString(),
          timeMax:      end.toISOString(),
          singleEvents: true,
          maxResults:   100,
          orderBy:      'startTime',
        }).then(r => ({ items: r.result.items || [], color: cal.color }))
      )
    );

    // Each item carries its calendar color
    const allItems = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.items.map(ev => ({ ...ev, _calColor: r.value.color })));

    renderMonthGrid(allItems, now);
  } catch (e) { showError(e.message); }
}

function renderMonthGrid(items, today) {
  const el = document.getElementById('calendar-content');
  if (!el) return;

  const year      = today.getFullYear();
  const month     = today.getMonth();
  const todayDate = today.getDate();

  const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');

  // Build map: key -> [{ color, title, start, end }]
  const byDay = {};
  items.forEach(ev => {
    const raw = ev.start.date || ev.start.dateTime;
    const d   = new Date(raw);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push({
      color: ev._calColor,
      title: ev.summary || '',
      startDT: ev.start.dateTime || null,
      endDT:   ev.end?.dateTime   || null,
      allDay:  !!ev.start.date && !ev.start.dateTime,
    });
  });

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const dayHeaders = ['D','L','M','X','J','V','S']
    .map(d => `<div class="mcal-dow">${d}</div>`).join('');

  let cells = '';
  for (let i = 0; i < firstWeekday; i++) {
    cells += `<div class="mcal-cell mcal-cell--empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key     = `${year}-${month}-${day}`;
    const events  = byDay[key] || [];
    const isToday = day === todayDate;
    const isPast  = day < todayDate;

    // Progressive shade: day 1 → ~0.02, day 31 → ~0.09 (linear ramp)
    const shade = (0.02 + (day - 1) / (daysInMonth - 1) * 0.07).toFixed(4);
    const shadeStyle = `--day-shade: rgba(0,0,0,${shade})`;

    // Show up to 3 event pills with short label, then "+N más"
    const maxPills = 3;
    const pills = events.slice(0, maxPills).map(ev => {
      const label = ev.title.split(' ').slice(0, 3).join(' ') || '•';
      // Build time string for tooltip
      let timeStr = '';
      if (ev.startDT) {
        const fmt = t => new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        timeStr = fmt(ev.startDT) + (ev.endDT ? ' – ' + fmt(ev.endDT) : '');
      } else {
        timeStr = 'Todo el día';
      }
      const tooltip = `${ev.title}\n${timeStr}`;
      return `<div class="mcal-event-pill" data-tooltip="${tooltip.replace(/"/g, '&quot;')}" data-color="${ev.color}">
        <span class="mcal-event-dot" style="background:${ev.color}"></span>
        <span class="mcal-event-label">${label}</span>
      </div>`;
    }).join('');

    const overflow = events.length > maxPills
      ? `<div class="mcal-event-more">+${events.length - maxPills}</div>`
      : '';

    cells += `
      <div class="mcal-cell${isToday ? ' mcal-cell--today' : ''}${isPast ? ' mcal-cell--past' : ''}" style="${shadeStyle}">
        <span class="mcal-num${isToday ? ' mcal-num--today' : ''}">${day}</span>
        <div class="mcal-events">${pills}${overflow}</div>
      </div>`;
  }

  // Build legend from resolved cals
  const legendItems = resolvedCals.map(c => {
    const name = c.color === '#f59e0b' ? 'Personal'
      : c.color === '#ef4444' ? 'River Plate'
      : 'River Content';
    return `<span class="mcal-legend-item"><span class="mcal-event-dot" style="background:${c.color}"></span>${name}</span>`;
  }).join('');

  el.innerHTML = `
    <div class="mcal-header">
      <span class="mcal-month-label">${monthName}</span>
      <div class="mcal-legend">${legendItems}</div>
    </div>
    <div class="mcal-grid">
      ${dayHeaders}
      ${cells}
    </div>`;
}

export function refreshCalendar() {
  if (!CONFIG.GOOGLE_CLIENT_ID || !CONFIG.GOOGLE_API_KEY) { showNoConfig(); return; }
  if (gapiReady && gisReady && hasToken) listEvents();
}

// ── Tooltip global (fixed en body para evitar overflow:hidden) ──
const tip = document.createElement('div');
tip.id = 'cal-tooltip';
document.body.appendChild(tip);

document.addEventListener('mouseover', e => {
  const pill = e.target.closest('.mcal-event-pill[data-tooltip]');
  if (!pill) return;
  tip.textContent = pill.getAttribute('data-tooltip');
  const color = pill.getAttribute('data-color') || '#1c1c1c';
  tip.style.background = color;
  tip.style.display = 'block';
});

document.addEventListener('mousemove', e => {
  if (tip.style.display === 'none') return;
  const x = e.clientX;
  const y = e.clientY;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  const vw = window.innerWidth;
  // Posicionar encima del cursor, ajustando si se sale de la pantalla
  let left = x - tw / 2;
  if (left < 6) left = 6;
  if (left + tw > vw - 6) left = vw - tw - 6;
  tip.style.left = left + 'px';
  tip.style.top  = (y - th - 12) + 'px';
});

document.addEventListener('mouseout', e => {
  const pill = e.target.closest('.mcal-event-pill[data-tooltip]');
  if (pill) tip.style.display = 'none';
});

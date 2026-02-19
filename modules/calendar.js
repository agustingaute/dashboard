const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPE     = 'https://www.googleapis.com/auth/calendar.readonly';

let gapiReady = false, gisReady = false, tokenClient = null, hasToken = false;

window._gapiLoaded = function () {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({ apiKey: CONFIG.GOOGLE_API_KEY, discoveryDocs: [DISCOVERY] });
      gapiReady = true;
      tryInit();
    } catch (e) { showError('Error Google API: ' + e.message); }
  });
};

window._gisLoaded = function () {
  if (!CONFIG.GOOGLE_CLIENT_ID) { showNoConfig(); return; }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: (r) => { if (!r.error) { hasToken = true; listEvents(); } },
  });
  gisReady = true;
  tryInit();
};

function tryInit() {
  if (gapiReady && gisReady) showConnect();
}

function showNoConfig() {
  document.getElementById('calendar-content').innerHTML = `
    <div class="cal-connect">
      <p class="cal-connect-text">Configurá tu Google Client ID en config.js para activar el calendario</p>
    </div>`;
}

function showConnect() {
  if (hasToken) { listEvents(); return; }
  document.getElementById('calendar-content').innerHTML = `
    <div class="cal-connect">
      <p class="cal-connect-text">Conectá tu Google Calendar para ver tus próximos eventos</p>
      <button class="connect-btn" id="cal-btn">Conectar calendario</button>
    </div>`;
  document.getElementById('cal-btn')?.addEventListener('click', () => {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

function showError(msg) {
  document.getElementById('calendar-content').innerHTML =
    `<div class="error-state"><span>Error</span><span class="error-msg">${msg}</span></div>`;
}

async function listEvents() {
  try {
    const r = await gapi.client.calendar.events.list({
      calendarId: 'primary', timeMin: new Date().toISOString(),
      singleEvents: true, maxResults: 6, orderBy: 'startTime',
    });
    renderEvents(r.result.items);
  } catch (e) { showError(e.message); }
}

function renderEvents(items) {
  const el = document.getElementById('calendar-content');
  if (!el) return;

  if (!items?.length) {
    el.innerHTML = '<p class="cal-empty">Sin eventos próximos</p>';
    return;
  }

  const rows = items.map(ev => {
    const start = ev.start.dateTime || ev.start.date;
    const d     = new Date(start);
    const day   = d.getDate();
    const month = d.toLocaleDateString('es-AR', { month: 'short' });
    const time  = ev.start.dateTime
      ? d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      : 'Todo el día';
    const title = ev.summary || '(Sin título)';

    return `
      <div class="cal-row">
        <div class="cal-date">
          <span class="cal-day">${day}</span>
          <span class="cal-month">${month}</span>
        </div>
        <div class="cal-line"></div>
        <div class="cal-info">
          <div class="cal-title" title="${title}">${title}</div>
          <div class="cal-time">${time}</div>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = `<div class="cal-list">${rows}</div>`;
}

export function refreshCalendar() {
  if (!CONFIG.GOOGLE_CLIENT_ID || !CONFIG.GOOGLE_API_KEY) { showNoConfig(); return; }
  if (gapiReady && gisReady && hasToken) listEvents();
}

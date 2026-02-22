// Calendar IDs (all public, no OAuth needed)
const CALENDARS = [
  { id: 'agustingaute@gmail.com',                                                                          color: '#f59e0b', name: 'Personal'      },
  { id: 'b6720a0cc1fb28d21bc25f874481e4722b2147d93e2762c65822d0e6589e3ed4@group.calendar.google.com',     color: '#60a5fa', name: 'River Content' },
  { id: 'calendarioriverplate@gmail.com',                                                                  color: '#ef4444', name: 'River Plate'   },
];

async function fetchEvents(calendarId, apiKey) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const encId = encodeURIComponent(calendarId);
  const url   = `https://www.googleapis.com/calendar/v3/calendars/${encId}/events`
    + `?key=${apiKey}&timeMin=${start}&timeMax=${end}&singleEvents=true&maxResults=100&orderBy=startTime`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

async function listEvents() {
  const apiKey = window.CONFIG?.GOOGLE_API_KEY;
  if (!apiKey) { showError('Falta GOOGLE_API_KEY en config.js'); return; }

  try {
    const results = await Promise.allSettled(
      CALENDARS.map(cal => fetchEvents(cal.id, apiKey).then(items => ({ items, color: cal.color })))
    );

    const allItems = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.items.map(ev => ({ ...ev, _calColor: r.value.color })));

    renderMonthGrid(allItems, new Date());
  } catch (e) { showError(e.message); }
}

function showError(msg) {
  document.getElementById('calendar-content').innerHTML =
    `<div class="error-state"><span>Error</span><span class="error-msg">${msg}</span></div>`;
}

function renderMonthGrid(items, today) {
  const el = document.getElementById('calendar-content');
  if (!el) return;

  const year      = today.getFullYear();
  const month     = today.getMonth();
  const todayDate = today.getDate();

  const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');

  // Build map: key -> [{ color, title, startDT, endDT, allDay }]
  const byDay = {};
  items.forEach(ev => {
    let year, month, day;
    if (ev.start.date) {
      // All-day: "YYYY-MM-DD" — parse directly to avoid UTC offset shifting the date
      [year, month, day] = ev.start.date.split('-').map(Number);
      month -= 1; // JS months are 0-indexed
    } else {
      const d = new Date(ev.start.dateTime);
      year = d.getFullYear(); month = d.getMonth(); day = d.getDate();
    }
    const key = `${year}-${month}-${day}`;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push({
      color:   ev._calColor,
      title:   ev.summary || '',
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

    const shade = (0.02 + (day - 1) / (daysInMonth - 1) * 0.07).toFixed(4);
    const shadeStyle = `--day-shade: rgba(0,0,0,${shade})`;

    const maxPills = 3;
    const pills = events.slice(0, maxPills).map(ev => {
      const label = ev.title.split(' ').slice(0, 3).join(' ') || '•';
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

  const legendItems = CALENDARS.map(c =>
    `<span class="mcal-legend-item"><span class="mcal-event-dot" style="background:${c.color}"></span>${c.name}</span>`
  ).join('');

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
  listEvents();
}

// ── Tooltip global ──
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
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  const vw = window.innerWidth;
  let left = e.clientX - tw / 2;
  if (left < 6) left = 6;
  if (left + tw > vw - 6) left = vw - tw - 6;
  tip.style.left = left + 'px';
  tip.style.top  = (e.clientY - th - 12) + 'px';
});

document.addEventListener('mouseout', e => {
  const pill = e.target.closest('.mcal-event-pill[data-tooltip]');
  if (pill) tip.style.display = 'none';
});

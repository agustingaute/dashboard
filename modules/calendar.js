// Calendar IDs (all public, no OAuth needed)
const CALENDARS = [
  { id: 'agustingaute@gmail.com',                                                                          color: '#f59e0b', name: 'Personal'      },
  { id: 'b6720a0cc1fb28d21bc25f874481e4722b2147d93e2762c65822d0e6589e3ed4@group.calendar.google.com',     color: '#60a5fa', name: 'River Content' },
  { id: 'calendarioriverplate@gmail.com',                                                                  color: '#ef4444', name: 'River Plate'   },
];

async function fetchEvents(calendarId, apiKey) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // Extend to cover trailing cells of next month (up to 6 extra days)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 6, 23, 59, 59).toISOString();
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

  // Classify events: single-day (pills) vs multi-day (spanning bars)
  const singleByDay = {};
  const multis = [];

  items.forEach(ev => {
    if (ev.start.date) {
      const [sy, sm, sd] = ev.start.date.split('-').map(Number);
      const [ey, em, ed] = (ev.end?.date || ev.start.date).split('-').map(Number);
      const s = new Date(sy, sm - 1, sd);
      const e = new Date(ey, em - 1, ed); // exclusive
      if ((e - s) / 86400000 > 1) {
        multis.push({ color: ev._calColor, title: ev.summary || '', s, e });
      } else {
        const key = `${sy}-${sm - 1}-${sd}`;
        (singleByDay[key] = singleByDay[key] || []).push({ color: ev._calColor, title: ev.summary || '', startDT: null, endDT: null });
      }
    } else {
      const sd = new Date(ev.start.dateTime);
      const ed = new Date(ev.end?.dateTime || ev.start.dateTime);
      const sDay = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
      const eDay = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
      if (eDay > sDay) {
        multis.push({ color: ev._calColor, title: ev.summary || '', s: sDay, e: new Date(eDay.getTime() + 86400000) });
      } else {
        const key = `${sDay.getFullYear()}-${sDay.getMonth()}-${sDay.getDate()}`;
        (singleByDay[key] = singleByDay[key] || []).push({ color: ev._calColor, title: ev.summary || '', startDT: ev.start.dateTime, endDT: ev.end?.dateTime || null });
      }
    }
  });

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalRows    = Math.max(5, Math.ceil((firstWeekday + daysInMonth) / 7));

  const dayHeaders = ['D','L','M','X','J','V','S']
    .map(d => `<div class="mcal-dow">${d}</div>`).join('');

  let weeksHtml = '';
  for (let w = 0; w < totalRows; w++) {
    const weekBaseDay = 1 - firstWeekday + w * 7; // day-of-month for col 0 (Sunday) of this week
    const weekStart   = new Date(year, month, weekBaseDay);
    const weekEnd     = new Date(year, month, weekBaseDay + 6);

    // Day cells
    let dayCells = '';
    for (let col = 0; col < 7; col++) {
      const dom  = weekBaseDay + col; // day-of-month (can be < 1 or > daysInMonth)
      const date = new Date(year, month, dom);
      const d    = date.getDate();
      const isCurrentMonth = dom >= 1 && dom <= daysInMonth;
      const isPrevMonth    = dom < 1;
      const isNextMonth    = dom > daysInMonth;
      const isToday        = isCurrentMonth && d === todayDate;
      const isPast         = isCurrentMonth && d < todayDate;

      if (isPrevMonth) {
        dayCells += `<div class="mcal-cell mcal-cell--empty" style="grid-row:1"></div>`;
        continue;
      }

      const shade = isCurrentMonth
        ? (0.02 + (d - 1) / (daysInMonth - 1) * 0.07).toFixed(4)
        : '0.18';

      const key    = `${date.getFullYear()}-${date.getMonth()}-${d}`;
      const events = singleByDay[key] || [];
      const pills  = events.slice(0, 2).map(ev => {
        const label   = ev.title.split(' ').slice(0, 3).join(' ') || '•';
        const timeStr = ev.startDT
          ? new Date(ev.startDT).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          : 'Todo el día';
        const tooltip = `${ev.title}\n${timeStr}`;
        return `<div class="mcal-event-pill" data-tooltip="${tooltip.replace(/"/g, '&quot;')}" data-color="${ev.color}">
          <span class="mcal-event-dot" style="background:${ev.color}"></span>
          <span class="mcal-event-label">${label}</span>
        </div>`;
      }).join('');
      const overflow = events.length > 2 ? `<div class="mcal-event-more">+${events.length - 2}</div>` : '';

      const cls = ['mcal-cell', isToday ? 'mcal-cell--today' : '', isPast ? 'mcal-cell--past' : '', isNextMonth ? 'mcal-cell--next-month' : ''].filter(Boolean).join(' ');
      dayCells += `<div class="${cls}" style="grid-row:1; --day-shade:rgba(0,0,0,${shade})">
        <span class="mcal-num${isToday ? ' mcal-num--today' : ''}">${d}</span>
        <div class="mcal-events">${pills}${overflow}</div>
      </div>`;
    }

    // Multi-day event bars
    let bars = '';
    multis
      .filter(ev => ev.s <= weekEnd && ev.e > weekStart)
      .forEach(ev => {
        const barStart   = ev.s < weekStart ? 1 : ev.s.getDay() + 1;
        const lastDay    = new Date(ev.e.getTime() - 86400000); // e is exclusive → last real day
        const lastInWeek = lastDay > weekEnd ? weekEnd : lastDay;
        const barEnd     = lastInWeek.getDay() + 1;
        const span       = barEnd - barStart + 1;
        const tip        = ev.title.replace(/"/g, '&quot;');
        bars += `<div class="mcal-event-bar" style="grid-column:${barStart}/span ${span}; --bar-color:${ev.color}" data-tooltip="${tip}" data-color="${ev.color}">
          <span class="mcal-event-bar-label">${ev.title}</span>
        </div>`;
      });

    weeksHtml += `<div class="mcal-week">${dayCells}${bars}</div>`;
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
      <div class="mcal-dow-row">${dayHeaders}</div>
      ${weeksHtml}
    </div>`;
}

export function refreshCalendar() {
  listEvents();
}

// ── Tooltip global ──
const tip = document.getElementById('cal-tooltip');

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

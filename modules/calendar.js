// Calendar IDs (all public, no OAuth needed)
const CALENDARS = [
  { id: 'agustingaute@gmail.com',                                                                          color: 'rgba(120,120,120,0.5)', name: 'Personal'      },
  { id: 'b6720a0cc1fb28d21bc25f874481e4722b2147d93e2762c65822d0e6589e3ed4@group.calendar.google.com',     color: 'rgba(50,50,50,0.4)',    name: 'River Content' },
  { id: 'calendarioriverplate@gmail.com',                                                                  color: '#C8102E', name: 'River Plate'   },
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

// Pack multi-day bars into rows (greedy: first row that has space)
function packBars(bars) {
  const rowEnds = []; // rowEnds[r] = last colEnd used in row r
  return bars.map(bar => {
    const colEnd = bar.colStart + bar.span - 1;
    let row = rowEnds.findIndex(end => end < bar.colStart);
    if (row === -1) { row = rowEnds.length; rowEnds.push(0); }
    rowEnds[row] = colEnd;
    return { ...bar, row };
  });
}

function renderMonthGrid(items, today) {
  const el = document.getElementById('calendar-content');
  if (!el) return;

  const year      = today.getFullYear();
  const month     = today.getMonth();
  const todayDate = today.getDate();

  const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalRows    = Math.max(5, Math.ceil((firstWeekday + daysInMonth) / 7));

  // ── Classify events ──────────────────────────────────────────────────────
  const multiDayByWeek = Array.from({ length: totalRows }, () => []);
  const singleByDay    = {};

  items.forEach(ev => {
    let evStart, evEnd, startDT = null;
    if (ev.start.date) {
      const [sy, sm, sd] = ev.start.date.split('-').map(Number);
      const [ey, em, ed] = (ev.end?.date || ev.start.date).split('-').map(Number);
      evStart = new Date(sy, sm - 1, sd);
      evEnd   = new Date(ey, em - 1, ed); // exclusive
    } else {
      const sd = new Date(ev.start.dateTime);
      const ed = new Date(ev.end?.dateTime || ev.start.dateTime);
      evStart  = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
      evEnd    = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate() + 1); // exclusive
      startDT  = ev.start.dateTime;
    }

    const spanDays   = (evEnd - evStart) / 86400000;
    const isMultiDay = spanDays > 1;

    if (!isMultiDay) {
      if (evStart.getFullYear() === year && evStart.getMonth() === month) {
        const dom = evStart.getDate();
        if (!singleByDay[dom]) singleByDay[dom] = [];
        singleByDay[dom].push({ color: ev._calColor, title: ev.summary || '', startDT });
      }
    } else {
      for (let w = 0; w < totalRows; w++) {
        const wBase      = 1 - firstWeekday + w * 7;
        const weekStart  = new Date(year, month, wBase);
        const weekEndInc = new Date(year, month, wBase + 6);
        const weekEndExc = new Date(year, month, wBase + 7);
        if (evStart >= weekEndExc || evEnd <= weekStart) continue;

        const colStart = evStart < weekStart ? 1 : evStart.getDay() + 1;
        const lastDay  = new Date(evEnd.getTime() - 86400000);
        const lastInWk = lastDay > weekEndInc ? weekEndInc : lastDay;
        const colEnd   = lastInWk.getDay() + 1;
        const span     = colEnd - colStart + 1;

        multiDayByWeek[w].push({ color: ev._calColor, title: ev.summary || '', colStart, span });
      }
    }
  });

  // ── Render ────────────────────────────────────────────────────────────────
  // New architecture: each week = bars section (position:relative, bars use % widths)
  //                              + cells section (7-col grid below)
  // Column backgrounds are rendered in BOTH sections so shading is continuous.
  const NUM_H     = 22; // px reserved at top of bars section for day numbers
  const BAR_ROW_H = 18; // px per bar row (14px bar + 2px top + 2px bottom)

  const dayHeaders = ['D','L','M','X','J','V','S']
    .map(d => `<div class="mcal-dow">${d}</div>`).join('');

  let weeksHtml = '';
  for (let w = 0; w < totalRows; w++) {
    const wBase  = 1 - firstWeekday + w * 7;
    const packed = packBars(multiDayByWeek[w]);
    const numBarRows   = packed.length > 0 ? Math.max(...packed.map(b => b.row)) + 1 : 0;
    // Bars section always shows (contains day numbers at top + event bars below)
    const barsHeight   = NUM_H + numBarRows * BAR_ROW_H;

    // ── Background columns for bars section (visual continuity with cells) ──
    let bgColsHtml = '';
    for (let col = 0; col < 7; col++) {
      const dom     = wBase + col;
      const d       = new Date(year, month, dom).getDate();
      const isCur   = dom >= 1 && dom <= daysInMonth;
      const isToday = isCur && d === todayDate;
      const shade   = isCur
        ? (0.02 + (d - 1) / (daysInMonth - 1) * 0.07).toFixed(4)
        : '0.18';
      const todayAttr = isToday ? ' data-today="1"' : '';
      const numClass  = `mcal-num${isToday ? ' mcal-num--today' : ''}${!isCur ? ' mcal-num--faded' : ''}`;
      bgColsHtml += `<div class="mcal-barcol-bg" style="background:rgba(0,0,0,${shade})" data-col="${col}"${todayAttr}>
        <span class="${numClass}">${d}</span>
      </div>`;
    }

    // ── Multi-day bars (absolutely positioned with % widths) ──
    let barsHtml = '';
    packed.forEach(bar => {
      const left  = ((bar.colStart - 1) / 7 * 100).toFixed(3);
      const width = (bar.span / 7 * 100).toFixed(3);
      const top   = NUM_H + bar.row * BAR_ROW_H + 2;
      barsHtml += `<div class="mcal-bar"
        style="left:${left}%;width:${width}%;top:${top}px;background:${bar.color}"
        data-tooltip="${bar.title.replace(/"/g, '&quot;')}" data-color="${bar.color}">
        <span class="mcal-bar-label">${bar.title}</span>
      </div>`;
    });

    // ── Day cells — contain day number + single-day pills ──
    let cellsHtml = '';
    for (let col = 0; col < 7; col++) {
      const dom     = wBase + col;
      const date    = new Date(year, month, dom);
      const d       = date.getDate();
      const isCur   = dom >= 1 && dom <= daysInMonth;
      const isToday = isCur && d === todayDate;
      const isPast  = isCur && d < todayDate;
      const isNext  = dom > daysInMonth;

      if (dom < 1) {
        cellsHtml += `<div class="mcal-cell mcal-cell--empty"></div>`;
        continue;
      }

      const shade = isCur
        ? (0.02 + (d - 1) / (daysInMonth - 1) * 0.07).toFixed(4)
        : '0.18';

      const cls = ['mcal-cell',
        isToday ? 'mcal-cell--today' : '',
        isPast  ? 'mcal-cell--past'  : '',
        isNext  ? 'mcal-cell--next'  : '',
      ].filter(Boolean).join(' ');

      const dayEvs  = isCur ? (singleByDay[d] || []) : [];
      const visible = dayEvs.slice(0, 3);
      const more    = dayEvs.length - visible.length;

      const pillsHtml = visible.map(ev => {
        const timeStr = ev.startDT
          ? new Date(ev.startDT).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
          : '';
        const label   = ev.title.split(' ').slice(0, 3).join(' ');
        const tooltip = ev.title + (timeStr ? '\n' + timeStr : '');
        return `<div class="mcal-pill" data-tooltip="${tooltip.replace(/"/g, '&quot;')}" data-color="${ev.color}">
          <span class="mcal-pill-dot" style="background:${ev.color}"></span>
          <span class="mcal-pill-label">${timeStr ? timeStr + ' ' : ''}${label}</span>
        </div>`;
      }).join('');

      const morePill = more > 0 ? `<div class="mcal-more">+${more}</div>` : '';

      cellsHtml += `<div class="${cls}" style="--shade:rgba(0,0,0,${shade})" data-col="${col}">
        ${pillsHtml || morePill ? `<div class="mcal-pills">${pillsHtml}${morePill}</div>` : ''}
      </div>`;
    }

    weeksHtml += `<div class="mcal-week">
      <div class="mcal-week-bars" style="height:${barsHeight}px">
        <div class="mcal-bars-bg">${bgColsHtml}</div>
        ${barsHtml}
      </div>
      <div class="mcal-week-cells">${cellsHtml}</div>
    </div>`;
  }

  const legendItems = CALENDARS.map(c =>
    `<span class="mcal-legend-item"><span class="mcal-dot" style="background:${c.color}"></span>${c.name}</span>`
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

// ── Column hover: highlight full column (bars section + cells section) ──
document.addEventListener('mouseover', e => {
  const cell = e.target.closest('.mcal-cell:not(.mcal-cell--empty)');
  if (!cell) return;
  const week = cell.closest('.mcal-week');
  const col  = cell.dataset.col;
  week?.querySelector(`.mcal-barcol-bg[data-col="${col}"]`)?.classList.add('mcal-barcol-bg--hover');
});

document.addEventListener('mouseout', e => {
  const cell = e.target.closest('.mcal-cell:not(.mcal-cell--empty)');
  if (!cell) return;
  const week = cell.closest('.mcal-week');
  week?.querySelectorAll('.mcal-barcol-bg--hover').forEach(el => el.classList.remove('mcal-barcol-bg--hover'));
});

// ── Tooltip global ──
const tip = document.getElementById('cal-tooltip');

document.addEventListener('mouseover', e => {
  const pill = e.target.closest('.mcal-pill[data-tooltip], .mcal-bar[data-tooltip]');
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
  const pill = e.target.closest('.mcal-pill[data-tooltip], .mcal-bar[data-tooltip]');
  if (pill) tip.style.display = 'none';
});

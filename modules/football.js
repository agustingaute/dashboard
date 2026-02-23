const RIVER_ID = 'igi';
const LIGA_ID  = 'hc';
const PROXY    = 'https://corsproxy.io/?';

async function fetchSSR(url) {
  const res = await fetch(PROXY + encodeURIComponent(url), { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Sin datos');
  return JSON.parse(m[1]).props?.pageProps?.data;
}

function gameDate(startTime) {
  const [d, t] = startTime.split(' ');
  const [dd, mm, yyyy] = d.split('-');
  const date = new Date(`${yyyy}-${mm}-${dd}T${t}:00-03:00`);
  const day = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  return { day, time: t + 'hs' };
}

function renderFixtures(rows) {
  const el = document.getElementById('fixtures-content');
  if (!el) return;

  if (!rows?.length) {
    el.innerHTML = '<p class="cal-empty">Sin partidos próximos</p>';
    return;
  }

  const items = rows.slice(0, 6).map(({ game }) => {
    const isHome = game.teams[0].id === RIVER_ID;
    const rival  = isHome ? game.teams[1].name : game.teams[0].name;
    const tag    = isHome ? '<span class="fixture-tag local">L</span>' : '<span class="fixture-tag visita">V</span>';
    const { day, time } = gameDate(game.start_time);
    return `
      <div class="fixture-row">
        <span class="fixture-match">${tag} River vs ${rival}</span>
        <span class="fixture-when">
          <span class="fixture-date">${day}</span>
          <span class="fixture-time">${time}</span>
        </span>
      </div>
    `;
  }).join('');

  el.innerHTML = `<div class="fixture-list">${items}</div>`;
}

function getValue(row, key) {
  return row.values.find(v => v.key === key)?.value ?? '—';
}

function renderStandings(groups) {
  const el = document.getElementById('standings-content');
  if (!el) return;

  let allRows = [], zoneName = '';
  for (const group of groups) {
    for (const table of group.tables ?? []) {
      const rows = table.table?.rows ?? [];
      if (rows.find(r => r.entity?.object?.id === RIVER_ID) && group.name && !allRows.length) {
        allRows = rows;
        zoneName = [group.name, table.name].filter(Boolean).join(' · ');
      }
    }
  }

  if (!allRows.length) {
    el.innerHTML = '<p class="cal-empty">Tabla no disponible</p>';
    return;
  }

  const rIdx = allRows.findIndex(r => r.entity?.object?.id === RIVER_ID);

  // Bloque: líder (pos 0) + 3 por encima de River + River + 3 por debajo
  const winStart = Math.max(1, rIdx - 3); // índice 1+ para no repetir el líder
  const winEnd   = Math.min(allRows.length - 1, rIdx + 3);

  // Si el bloque ya incluye la posición 0 (líder adyacente a River), no hay gap
  const gapBeforeWindow = winStart > 1;

  // Armar el set de índices únicos: siempre incluir el 0 (líder)
  const selected = [allRows[0], ...allRows.slice(winStart, winEnd + 1)];

  const renderRow = (row, separator = false) => {
    const isRiver = row.entity?.object?.id === RIVER_ID;
    const name = row.entity?.object?.short_name || '?';
    return `
      ${separator ? '<tr class="standings-sep"><td colspan="7"></td></tr>' : ''}
      <tr class="${isRiver ? 'is-river' : ''}">
        <td class="pos">${row.num}</td>
        <td class="team">${name}</td>
        <td class="num">${getValue(row, 'GamePlayed')}</td>
        <td class="num">${getValue(row, 'GamesWon')}</td>
        <td class="num">${getValue(row, 'GamesEven')}</td>
        <td class="num">${getValue(row, 'GamesLost')}</td>
        <td class="num pts">${getValue(row, 'Points')}</td>
      </tr>
    `;
  };

  const rows = selected.map((row, i) => renderRow(row, i === 1 && gapBeforeWindow)).join('');

  // Merge zone name into the card label to save vertical space
  const labelEl = document.querySelector('.cell--standings .cell__label');
  if (labelEl) labelEl.innerHTML = `Liga Profesional <span class="standings-zone-inline">${zoneName.replace(/^Liga Profesional\s*·?\s*/i, '')}</span>`;

  el.innerHTML = `
    <table class="standings-table">
      <thead>
        <tr>
          <th class="num">#</th><th>Equipo</th>
          <th class="num">PJ</th><th class="num">G</th>
          <th class="num">E</th><th class="num">P</th><th class="num">Pts</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export async function refreshFootball() {
  try {
    const [team, league] = await Promise.all([
      fetchSSR(`https://www.promiedos.com.ar/team/river-plate/${RIVER_ID}`),
      fetchSSR(`https://www.promiedos.com.ar/league/liga-profesional/${LIGA_ID}`),
    ]);
    renderFixtures(team?.games?.next?.rows ?? []);
    renderStandings(league?.tables_groups ?? []);
  } catch (err) {
    ['fixtures-content', 'standings-content'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<div class="error-state"><span>Sin datos</span>
        <span class="error-msg">${err.message}</span>
        <button class="retry-btn" onclick="window._retry('football')">Reintentar</button></div>`;
    });
  }
}

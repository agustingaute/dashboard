// ============================================================
// ALMANAQUE — orquestador de la hoja diaria
// Mundo visual nuevo; no toca el dashboard original.
// ============================================================

const RIVER_ID = 'igi';
const LIGA_ID  = 'hc';
const PROMIEDOS = 'https://api.promiedos.com.ar';

const CALENDARIOS = [
  { id: 'agustingaute@gmail.com', nombre: 'Personal', tinta: 'var(--ink)' },
  { id: 'b6720a0cc1fb28d21bc25f874481e4722b2147d93e2762c65822d0e6589e3ed4@group.calendar.google.com', nombre: 'River Content', tinta: 'var(--blue)' },
  { id: 'calendarioriverplate@gmail.com', nombre: 'River Plate', tinta: 'var(--red)' },
];

// ── Utilidades ──────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function estampar(el, extraClass) {
  el.classList.remove('estampa', 'estampa--numero');
  void el.offsetWidth; // reinicia la animación en re-renders
  el.classList.add('estampa');
  if (extraClass) el.classList.add(extraClass);
}

function sinDatos(el, modulo, msg) {
  el.innerHTML = `
    <div class="sin-datos">
      <p class="sin-datos__titulo">Sin datos</p>
      <span class="sin-datos__msg">${msg}</span>
      <button class="reintentar" onclick="window._almRetry('${modulo}')">Reintentar</button>
    </div>`;
}

function ars(v) { return '$ ' + Math.round(v).toLocaleString('es-AR'); }

function usd(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    maximumFractionDigits: v >= 1000 ? 0 : 2,
  }).format(v);
}

function linea(rotulo, valor, extra) {
  return `
    <div class="linea">
      <span class="linea__rotulo">${rotulo}</span>
      <span class="linea__leader"></span>
      <span class="linea__valor">${valor}</span>
      ${extra ? extra : ''}
    </div>`;
}

// ── Fecha, reloj y saludo ───────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

// Refranero del taco: uno por día del mes, como en los almanaques de pared
const REFRANES = [
  'Al que madruga, Dios lo ayuda.',
  'Cielo de panza de burro, agua segura.',
  'Después de la tormenta llega la calma.',
  'A mal tiempo, buena cara.',
  'Más vale pájaro en mano que cien volando.',
  'No por mucho madrugar amanece más temprano.',
  'El que guarda siempre tiene.',
  'Quien siembra vientos cosecha tempestades.',
  'Agua que no has de beber, déjala correr.',
  'A caballo regalado no se le miran los dientes.',
  'Cuando el río suena, agua trae.',
  'Al pan, pan; y al vino, vino.',
  'Más sabe el diablo por viejo que por diablo.',
  'No hay mal que dure cien años.',
  'El que mucho abarca poco aprieta.',
  'Cada maestrito con su librito.',
  'A lo hecho, pecho.',
  'Dime con quién andas y te diré quién eres.',
  'En casa de herrero, cuchillo de palo.',
  'La tercera es la vencida.',
  'Más vale tarde que nunca.',
  'No dejes para mañana lo que puedas hacer hoy.',
  'Ojos que no ven, corazón que no siente.',
  'Perro que ladra no muerde.',
  'Sobre llovido, mojado.',
  'Árbol que nace torcido jamás su tronco endereza.',
  'De tal palo, tal astilla.',
  'El que no llora no mama.',
  'La esperanza es lo último que se pierde.',
  'No hay dos sin tres.',
  'Lo que abunda no daña.',
];

function pintarFecha() {
  const hoy = new Date();
  $('dia-mes').textContent    = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
  $('dia-numero').textContent = hoy.getDate();
  $('dia-semana').textContent = DIAS[hoy.getDay()];
  $('year').textContent       = hoy.getFullYear();
  estampar($('dia-numero'), 'estampa--numero');
  estampar($('dia-semana'));

  const inicioAno = new Date(hoy.getFullYear(), 0, 1);
  const finAno    = new Date(hoy.getFullYear() + 1, 0, 1);
  const diaDelAno = Math.floor((hoy - inicioAno) / 86400000) + 1;
  const diasTotal = Math.round((finAno - inicioAno) / 86400000);
  $('dia-refran').innerHTML = `
    <p class="dia__ordinal">Día ${diaDelAno} del año — quedan ${diasTotal - diaDelAno}</p>
    <p class="dia__proverbio">«${REFRANES[(hoy.getDate() - 1) % REFRANES.length]}»</p>`;
  estampar($('dia-refran'));

  const h = hoy.getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  $('greeting').textContent = `${saludo}, Agustín`;
}

function iniciarReloj() {
  const el = $('clock');
  function tic() {
    el.textContent = new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  }
  tic();
  setInterval(tic, 1000);
}

// ── Iconos de línea (tinta azul, un solo trazo) ─────────────

const TRAZO = 'fill="none" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

const ICONO = {
  sol:      `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><circle cx="10" cy="10" r="3.6"/><path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.55 1.55M14.45 14.45 16 16M16 4l-1.55 1.55M5.55 14.45 4 16"/></svg>`,
  nubeSol:  `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><circle cx="6.4" cy="6.6" r="2.6"/><path d="M6.4 1.6v1.3M1.4 6.6h1.3M2.85 3.05l.92.92M9.95 3.05l-.92.92"/><path d="M6.8 15.8h7.9a3 3 0 0 0 .4-5.97 4.4 4.4 0 0 0-8.55-.9A2.9 2.9 0 0 0 6.8 15.8Z"/></svg>`,
  nube:     `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 15.2h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 15.2Z"/></svg>`,
  lluvia:   `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 12.4h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 12.4Z"/><path d="m6.6 14.6-.9 2.5M10.4 14.6l-.9 2.5M14.2 14.6l-.9 2.5"/></svg>`,
  llovizna: `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 12.4h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 12.4Z"/><path d="M6.4 15.2v.9M10.1 15.2v.9M13.8 15.2v.9"/></svg>`,
  niebla:   `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 10.4h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 10.4Z" opacity="0.55"/><path d="M3.4 13.4h13.2M5.2 16.2h9.6"/></svg>`,
  nieve:    `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 12.4h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 12.4Z"/><path d="M6.5 15.4v1.8M5.6 16.3h1.8M13.5 15.4v1.8M12.6 16.3h1.8M10 14.6v1.8M9.1 15.5h1.8"/></svg>`,
  tormenta: `<svg width="20" height="20" viewBox="0 0 20 20" ${TRAZO}><path d="M5.4 11.4h9.2a3.2 3.2 0 0 0 .43-6.37 4.7 4.7 0 0 0-9.13-.96A3.1 3.1 0 0 0 5.4 11.4Z"/><path d="M10.8 12.4 8.6 15.6h2.6l-1.8 3"/></svg>`,
  salida:   `<svg width="16" height="16" viewBox="0 0 20 20" ${TRAZO}><path d="M4.5 13.5a5.5 5.5 0 0 1 11 0"/><path d="M2 16h16M10 3.2v3M5.2 5.2l1.7 1.7M14.8 5.2l-1.7 1.7"/></svg>`,
  puesta:   `<svg width="16" height="16" viewBox="0 0 20 20" ${TRAZO}><path d="M4.5 13.5a5.5 5.5 0 0 1 11 0"/><path d="M2 16h16M10 6.6V3.4M8.3 4.9l1.7 1.7 1.7-1.7"/></svg>`,
};

const WMO = {
  0: ['Despejado', 'sol'],   1: ['Despejado', 'sol'],       2: ['Parcial nublado', 'nubeSol'],
  3: ['Nublado', 'nube'],   45: ['Niebla', 'niebla'],      48: ['Niebla', 'niebla'],
  51: ['Llovizna', 'llovizna'], 53: ['Llovizna', 'llovizna'], 55: ['Llovizna', 'llovizna'],
  61: ['Lluvia', 'lluvia'], 63: ['Lluvia', 'lluvia'],      65: ['Lluvia fuerte', 'lluvia'],
  71: ['Nieve', 'nieve'],   73: ['Nieve', 'nieve'],        75: ['Nieve', 'nieve'],
  80: ['Chubascos', 'lluvia'], 81: ['Chubascos', 'lluvia'], 82: ['Chubascos', 'lluvia'],
  95: ['Tormenta', 'tormenta'], 96: ['Tormenta', 'tormenta'], 99: ['Tormenta', 'tormenta'],
};

// ── Luna: fase real, orientada para el hemisferio sur ───────

const NOMBRE_FASE = [
  'Luna nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente',
  'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Menguante',
];

function faseLunar(fecha) {
  const SINODICO = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14); // luna nueva de referencia
  const dias = (fecha.getTime() - ref) / 86400000;
  return ((dias % SINODICO) + SINODICO) % SINODICO / SINODICO; // 0 nueva · 0.5 llena
}

function lunaSVG(p) {
  // Vista desde el hemisferio sur: la luz crece desde la izquierda.
  const r = 7, c = 10;
  const lit = (1 - Math.cos(2 * Math.PI * p)) / 2; // fracción iluminada
  const k = r * Math.cos(Math.PI * lit);           // semieje del terminador
  const creciente = p < 0.5;
  // Arco exterior por el lado iluminado + terminador elíptico
  const ladoLuz = creciente ? 0 : 1; // sweep del arco exterior
  const path = `M ${c} ${c - r} A ${r} ${r} 0 0 ${ladoLuz} ${c} ${c + r} A ${Math.abs(k)} ${r} 0 0 ${(k >= 0) === creciente ? 1 : 0} ${c} ${c - r} Z`;
  const relleno = lit < 0.02 ? '' : lit > 0.98
    ? `<circle cx="${c}" cy="${c}" r="${r}" fill="var(--blue)"/>`
    : `<path d="${path}" fill="var(--blue)"/>`;
  return `<svg width="18" height="18" viewBox="0 0 20 20"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--blue)" stroke-width="1.4"/>${relleno}</svg>`;
}

// ── Módulos ─────────────────────────────────────────────────

async function cargarClima() {
  const cuerpo = $('clima-body');
  const astro  = $('dia-astro');
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816' +
      '&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { current, daily } = await res.json();

    const [desc, icono] = WMO[current.weather_code] || ['Nublado', 'nube'];
    const salida = daily.sunrise[0].slice(11, 16);
    const puesta = daily.sunset[0].slice(11, 16);
    const hoy = new Date();
    const fase = faseLunar(hoy);
    const nombreFase = NOMBRE_FASE[Math.round(fase * 8) % 8];

    cuerpo.innerHTML = `
      <div class="clima-actual">
        ${ICONO[icono]}
        <span class="clima-actual__temp">${Math.round(current.temperature_2m)}°</span>
        <span class="clima-actual__desc">${desc}<br>Buenos Aires</span>
      </div>
      ${linea('Máx / mín', `${Math.round(daily.temperature_2m_max[0])}° / ${Math.round(daily.temperature_2m_min[0])}°`)}
      ${linea('Humedad', `${current.relative_humidity_2m}%`)}
      ${linea('Viento', `${Math.round(current.wind_speed_10m)} km/h`)}`;
    estampar(cuerpo);

    astro.innerHTML = `
      <div class="astro-linea">
        <span class="astro-par">${ICONO.salida}<span class="astro-linea__label">Sale el sol</span>
        <span class="astro-linea__valor">${salida}</span></span>
        <span class="astro-par">${ICONO.puesta}<span class="astro-linea__label">Se pone</span>
        <span class="astro-linea__valor">${puesta}</span></span>
      </div>
      <div class="astro-linea">
        ${lunaSVG(fase)}
        <span class="astro-linea__label">${nombreFase}</span>
      </div>`;
    estampar(astro);
  } catch (err) {
    sinDatos(cuerpo, 'clima', err.message);
    astro.innerHTML = '';
  }
}

async function cargarDolar() {
  const cuerpo = $('dolar-body');
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/blue');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { compra, venta, fechaActualizacion } = await res.json();
    const hora = new Date(fechaActualizacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    cuerpo.innerHTML = `
      ${linea('Blue compra', ars(compra))}
      ${linea('Blue venta', ars(venta))}
      <div class="linea"><span class="linea__extra">Pizarra de las ${hora}</span></div>`;
    estampar(cuerpo);
  } catch (err) {
    sinDatos(cuerpo, 'dolar', err.message);
  }
}

async function cargarCripto() {
  const cuerpo = $('cripto-body');
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { bitcoin: btc, ethereum: eth } = await res.json();
    const cambio = (c) => {
      const clase = c >= 0 ? 'linea__extra--sube' : 'linea__extra--baja';
      return `<span class="linea__extra ${clase}">${c >= 0 ? '+' : ''}${c.toFixed(1)}%</span>`;
    };
    cuerpo.innerHTML = `
      ${linea('Bitcoin', usd(btc.usd), cambio(btc.usd_24h_change))}
      ${linea('Ethereum', usd(eth.usd), cambio(eth.usd_24h_change))}`;
    estampar(cuerpo);
  } catch (err) {
    sinDatos(cuerpo, 'cripto', err.message);
  }
}

// ── River: fixture y tabla ──────────────────────────────────

async function promiedos(path) {
  const res = await fetch(PROMIEDOS + path, { headers: { 'X-VER': '1.11.7.5' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DIAS_CORTO  = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fechaPartido(startTime) {
  // start_time ya viene en hora argentina; se muestra tal cual
  const [d, t] = startTime.split(' ');
  const [dd, mm, yyyy] = d.split('-').map(Number);
  const fecha = new Date(yyyy, mm - 1, dd);
  return { dia: `${DIAS_CORTO[fecha.getDay()]} ${dd} ${MESES_CORTO[mm - 1]}`, hora: t };
}

async function cargarRiver() {
  const cuerpo = $('river-body');
  try {
    const data = await promiedos(`/team/${RIVER_ID}`);
    const rows = data?.games?.next?.rows ?? [];
    if (!rows.length) {
      cuerpo.innerHTML = '<p class="agenda__vacia">Sin partidos próximos</p>';
      estampar(cuerpo);
      return;
    }
    const html = rows.slice(0, 5).map(({ game }, i) => {
      const esLocal = game.teams[0].id === RIVER_ID;
      const rival   = esLocal ? game.teams[1].name : game.teams[0].name;
      const { dia, hora } = fechaPartido(game.start_time);
      const destacado = i === 0 ? ' partido--proximo' : '';
      return `
        <div class="partido${destacado}">
          <p class="partido__fecha"><span>${dia}</span><span class="partido__hora">${hora} hs</span></p>
          <p class="partido__rival">vs ${rival}</p>
          <p class="partido__condicion">${esLocal ? 'Local — Monumental' : 'Visitante'}</p>
        </div>`;
    }).join('');
    cuerpo.innerHTML = html;
    estampar(cuerpo);
  } catch (err) {
    sinDatos(cuerpo, 'river', err.message);
  }
}

function valorFila(row, key) {
  return row.values.find(v => v.key === key)?.value ?? '—';
}

async function cargarTabla() {
  const cuerpo = $('tabla-body');
  try {
    const data = await promiedos(`/league/tables_and_fixtures/${LIGA_ID}`);
    const grupos = data?.tables_groups ?? [];

    let filas = [], zona = '';
    for (const grupo of grupos) {
      for (const tabla of grupo.tables ?? []) {
        const rows = tabla.table?.rows ?? [];
        if (!filas.length && rows.find(r => r.entity?.object?.id === RIVER_ID)) {
          filas = rows;
          zona = [grupo.name, tabla.name].filter(Boolean).join(' — ');
        }
      }
    }
    if (!filas.length) throw new Error('Tabla no disponible');

    const idxRiver = filas.findIndex(r => r.entity?.object?.id === RIVER_ID);
    const desde = Math.max(1, idxRiver - 2);
    const hasta = Math.min(filas.length - 1, idxRiver + 2);
    const seleccion = [filas[0], ...filas.slice(desde, hasta + 1)];
    const hayCorte = desde > 1;

    const cuerpoTabla = seleccion.map((fila, i) => {
      const esRiver = fila.entity?.object?.id === RIVER_ID;
      const clases = [esRiver ? 'es-river' : '', i === 1 && hayCorte ? 'corte' : ''].filter(Boolean).join(' ');
      return `
        <tr class="${clases}">
          <td>${fila.num}</td>
          <td class="equipo">${fila.entity?.object?.short_name || '?'}</td>
          <td>${valorFila(fila, 'GamePlayed')}</td>
          <td>${valorFila(fila, 'GamesWon')}</td>
          <td class="pts">${valorFila(fila, 'Points')}</td>
        </tr>`;
    }).join('');

    cuerpo.innerHTML = `
      <p class="tabla__zona">${zona}</p>
      <table class="tabla">
        <thead>
          <tr><th>#</th><th class="izq">Equipo</th><th>PJ</th><th>G</th><th>Pts</th></tr>
        </thead>
        <tbody>${cuerpoTabla}</tbody>
      </table>`;
    estampar(cuerpo);
  } catch (err) {
    sinDatos(cuerpo, 'tabla', err.message);
  }
}

// ── Calendario: agenda de hoy + el mes ──────────────────────

async function eventosDe(calId, apiKey, desde, hasta) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events` +
    `?key=${apiKey}&timeMin=${desde.toISOString()}&timeMax=${hasta.toISOString()}` +
    `&singleEvents=true&maxResults=100&orderBy=startTime`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).items || [];
}

async function cargarCalendario() {
  const agenda = $('agenda-body');
  const mes    = $('mes-body');
  const seccionMes = $('seccion-mes');
  const apiKey = window.CONFIG?.GOOGLE_API_KEY;

  if (!apiKey || apiKey.includes('PLACEHOLDER') || apiKey.startsWith('YOUR_')) {
    // Sin clave no hay reintento posible: se explica la recuperación real
    // y "El mes" se pliega para no duplicar el aviso.
    agenda.innerHTML = `
      <div class="sin-datos">
        <p class="sin-datos__titulo">Calendario sin conectar</p>
        <span class="sin-datos__msg">La clave de Google se inyecta al deployar.
        Para verlo en local, completá GOOGLE_API_KEY en config.js — agenda y mes vuelven solos.</span>
      </div>`;
    seccionMes.style.display = 'none';
    return;
  }
  seccionMes.style.display = '';

  const hoy    = new Date();
  const desde  = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const hasta  = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

  try {
    const resultados = await Promise.allSettled(
      CALENDARIOS.map(cal => eventosDe(cal.id, apiKey, desde, hasta)
        .then(items => items.map(ev => ({ ...ev, _cal: cal }))))
    );
    const eventos = resultados
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);
    if (resultados.every(r => r.status === 'rejected')) {
      throw new Error(resultados[0].reason?.message || 'Sin acceso a los calendarios');
    }

    pintarAgenda(agenda, eventos, hoy);
    pintarMes(mes, eventos, hoy);
  } catch (err) {
    sinDatos(agenda, 'calendario', err.message);
    seccionMes.style.display = 'none';
  }
}

function esMismoDia(fecha, dia) {
  return fecha.getFullYear() === dia.getFullYear()
    && fecha.getMonth() === dia.getMonth()
    && fecha.getDate() === dia.getDate();
}

function pintarAgenda(el, eventos, hoy) {
  const deHoy = eventos.filter(ev => {
    if (ev.start?.date) {
      const [y, m, d] = ev.start.date.split('-').map(Number);
      const inicio = new Date(y, m - 1, d);
      const [y2, m2, d2] = (ev.end?.date || ev.start.date).split('-').map(Number);
      const fin = new Date(y2, m2 - 1, d2); // exclusivo
      return inicio <= hoy && hoy < fin;
    }
    return esMismoDia(new Date(ev.start.dateTime), hoy);
  }).sort((a, b) => {
    const ha = a.start?.dateTime ? new Date(a.start.dateTime).getTime() : 0;
    const hb = b.start?.dateTime ? new Date(b.start.dateTime).getTime() : 0;
    return ha - hb;
  });

  if (!deHoy.length) {
    el.innerHTML = '<p class="agenda__vacia">Día despejado — sin compromisos anotados</p>';
    estampar(el);
    return;
  }

  const filas = deHoy.map(ev => {
    const hora = ev.start?.dateTime
      ? `<span class="evento__hora">${new Date(ev.start.dateTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>`
      : '<span class="evento__hora evento__hora--allday">Todo el día</span>';
    return `
      <div class="evento">
        ${hora}
        <span class="evento__titulo">${(ev.summary || 'Sin título')}</span>
        <span class="evento__cal">${ev._cal.nombre}</span>
      </div>`;
  }).join('');

  el.innerHTML = `<div class="evento-lista">${filas}</div>`;
  estampar(el);
}

function pintarMes(el, eventos, hoy) {
  const year  = hoy.getFullYear();
  const month = hoy.getMonth();
  const diasEnMes    = new Date(year, month + 1, 0).getDate();
  const primerDia    = new Date(year, month, 1).getDay();
  const totalCeldas  = Math.ceil((primerDia + diasEnMes) / 7) * 7;

  // Tintas y títulos por día del mes
  const tintasPorDia  = {};
  const titulosPorDia = {};
  eventos.forEach(ev => {
    let inicio, finExc;
    if (ev.start?.date) {
      const [y, m, d] = ev.start.date.split('-').map(Number);
      inicio = new Date(y, m - 1, d);
      const [y2, m2, d2] = (ev.end?.date || ev.start.date).split('-').map(Number);
      finExc = new Date(y2, m2 - 1, d2);
    } else {
      const f = new Date(ev.start.dateTime);
      inicio = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      finExc = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 1);
    }
    for (let f = new Date(inicio); f < finExc; f.setDate(f.getDate() + 1)) {
      if (f.getFullYear() === year && f.getMonth() === month) {
        const d = f.getDate();
        if (!tintasPorDia[d]) { tintasPorDia[d] = new Set(); titulosPorDia[d] = []; }
        tintasPorDia[d].add(ev._cal.tinta);
        titulosPorDia[d].push(`${ev.summary || 'Sin título'} (${ev._cal.nombre})`);
      }
    }
  });

  const dows = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    .map(d => `<div class="mes-dow">${d}</div>`).join('');

  let celdas = '';
  for (let i = 0; i < totalCeldas; i++) {
    const dom = i - primerDia + 1;
    if (dom < 1 || dom > diasEnMes) {
      celdas += '<div class="mes-celda mes-celda--fuera"></div>';
      continue;
    }
    const esHoy   = dom === hoy.getDate();
    const esPasado = dom < hoy.getDate();
    const clases = ['mes-celda', esHoy ? 'mes-celda--hoy' : '', esPasado ? 'mes-celda--pasado' : '']
      .filter(Boolean).join(' ');
    const puntos = [...(tintasPorDia[dom] || [])]
      .map(t => `<span class="mes-dot" style="background:${t}"></span>`).join('');
    const titulos = (titulosPorDia[dom] || []).join('\n');
    celdas += `
      <div class="${clases}"${titulos ? ` title="${titulos.replace(/"/g, '&quot;')}"` : ''}>
        <span class="mes-celda__num">${dom}</span>
        ${puntos ? `<div class="mes-celda__eventos">${puntos}</div>` : ''}
      </div>`;
  }

  const leyenda = CALENDARIOS.map(c =>
    `<span class="mes-leyenda__item"><span class="mes-dot" style="background:${c.tinta}"></span>${c.nombre}</span>`
  ).join('');

  el.innerHTML = `
    <div class="mes-grid">${dows}${celdas}</div>
    <div class="mes-leyenda">${leyenda}</div>`;
  estampar(el);
}

// ── Arranque ────────────────────────────────────────────────

const MODULOS = {
  clima: cargarClima,
  dolar: cargarDolar,
  cripto: cargarCripto,
  river: cargarRiver,
  tabla: cargarTabla,
  calendario: cargarCalendario,
};

window._almRetry = (nombre) => { MODULOS[nombre]?.(); };

function programar(fn, intervalo) {
  fn();
  setInterval(fn, intervalo);
}

pintarFecha();
iniciarReloj();
setInterval(pintarFecha, 60 * 1000);

programar(cargarDolar,      5 * 60 * 1000);
programar(cargarCripto,     5 * 60 * 1000);
programar(cargarClima,     30 * 60 * 1000);
programar(cargarRiver,     60 * 60 * 1000);
programar(cargarTabla,     60 * 60 * 1000);
programar(cargarCalendario, 30 * 60 * 1000);

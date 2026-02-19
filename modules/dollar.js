const DOLLAR_API = 'https://dolarapi.com/v1/dolares/blue';

function ars(v) {
  return '$\u202f' + Math.round(v).toLocaleString('es-AR');
}

export async function refreshDollar() {
  try {
    const res = await fetch(DOLLAR_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { compra, venta, fechaActualizacion } = await res.json();

    document.getElementById('dollar-content').innerHTML = `
      <div class="crypto-list">
        <div class="crypto-row">
          <div class="crypto-left">
            <span class="crypto-badge dollar-badge">USD</span>
            <span class="crypto-name">Compra</span>
          </div>
          <div class="crypto-right">
            <span class="crypto-price">${ars(compra)}</span>
          </div>
        </div>
        <div class="crypto-row">
          <div class="crypto-left">
            <span class="crypto-badge dollar-badge">USD</span>
            <span class="crypto-name">Venta</span>
          </div>
          <div class="crypto-right">
            <span class="crypto-price">${ars(venta)}</span>
          </div>
        </div>
      </div>
    `;

    const t = new Date(fechaActualizacion);
    document.getElementById('dollar-updated').textContent =
      'Actualizado ' + t.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  } catch (err) {
    document.getElementById('dollar-content').innerHTML =
      `<div class="error-state"><span>Sin datos</span><span class="error-msg">${err.message}</span>
       <button class="retry-btn" onclick="window._retry('dollar')">Reintentar</button></div>`;
  }
}

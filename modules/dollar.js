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
      <div class="data-list">
        <div class="data-row">
          <div class="data-left">
            <span class="badge badge--usd">USD</span>
            <span class="data-label">Compra</span>
          </div>
          <div class="data-right">
            <span class="data-value">${ars(compra)}</span>
          </div>
        </div>
        <div class="data-row">
          <div class="data-left">
            <span class="badge badge--usd">USD</span>
            <span class="data-label">Venta</span>
          </div>
          <div class="data-right">
            <span class="data-value">${ars(venta)}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('dollar-content').innerHTML =
      `<div class="error-state"><span>Sin datos</span><span class="error-msg">${err.message}</span>
       <button class="retry-btn" onclick="window._retry('dollar')">Reintentar</button></div>`;
  }
}

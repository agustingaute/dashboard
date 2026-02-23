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
      <div class="dollar-grid">
        <div class="dollar-row">
          <span class="dollar-label">Compra</span>
          <span class="dollar-value">${ars(compra)}</span>
        </div>
        <div class="dollar-row">
          <span class="dollar-label">Venta</span>
          <span class="dollar-value">${ars(venta)}</span>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('dollar-content').innerHTML =
      `<div class="error-state"><span>Sin datos</span><span class="error-msg">${err.message}</span>
       <button class="retry-btn" onclick="window._retry('dollar')">Reintentar</button></div>`;
  }
}

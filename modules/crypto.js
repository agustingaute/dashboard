const API_URL = 'https://api.coingecko.com/api/v3/simple/price' +
  '?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true';

function usd(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    maximumFractionDigits: v >= 1000 ? 0 : 2,
  }).format(v);
}

export async function refreshCrypto() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { bitcoin: btc, ethereum: eth } = await res.json();

    const row = (tickerClass, ticker, price, change) => {
      const changeClass = change >= 0 ? 'pos' : 'neg';
      const sign = change >= 0 ? '+' : '';
      return `
        <div class="crypto-row">
          <div class="crypto-left">
            <span class="crypto-ticker ${tickerClass}">${ticker}</span>
          </div>
          <div class="crypto-right">
            <span class="crypto-value">${usd(price)}</span>
            <span class="crypto-change ${changeClass}">${sign}${change.toFixed(2)}%</span>
          </div>
        </div>
      `;
    };

    document.getElementById('crypto-content').innerHTML = `
      <div class="crypto-grid">
        ${row('crypto-ticker--btc', 'BTC', btc.usd, btc.usd_24h_change)}
        ${row('crypto-ticker--eth', 'ETH', eth.usd, eth.usd_24h_change)}
      </div>
    `;
  } catch (err) {
    document.getElementById('crypto-content').innerHTML =
      `<div class="error-state"><span>Sin datos</span><span class="error-msg">${err.message}</span>
       <button class="retry-btn" onclick="window._retry('crypto')">Reintentar</button></div>`;
  }
}

// =========================================================================
// LIFESTACK OS — WATCHLIST UPDATER
// Phase 4: Research & Decisioning
// Updates watchlist with current prices, catalysts, and news signals
// =========================================================================

const DEFAULT_WATCHLIST = [
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', alertBelow: null, alertAbove: null },
  { ticker: 'ASML', name: 'ASML Holding', sector: 'Semiconductors', alertBelow: null, alertAbove: null },
  { ticker: 'PLTR', name: 'Palantir', sector: 'Software', alertBelow: null, alertAbove: null },
  { ticker: 'BTC', name: 'Bitcoin', sector: 'Crypto', alertBelow: null, alertAbove: null },
  { ticker: 'ETH', name: 'Ethereum', sector: 'Crypto', alertBelow: null, alertAbove: null },
  { ticker: 'SOL', name: 'Solana', sector: 'Crypto', alertBelow: null, alertAbove: null },
  { ticker: 'VWRL', name: 'Vanguard FTSE All-World', sector: 'ETF', alertBelow: null, alertAbove: null },
  { ticker: 'SMT', name: 'Scottish Mortgage Trust', sector: 'Investment Trust', alertBelow: null, alertAbove: null },
  { ticker: 'PHI', name: 'PhiToken', sector: 'DeFi', alertBelow: null, alertAbove: null },
];

/**
 * Update watchlist with current market data and signal detection
 */
export function computeWatchlistState(watchlist, marketData) {
  if (!marketData) return null;

  const list = watchlist && watchlist.length > 0 ? watchlist : DEFAULT_WATCHLIST;

  const items = list.map(item => {
    const data = findMarketData(item.ticker, marketData);
    const signal = computeSignal(item, data);
    const alertTriggered = checkAlerts(item, data);

    return {
      ticker: item.ticker,
      name: item.name || item.ticker,
      sector: item.sector || 'Unknown',
      price: data.price,
      change: data.change,
      changePct: data.changePct,
      volume: data.volume,
      catalyst: data.catalyst || null,
      signal,
      alertTriggered,
    };
  });

  const alertCount = items.filter(i => i.alertTriggered).length;
  const topMover = findTopMover(items);

  return {
    items,
    alertCount,
    topMover,
    lastUpdated: new Date().toISOString(),
    totalItems: items.length,
  };
}

/**
 * Find market data for a specific ticker
 */
function findMarketData(ticker, marketData) {
  // Support various market data shapes
  if (marketData.prices && marketData.prices[ticker]) {
    const p = marketData.prices[ticker];
    return {
      price: p.price || p.last || 0,
      change: p.change || 0,
      changePct: p.changePct || p.pctChange || 0,
      volume: p.volume || 0,
      catalyst: p.catalyst || null,
    };
  }

  if (Array.isArray(marketData)) {
    const match = marketData.find(d => d.ticker === ticker || d.symbol === ticker);
    if (match) {
      return {
        price: match.price || match.last || 0,
        change: match.change || 0,
        changePct: match.changePct || match.pctChange || 0,
        volume: match.volume || 0,
        catalyst: match.catalyst || null,
      };
    }
  }

  return { price: 0, change: 0, changePct: 0, volume: 0, catalyst: null };
}

/**
 * Compute a signal for the watchlist item based on price action
 */
function computeSignal(item, data) {
  if (!data.price) return 'No data';

  const pctChange = Math.abs(data.changePct || 0);

  if (pctChange > 5) {
    return data.changePct > 0 ? 'Strong rally' : 'Sharp selloff';
  }
  if (pctChange > 2) {
    return data.changePct > 0 ? 'Gaining' : 'Weakening';
  }
  if (pctChange > 0.5) {
    return data.changePct > 0 ? 'Mildly positive' : 'Mildly negative';
  }
  return 'Flat';
}

/**
 * Check if any price alerts have been triggered
 */
function checkAlerts(item, data) {
  if (!data.price) return false;
  if (item.alertBelow && data.price <= item.alertBelow) return true;
  if (item.alertAbove && data.price >= item.alertAbove) return true;
  return false;
}

/**
 * Find the top mover in the watchlist
 */
function findTopMover(items) {
  if (!items.length) return null;

  const sorted = [...items]
    .filter(i => i.price > 0)
    .sort((a, b) => Math.abs(b.changePct || 0) - Math.abs(a.changePct || 0));

  if (!sorted.length) return null;

  const top = sorted[0];
  return {
    ticker: top.ticker,
    changePct: top.changePct,
    direction: (top.changePct || 0) >= 0 ? 'up' : 'down',
  };
}

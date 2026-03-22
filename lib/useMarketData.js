'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// =========================================================================
// LIFESTACK OS — LIVE MARKET DATA HOOK
// Fetches from /api/market, maps to the M shape used by MarketsModule,
// and tracks freshness per-metric so FreshnessChip is honest.
// =========================================================================

// Static fallback — the original hardcoded data from 7 March 2026
const STATIC_M = {
  date: '7 March 2026', regime: 'LATE CYCLE — INFLATION SCARE', regimeConf: 68,
  sp500: 6831, sp500ATH: 7008, sp500PE: 29, sp500CAPE: 40, sp50012m: 18, sp500YTD: -0.01,
  ftse100: 10414, ftse10012m: 19, ftse100ATH: 10935, ftse250: 23727, ftse25012m: 12,
  msciWorld12m: 19.7, msciEurope12m: 36.25, msciJapan12m: 25.05, msciEM12m: 33.57, nikkei: 55621,
  vix: 24.5, move: 118, stlfsi: 0.8, nfci: 0.2,
  btcPrice: 68200, btcATH: 126198, btcDD: -45.9, ethPrice: 1975, ethATH: 4953, ethDD: -60,
  solPrice: 86, solATH: 293, solDD: -71,
  fearGreed: 18, mvrvZ: 0.49, nupl: 0.10, btcDom: 58.2, rsi: 27.5,
  etfFlow: '+$500M (5 Mar)', reserves: '2.48M ATL', whale: '270K BTC 30d',
  sopr: 0.95, reserveRisk: 0.001, hodlWave: '68% held >1yr',
  boeRate: 3.75, ukCPI: 3.0, ukCore: 3.1, ukServices: 4.4, ukGDP: 0.1, ukUnemp: 5.2,
  gilt10y: 4.62, gilt2y: 3.80,
  gbpusd: 1.337, gbpzar: 21.87, dxy: 95.5,
  brent: 93.04, wti: 91, gold: 5280, copper: 9200, uranium: 78.5,
  euETS: 68, ukETS: 42,
  igOAS: 95, hyOAS: 340, bbbOAS: 145,
  fed: 4.50, ecb: 2.75, boj: 0.5,
  bestSave: 4.30, isaDeadlineDays: 29,
  smh12m: 70, igv12m: -30, mag7YTD: -6,
};

// Map API response keys → M object fields
function mapApiToM(results) {
  const v = (key) => results[key]?.value ?? null;
  const mapped = {};
  let liveCount = 0;
  let totalMapped = 0;

  const set = (field, apiKey, transform) => {
    const raw = v(apiKey);
    if (raw != null) {
      mapped[field] = transform ? transform(raw) : raw;
      liveCount++;
    }
    totalMapped++;
  };

  // Equities
  set('sp500', 'sp500', x => Math.round(x));
  set('sp500', 'sp500_yahoo', x => Math.round(x)); // Yahoo fallback for S&P
  set('ftse100', 'ftse100', x => Math.round(x));
  set('ftse250', 'ftse250', x => Math.round(x));
  set('nikkei', 'nikkei', x => Math.round(x));

  // Volatility & Stress
  set('vix', 'vix', x => +x.toFixed(1));
  set('move', 'move_index', x => Math.round(x));
  set('stlfsi', 'stlfsi', x => +x.toFixed(1));
  set('nfci', 'nfci', x => +x.toFixed(1));

  // Crypto
  set('btcPrice', 'btc_price', x => Math.round(x));
  set('ethPrice', 'eth_price', x => Math.round(x));
  set('solPrice', 'sol_price', x => +x.toFixed(2));
  set('fearGreed', 'fear_greed', x => Math.round(x));
  set('btcDom', 'btc_dominance', x => +x.toFixed(1));

  // FX
  set('gbpusd', 'gbpusd', x => +x.toFixed(4));
  set('gbpzar', 'gbpzar', x => +x.toFixed(2));
  set('dxy', 'dxy', x => +x.toFixed(1));

  // Commodities
  set('gold', 'gold_price', x => Math.round(x));
  set('brent', 'oil_brent', x => +x.toFixed(2));
  set('wti', 'oil_wti', x => +x.toFixed(2));
  set('copper', 'copper_price', x => Math.round(x));

  // Credit
  set('igOAS', 'ig_oas', x => Math.round(x));
  set('hyOAS', 'hy_oas', x => Math.round(x));
  set('bbbOAS', 'bbb_oas', x => Math.round(x));

  // Rates
  set('fed', 'fed_funds', x => +x.toFixed(2));
  set('gilt10y', 'gilt_10y', x => +x.toFixed(2));

  return { mapped, liveCount, totalMapped };
}

// Compute the oldest fetch time across all results
function computeFreshness(results) {
  const timestamps = Object.values(results)
    .map(r => r?.fetchedAt)
    .filter(Boolean)
    .map(t => new Date(t).getTime());

  if (timestamps.length === 0) return { level: 'fallback', label: 'No live data', ageMinutes: null };

  const oldest = Math.min(...timestamps);
  const ageMs = Date.now() - oldest;
  const ageMinutes = Math.round(ageMs / 60000);

  let label, level;
  if (ageMinutes < 60) {
    label = `Live (${ageMinutes}m ago)`;
    level = 'live';
  } else if (ageMinutes < 24 * 60) {
    label = `Live (${Math.round(ageMinutes / 60)}h ago)`;
    level = 'live';
  } else if (ageMinutes < 7 * 24 * 60) {
    label = `Stale (${Math.round(ageMinutes / (24 * 60))}d ago)`;
    level = 'stale';
  } else {
    label = `Stale (${Math.round(ageMinutes / (7 * 24 * 60))}w ago)`;
    level = 'stale';
  }

  return { level, label, ageMinutes };
}

export function useMarketData({ refreshInterval = 5 * 60 * 1000 } = {}) {
  const [M, setM] = useState(STATIC_M);
  const [freshness, setFreshness] = useState({ level: 'static', label: `Static (${STATIC_M.date})` });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();

      if (!mountedRef.current) return;

      const { mapped, liveCount: count } = mapApiToM(json.results || {});

      // Merge: live values override static fallback
      const merged = { ...STATIC_M, ...mapped };

      // Update date to today if we got any live data
      if (count > 0) {
        merged.date = new Date().toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      }

      setM(merged);
      setLiveCount(count);
      setFreshness(count > 0
        ? computeFreshness(json.results)
        : { level: 'fallback', label: 'API returned no data' }
      );
      setError(json.errors?.length > 0 ? json.errors : null);
    } catch (err) {
      if (!mountedRef.current) return;
      // Keep static fallback on error
      setFreshness({ level: 'fallback', label: `Fallback — ${err.message}` });
      setError([err.message]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData, refreshInterval]);

  return { M, freshness, loading, error, liveCount, refetch: fetchData, STATIC_M };
}

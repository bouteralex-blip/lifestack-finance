// =========================================================================
// LIFESTACK OS — Market Data API Route
// Fetches live data from free APIs: FRED, CoinGecko, Yahoo Finance proxies
// Caches in Supabase market_data_cache table with configurable TTL
// =========================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludmZ6c3Nha2dnbW1sZGprbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODU5NTcsImV4cCI6MjA4ODc2MTk1N30.9JenIs9D8B8hmOGQLrLUN5lBZnDr0e9f1qKIIOXZFp4';
const supabase = createClient(supabaseUrl, supabaseKey);

const FRED_KEY = process.env.FRED_API_KEY || '';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const YAHOO_PROXY = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Metric definitions: source → fetch function
const METRICS = {
  // CoinGecko (free, no key)
  'btc_price': { source: 'coingecko', ttl: 1, fetch: () => fetchJSON(`${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`).then(d => ({ value: d?.bitcoin?.usd, change24h: d?.bitcoin?.usd_24h_change })) },
  'eth_price': { source: 'coingecko', ttl: 1, fetch: () => fetchJSON(`${COINGECKO_BASE}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`).then(d => ({ value: d?.ethereum?.usd, change24h: d?.ethereum?.usd_24h_change })) },
  'fear_greed': { source: 'coingecko', ttl: 6, fetch: () => fetchJSON('https://api.alternative.me/fng/?limit=1').then(d => ({ value: Number(d?.data?.[0]?.value), label: d?.data?.[0]?.value_classification })) },
  'btc_dominance': { source: 'coingecko', ttl: 6, fetch: () => fetchJSON(`${COINGECKO_BASE}/global`).then(d => ({ value: d?.data?.market_cap_percentage?.btc })) },

  // FRED (free with API key)
  'vix': { source: 'fred', ttl: 6, fetch: () => fetchFRED('VIXCLS') },
  'dxy': { source: 'fred', ttl: 6, fetch: () => fetchFRED('DTWEXBGS') },
  'us_10y': { source: 'fred', ttl: 6, fetch: () => fetchFRED('DGS10') },
  'us_2y': { source: 'fred', ttl: 6, fetch: () => fetchFRED('DGS2') },
  'us_cpi': { source: 'fred', ttl: 24, fetch: () => fetchFRED('CPIAUCSL') },
  'gdp_growth': { source: 'fred', ttl: 24, fetch: () => fetchFRED('A191RL1Q225SBEA') },
  'ig_oas': { source: 'fred', ttl: 6, fetch: () => fetchFRED('BAMLC0A0CM') },
  'hy_oas': { source: 'fred', ttl: 6, fetch: () => fetchFRED('BAMLH0A0HYM2') },
  'move_index': { source: 'fred', ttl: 6, fetch: () => fetchFRED('MOVE') },
  'breakeven_5y': { source: 'fred', ttl: 12, fetch: () => fetchFRED('T5YIE') },
  'fed_funds': { source: 'fred', ttl: 24, fetch: () => fetchFRED('DFF') },
  'sp500': { source: 'fred', ttl: 6, fetch: () => fetchFRED('SP500') },
  'm2_supply': { source: 'fred', ttl: 24, fetch: () => fetchFRED('M2SL') },

  // Commodity prices (Yahoo Finance proxy, 6h TTL)
  'gold_price': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('GC=F') },
  'oil_price': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('CL=F') },
  'copper_price': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('HG=F') },

  // FX rates (Yahoo Finance proxy, 6h TTL)
  'gbpusd': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('GBPUSD=X') },
  'eurusd': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('EURUSD=X') },
  'usdjpy': { source: 'yahoo', ttl: 6, fetch: () => fetchYahoo('JPY=X') },
};

async function fetchJSON(url) {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchFRED(series) {
  if (!FRED_KEY) return { value: null, error: 'No FRED API key' };
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
  const data = await fetchJSON(url);
  const obs = data?.observations?.[0];
  return { value: obs?.value === '.' ? null : Number(obs?.value), date: obs?.date };
}

async function fetchYahoo(symbol) {
  const url = `${YAHOO_PROXY}/${symbol}?interval=1d&range=2d`;
  const data = await fetchJSON(url);
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const closes = result?.indicators?.quote?.[0]?.close;
  const lastClose = closes?.filter(Boolean)?.pop() ?? null;
  const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;
  const change24h = prevClose && lastClose ? ((lastClose - prevClose) / prevClose) * 100 : null;
  return { value: lastClose ? +lastClose.toFixed(4) : null, change24h: change24h ? +change24h.toFixed(2) : null };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const metrics = searchParams.get('metrics')?.split(',') || Object.keys(METRICS);
  const forceRefresh = searchParams.get('refresh') === 'true';

  const results = {};
  const errors = [];

  for (const key of metrics) {
    const def = METRICS[key];
    if (!def) { errors.push(`Unknown metric: ${key}`); continue; }

    // Check cache first
    if (!forceRefresh) {
      try {
        const { data } = await supabase
          .from('market_data_cache')
          .select('value, raw_data, fetched_at')
          .eq('source', def.source)
          .eq('metric_key', key)
          .gte('expires_at', new Date().toISOString())
          .single();

        if (data) {
          results[key] = { value: data.value, rawData: data.raw_data, fetchedAt: data.fetched_at, cached: true };
          continue;
        }
      } catch {}
    }

    // Fetch fresh
    try {
      const fresh = await def.fetch();
      const numValue = typeof fresh?.value === 'number' ? fresh.value : null;

      // Cache in Supabase
      try {
        await supabase.from('market_data_cache').upsert({
          source: def.source,
          metric_key: key,
          value: numValue,
          raw_data: fresh,
          fetched_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + def.ttl * 3600000).toISOString(),
        });
      } catch {}

      results[key] = { value: numValue, rawData: fresh, fetchedAt: new Date().toISOString(), cached: false };
    } catch (e) {
      errors.push(`${key}: ${e.message}`);
    }
  }

  return Response.json({ results, errors, timestamp: new Date().toISOString() });
}

// =========================================================================
// LIFESTACK OS — FRESHNESS AUDIT ENGINE
// Phase 4: Research & Decisioning
// Audits all data sources for staleness, fallback status, and live health
// =========================================================================

const STALENESS_THRESHOLDS = {
  prices: 60 * 60 * 1000, // 1 hour
  holdings: 24 * 60 * 60 * 1000, // 24 hours
  market: 6 * 60 * 60 * 1000, // 6 hours
  engine: 24 * 60 * 60 * 1000, // 24 hours
  config: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Audit all data sources for freshness and health
 * Returns structured report of live, stale, and fallback data sources
 */
export function computeFreshnessAudit(freshness, timestamps) {
  if (!freshness && !timestamps) return null;

  const now = new Date();
  const sources = [];

  // Merge freshness and timestamps data
  const data = normalizeFreshnessData(freshness, timestamps);

  data.forEach(source => {
    const age = computeAge(source.lastUpdated, now);
    const threshold = STALENESS_THRESHOLDS[source.category] || STALENESS_THRESHOLDS.engine;
    const isStale = age.ms > threshold;
    const isFallback = source.isFallback || false;
    const isLive = !isStale && !isFallback;

    sources.push({
      table: source.table || source.name,
      category: source.category || 'unknown',
      age: age.label,
      ageMs: age.ms,
      isLive,
      isStale,
      isFallback,
      lastUpdated: source.lastUpdated || null,
      note: isLive ? 'Live data' : isFallback ? 'Using fallback data' : `Stale — last updated ${age.label} ago`,
    });
  });

  const liveCount = sources.filter(s => s.isLive).length;
  const staleCount = sources.filter(s => s.isStale).length;
  const fallbackCount = sources.filter(s => s.isFallback).length;

  let overallHealth = 'healthy';
  if (staleCount > sources.length * 0.5 || fallbackCount > sources.length * 0.3) {
    overallHealth = 'stale';
  } else if (staleCount > 0 || fallbackCount > 0) {
    overallHealth = 'degraded';
  }

  const implication = overallHealth === 'healthy'
    ? 'All data sources live and current. Engine outputs reliable.'
    : overallHealth === 'degraded'
      ? `${staleCount} stale + ${fallbackCount} fallback source(s). Some engine outputs may be approximate.`
      : `${staleCount} stale source(s). Engine outputs may be unreliable. Refresh data before making decisions.`;

  return {
    sources,
    liveCount,
    staleCount,
    fallbackCount,
    totalSources: sources.length,
    overallHealth,
    implication,
    timestamp: now.toISOString(),
  };
}

/**
 * Normalize freshness data from various input formats
 */
function normalizeFreshnessData(freshness, timestamps) {
  const data = [];

  if (freshness && typeof freshness === 'object') {
    if (Array.isArray(freshness)) {
      freshness.forEach(f => {
        data.push({
          table: f.table || f.name || f.source || 'Unknown',
          category: f.category || categorize(f.table || f.name || ''),
          lastUpdated: f.lastUpdated || f.timestamp || f.updatedAt || null,
          isFallback: f.isFallback || f.fallback || false,
        });
      });
    } else {
      Object.keys(freshness).forEach(key => {
        const val = freshness[key];
        if (typeof val === 'string' || val instanceof Date) {
          data.push({
            table: key,
            category: categorize(key),
            lastUpdated: val,
            isFallback: false,
          });
        } else if (typeof val === 'object' && val !== null) {
          data.push({
            table: key,
            category: categorize(key),
            lastUpdated: val.lastUpdated || val.timestamp || val.updatedAt || null,
            isFallback: val.isFallback || val.fallback || false,
          });
        }
      });
    }
  }

  if (timestamps && typeof timestamps === 'object') {
    Object.keys(timestamps).forEach(key => {
      // Avoid duplicates
      if (data.some(d => d.table === key)) return;
      data.push({
        table: key,
        category: categorize(key),
        lastUpdated: timestamps[key],
        isFallback: false,
      });
    });
  }

  return data;
}

/**
 * Categorize a data source by name
 */
function categorize(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('price') || lower.includes('quote') || lower.includes('market_data')) return 'prices';
  if (lower.includes('holding') || lower.includes('portfolio') || lower.includes('position')) return 'holdings';
  if (lower.includes('regime') || lower.includes('stress') || lower.includes('btc') || lower.includes('credit') || lower.includes('yield')) return 'market';
  if (lower.includes('config') || lower.includes('setting') || lower.includes('target')) return 'config';
  return 'engine';
}

/**
 * Compute age from timestamp
 */
function computeAge(lastUpdated, now) {
  if (!lastUpdated) return { ms: Infinity, label: 'Never updated' };

  const updated = new Date(lastUpdated);
  if (isNaN(updated.getTime())) return { ms: Infinity, label: 'Invalid timestamp' };

  const ms = now - updated;
  if (ms < 0) return { ms: 0, label: 'Just now' };

  if (ms < 60 * 1000) return { ms, label: `${Math.floor(ms / 1000)}s` };
  if (ms < 60 * 60 * 1000) return { ms, label: `${Math.floor(ms / (60 * 1000))}m` };
  if (ms < 24 * 60 * 60 * 1000) return { ms, label: `${Math.floor(ms / (60 * 60 * 1000))}h` };
  return { ms, label: `${Math.floor(ms / (24 * 60 * 60 * 1000))}d` };
}

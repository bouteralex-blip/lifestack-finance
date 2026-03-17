// =========================================================================
// LIFESTACK OS — PERSISTENCE LAYER
// Handles Supabase read/write for snapshots, decision log, action queue
// Falls back to localStorage when Supabase is unavailable
// =========================================================================

import { supabase } from './supabase';

// =========================================================================
// ENGINE SNAPSHOTS — for computeWhatChanged()
// =========================================================================

export async function saveEngineSnapshot(engineState, marketState, portfolioSummary, type = 'weekly') {
  const today = new Date().toISOString().split('T')[0];

  try {
    const { error } = await supabase.from('engine_snapshots').upsert({
      snapshot_date: today,
      snapshot_type: type,
      engine_state: engineState,
      market_state: marketState,
      portfolio_summary: portfolioSummary,
    }, { onConflict: 'snapshot_date,snapshot_type' });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    // Fallback: save to localStorage
    try {
      const key = `lifestack_snapshot_${type}_${today}`;
      localStorage.setItem(key, JSON.stringify({ engineState, marketState, portfolioSummary, date: today }));
      localStorage.setItem('lifestack_latest_snapshot', key);
    } catch {}
    return { success: false, error: e.message };
  }
}

export async function loadPriorSnapshot(type = 'weekly') {
  try {
    const { data, error } = await supabase
      .from('engine_snapshots')
      .select('engine_state, market_state, portfolio_summary, snapshot_date')
      .eq('snapshot_type', type)
      .order('snapshot_date', { ascending: false })
      .limit(2);

    if (error) throw error;

    // Return the second most recent (prior), or null if only one exists
    if (data?.length >= 2) return data[1];
    return null;
  } catch {
    // Fallback: localStorage
    try {
      const latestKey = localStorage.getItem('lifestack_latest_snapshot');
      if (latestKey) {
        const snapshot = JSON.parse(localStorage.getItem(latestKey) || 'null');
        return snapshot ? { engine_state: snapshot.engineState, market_state: snapshot.marketState } : null;
      }
    } catch {}
    return null;
  }
}

// =========================================================================
// DECISION LOG — trade thesis persistence
// =========================================================================

export async function saveDecisionEntry(entry) {
  try {
    const { error } = await supabase.from('decision_log').upsert({
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      category: entry.category,
      thesis: entry.thesis,
      snapshot: entry.snapshot,
      status: entry.status,
      outcome: entry.outcome,
      review_date: entry.reviewDate,
      notes: entry.notes,
    });
    if (error) throw error;
    syncDecisionLogToLocal(await loadDecisionLog());
    return { success: true };
  } catch {
    // Fallback: localStorage
    const entries = loadDecisionLogFromLocal();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) entries[idx] = entry; else entries.push(entry);
    syncDecisionLogToLocal(entries);
    return { success: false };
  }
}

export async function loadDecisionLog() {
  try {
    const { data, error } = await supabase
      .from('decision_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Map DB columns to engine format
    return (data || []).map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      action: d.action,
      category: d.category,
      thesis: d.thesis,
      snapshot: d.snapshot,
      status: d.status,
      outcome: d.outcome,
      reviewDate: d.review_date,
      notes: d.notes,
    }));
  } catch {
    return loadDecisionLogFromLocal();
  }
}

function loadDecisionLogFromLocal() {
  try {
    return JSON.parse(localStorage.getItem('lifestack_decision_log') || '[]');
  } catch { return []; }
}

function syncDecisionLogToLocal(entries) {
  try {
    localStorage.setItem('lifestack_decision_log', JSON.stringify(entries));
  } catch {}
}

// =========================================================================
// ACTION QUEUE STATE — done/dismissed/snoozed persistence
// =========================================================================

export async function saveActionStatus(actionId, status, notes) {
  const now = new Date().toISOString();

  try {
    const { error } = await supabase.from('action_queue_state').upsert({
      action_id: actionId,
      status,
      completed_at: status === 'done' ? now : null,
      notes: notes || null,
    });
    if (error) throw error;
  } catch {
    // Fallback: localStorage
    const state = loadActionQueueStateFromLocal();
    state[actionId] = { status, completedAt: status === 'done' ? now : null, notes };
    try { localStorage.setItem('lifestack_action_state', JSON.stringify(state)); } catch {}
  }
}

export async function loadActionQueueState() {
  try {
    const { data, error } = await supabase
      .from('action_queue_state')
      .select('action_id, status, completed_at, snoozed_until, notes');

    if (error) throw error;

    const state = {};
    (data || []).forEach(d => {
      state[d.action_id] = {
        status: d.status,
        completedAt: d.completed_at,
        snoozedUntil: d.snoozed_until,
        notes: d.notes,
      };
    });
    return state;
  } catch {
    return loadActionQueueStateFromLocal();
  }
}

function loadActionQueueStateFromLocal() {
  try {
    return JSON.parse(localStorage.getItem('lifestack_action_state') || '{}');
  } catch { return {}; }
}

// =========================================================================
// MARKET DATA CACHE — API-fetched market data
// =========================================================================

export async function cacheMarketData(source, metricKey, value, rawData, ttlHours = 6) {
  const expiresAt = new Date(Date.now() + ttlHours * 3600000).toISOString();

  try {
    const { error } = await supabase.from('market_data_cache').upsert({
      source,
      metric_key: metricKey,
      value,
      raw_data: rawData,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
    if (error) throw error;
  } catch {}
}

export async function loadCachedMarketData(source, metricKey) {
  try {
    const { data, error } = await supabase
      .from('market_data_cache')
      .select('value, raw_data, fetched_at, expires_at')
      .eq('source', source)
      .eq('metric_key', metricKey)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Check freshness
    if (new Date(data.expires_at) < new Date()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function loadAllCachedMarketData() {
  try {
    const { data, error } = await supabase
      .from('market_data_cache')
      .select('source, metric_key, value, raw_data, fetched_at')
      .gte('expires_at', new Date().toISOString());

    if (error) throw error;

    const cache = {};
    (data || []).forEach(d => {
      cache[`${d.source}:${d.metric_key}`] = { value: d.value, rawData: d.raw_data, fetchedAt: d.fetched_at };
    });
    return cache;
  } catch {
    return {};
  }
}

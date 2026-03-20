/**
 * LifeStack Finance - Freshness & State Management
 * Phase 1: Truth Layer - Freshness tracking and state synchronization
 */

import { FRESHNESS_LEVELS, SOURCE_TYPES } from './stateSchema';

/**
 * Freshness Manager
 * Tracks data age, determines staleness, triggers refreshes
 */
class FreshnessManager {
  constructor() {
    this.trackedData = new Map();
    this.updateCallbacks = new Map();
  }

  // Track a data source
  trackSource(key, sourceType, timestamp = Date.now()) {
    this.trackedData.set(key, {
      sourceType,
      timestamp,
      age: 0,
      level: FRESHNESS_LEVELS.LIVE,
      isStale: false,
    });
  }

  // Get freshness status
  getFreshness(key) {
    if (!this.trackedData.has(key)) {
      return FRESHNESS_LEVELS.FALLBACK;
    }

    const data = this.trackedData.get(key);
    const ageMs = Date.now() - data.timestamp;
    data.age = ageMs;

    // Determine freshness level
    if (data.sourceType === SOURCE_TYPES.FALLBACK) {
      data.level = FRESHNESS_LEVELS.FALLBACK;
      data.isStale = true;
    } else if (ageMs < FRESHNESS_LEVELS.LIVE.timeout) {
      data.level = FRESHNESS_LEVELS.LIVE;
      data.isStale = false;
    } else if (ageMs < FRESHNESS_LEVELS.CACHED_FRESH.timeout) {
      data.level = FRESHNESS_LEVELS.CACHED_FRESH;
      data.isStale = false;
    } else if (ageMs < FRESHNESS_LEVELS.CACHED_STALE.timeout) {
      data.level = FRESHNESS_LEVELS.CACHED_STALE;
      data.isStale = true;
    } else {
      data.level = FRESHNESS_LEVELS.FALLBACK;
      data.isStale = true;
    }

    return data;
  }

  // Update source
  updateSource(key, sourceType = SOURCE_TYPES.LIVE_API, timestamp = Date.now()) {
    this.trackedData.set(key, {
      sourceType,
      timestamp,
      age: 0,
      level: FRESHNESS_LEVELS.LIVE,
      isStale: false,
    });

    // Trigger callbacks
    if (this.updateCallbacks.has(key)) {
      this.updateCallbacks.get(key).forEach((cb) => cb());
    }
  }

  // Register update callback
  onUpdate(key, callback) {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }
    this.updateCallbacks.get(key).push(callback);
  }

  // Get all stale sources
  getStaleData() {
    const stale = [];
    for (const [key, data] of this.trackedData.entries()) {
      if (this.getFreshness(key).isStale) {
        stale.push(key);
      }
    }
    return stale;
  }

  // Get data quality report
  getQualityReport() {
    const report = {
      total: this.trackedData.size,
      live: 0,
      cached_fresh: 0,
      cached_stale: 0,
      fallback: 0,
      stalePct: 0,
    };

    for (const [, data] of this.trackedData.entries()) {
      const freshness = this.getFreshness(this.trackedData.keys()[0]);
      switch (freshness.level) {
        case FRESHNESS_LEVELS.LIVE:
          report.live++;
          break;
        case FRESHNESS_LEVELS.CACHED_FRESH:
          report.cached_fresh++;
          break;
        case FRESHNESS_LEVELS.CACHED_STALE:
          report.cached_stale++;
          break;
        case FRESHNESS_LEVELS.FALLBACK:
          report.fallback++;
          break;
      }
    }

    report.stalePct = ((report.cached_stale + report.fallback) / report.total) * 100;
    return report;
  }
}

/**
 * State Container
 * Holds canonical state objects with freshness tracking
 */
class StateContainer {
  constructor() {
    this.state = {};
    this.freshness = new FreshnessManager();
    this.subscribers = new Map();
  }

  // Set state
  setState(namespace, data, sourceType = SOURCE_TYPES.COMPUTED) {
    this.state[namespace] = data;
    this.freshness.updateSource(namespace, sourceType);
    this.notifySubscribers(namespace);
  }

  // Get state with freshness metadata
  getState(namespace) {
    return {
      data: this.state[namespace] || null,
      freshness: this.freshness.getFreshness(namespace),
    };
  }

  // Subscribe to changes
  subscribe(namespace, callback) {
    if (!this.subscribers.has(namespace)) {
      this.subscribers.set(namespace, []);
    }
    this.subscribers.get(namespace).push(callback);
    return () => {
      const callbacks = this.subscribers.get(namespace);
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }

  // Notify subscribers
  notifySubscribers(namespace) {
    if (this.subscribers.has(namespace)) {
      this.subscribers.get(namespace).forEach((cb) => cb(this.getState(namespace)));
    }
  }

  // Get all state with freshness
  getAllState() {
    const result = {};
    for (const key in this.state) {
      result[key] = this.getState(key);
    }
    return result;
  }

  // Merge state
  mergeState(namespace, partial, sourceType = SOURCE_TYPES.COMPUTED) {
    this.state[namespace] = {
      ...this.state[namespace],
      ...partial,
    };
    this.freshness.updateSource(namespace, sourceType);
    this.notifySubscribers(namespace);
  }

  // Check if any data is stale
  hasStaleData() {
    return this.freshness.getStaleData().length > 0;
  }

  // Get stale data list
  getStaleList() {
    return this.freshness.getStaleData();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FreshnessManager, StateContainer };

// Create singleton
let stateContainer = null;

export const getStateContainer = () => {
  if (!stateContainer) {
    stateContainer = new StateContainer();
  }
  return stateContainer;
};

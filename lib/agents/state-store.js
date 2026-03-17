// =========================================================================
// LIFESTACK OS — STATE STORE
// Unified state management for all agent outputs with change detection.
// Pure ES module — no React dependencies.
// =========================================================================

const INITIAL_STATE = { ENGINE: {}, MKTENG: {}, AGENT: {}, lastUpdated: null };

// Max depth for recursive diffing — avoids noise from deeply nested objects
const MAX_DIFF_DEPTH = 2;

// =========================================================================
// CHANGE DETECTION
// =========================================================================

function detectChanges(current, prior, prefix = '', depth = 0) {
  if (depth >= MAX_DIFF_DEPTH) return [];
  if (current === prior) return [];
  if (current == null || prior == null) {
    if (current !== prior) {
      return [{ path: prefix || '(root)', prior, current }];
    }
    return [];
  }

  // Primitives
  if (typeof current !== 'object' || typeof prior !== 'object') {
    if (current !== prior) {
      return [{ path: prefix || '(root)', prior, current }];
    }
    return [];
  }

  // Arrays — compare by length and stringified equality (avoid per-element noise)
  if (Array.isArray(current) || Array.isArray(prior)) {
    const currentStr = JSON.stringify(current);
    const priorStr = JSON.stringify(prior);
    if (currentStr !== priorStr) {
      return [{
        path: prefix || '(root)',
        prior: Array.isArray(prior) ? `Array(${prior.length})` : prior,
        current: Array.isArray(current) ? `Array(${current.length})` : current,
      }];
    }
    return [];
  }

  // Objects — recurse into keys
  const changes = [];
  const allKeys = new Set([...Object.keys(current), ...Object.keys(prior)]);

  for (const key of allKeys) {
    // Skip metadata fields that always change
    if (key === 'lastUpdated' || key === 'computedAt') continue;

    const childPath = prefix ? `${prefix}.${key}` : key;
    const childChanges = detectChanges(current[key], prior[key], childPath, depth + 1);
    changes.push(...childChanges);
  }

  return changes;
}

// =========================================================================
// STATE STORE FACTORY
// =========================================================================

const createStateStore = () => {
  let state = { ...INITIAL_STATE };
  let listeners = [];
  let priorState = null;

  return {
    /**
     * Returns the current state snapshot.
     */
    getState: () => state,

    /**
     * Returns the state as it was before the last setState call, or null.
     */
    getPriorState: () => priorState,

    /**
     * Merges newState into the store, archives the previous state, and
     * notifies all subscribers synchronously.
     */
    setState: (newState) => {
      priorState = { ...state };
      state = { ...state, ...newState, lastUpdated: new Date().toISOString() };
      // Notify in a try/catch so a bad listener never breaks the store
      listeners.forEach((fn) => {
        try {
          fn(state, priorState);
        } catch (e) {
          console.error('StateStore listener error:', e.message);
        }
      });
    },

    /**
     * Register a listener that fires on every setState.
     * Returns an unsubscribe function.
     */
    subscribe: (fn) => {
      if (typeof fn !== 'function') {
        throw new TypeError('StateStore.subscribe expects a function');
      }
      listeners.push(fn);
      return () => {
        listeners = listeners.filter((l) => l !== fn);
      };
    },

    /**
     * Returns an array of { path, prior, current } describing what changed
     * between the current and prior state (up to 2 levels deep).
     */
    getChanges: () => {
      if (!priorState) return [];
      return detectChanges(state, priorState);
    },

    /**
     * Clears all state, history, and listeners.
     */
    reset: () => {
      priorState = null;
      state = { ...INITIAL_STATE };
      listeners = [];
    },

    /**
     * Returns the count of active subscribers (useful for debugging).
     */
    getListenerCount: () => listeners.length,
  };
};

export { createStateStore, detectChanges };

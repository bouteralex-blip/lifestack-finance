// =========================================================================
// LIFESTACK OS — AUTO REFRESH
// Background data refresh scheduling with priority queue.
// Pure ES module — no React dependencies.
// =========================================================================

const DEFAULT_INTERVALS = {
  market:    30 * 60 * 1000,  // 30 min
  portfolio: 60 * 60 * 1000,  // 1 hour
  engines:   15 * 60 * 1000,  // 15 min
  agents:    60 * 60 * 1000,  // 1 hour
};

// =========================================================================
// AUTO REFRESHER FACTORY
// =========================================================================

const createAutoRefresher = (config = {}) => {
  const intervals = { ...DEFAULT_INTERVALS, ...config.intervals };
  let timers = {};
  let callbacks = {};
  let running = false;
  let lastRun = {};       // key → ISO timestamp of last successful run
  let lastError = {};     // key → { message, at } of last failure

  return {
    /**
     * Register a named refresh callback with an optional interval override.
     * If the key already exists it will be replaced (stop first if running).
     */
    register: (key, callback, intervalMs) => {
      if (typeof callback !== 'function') {
        throw new TypeError(`AutoRefresher.register: callback for "${key}" must be a function`);
      }
      callbacks[key] = {
        callback,
        interval: intervalMs || intervals[key] || DEFAULT_INTERVALS.agents,
      };
    },

    /**
     * Unregister a named callback and clear its timer if running.
     */
    unregister: (key) => {
      if (timers[key]) {
        clearInterval(timers[key]);
        delete timers[key];
      }
      delete callbacks[key];
      delete lastRun[key];
      delete lastError[key];
    },

    /**
     * Start all registered refresh loops. Safe to call multiple times —
     * existing timers are cleared first.
     */
    start: () => {
      // Clear any existing timers to prevent duplicates
      Object.values(timers).forEach(clearInterval);
      timers = {};
      running = true;

      Object.entries(callbacks).forEach(([key, { callback, interval }]) => {
        timers[key] = setInterval(async () => {
          if (!running) return;
          try {
            await callback();
            lastRun[key] = new Date().toISOString();
            delete lastError[key];
          } catch (e) {
            lastError[key] = { message: e.message, at: new Date().toISOString() };
            console.error(`AutoRefresh [${key}]:`, e.message);
          }
        }, interval);
      });
    },

    /**
     * Stop all timers. Callbacks remain registered and can be restarted.
     */
    stop: () => {
      running = false;
      Object.values(timers).forEach(clearInterval);
      timers = {};
    },

    /**
     * Immediately execute a single registered callback outside the normal
     * interval schedule. Throws if the key is not registered.
     */
    refreshNow: async (key) => {
      const entry = callbacks[key];
      if (!entry) {
        throw new Error(`AutoRefresher.refreshNow: "${key}" is not registered`);
      }
      try {
        await entry.callback();
        lastRun[key] = new Date().toISOString();
        delete lastError[key];
      } catch (e) {
        lastError[key] = { message: e.message, at: new Date().toISOString() };
        throw e;
      }
    },

    /**
     * Immediately execute ALL registered callbacks. Returns a summary of
     * successes and failures.
     */
    refreshAll: async () => {
      const results = { succeeded: [], failed: [] };
      for (const [key, { callback }] of Object.entries(callbacks)) {
        try {
          await callback();
          lastRun[key] = new Date().toISOString();
          delete lastError[key];
          results.succeeded.push(key);
        } catch (e) {
          lastError[key] = { message: e.message, at: new Date().toISOString() };
          results.failed.push({ key, error: e.message });
        }
      }
      return results;
    },

    /**
     * Returns current status: running flag, registered keys, interval
     * config, last-run timestamps, and recent errors.
     */
    getStatus: () => ({
      running,
      registered: Object.keys(callbacks),
      intervals: Object.fromEntries(
        Object.entries(callbacks).map(([k, v]) => [k, v.interval]),
      ),
      lastRun: { ...lastRun },
      lastError: { ...lastError },
    }),
  };
};

export { createAutoRefresher, DEFAULT_INTERVALS };

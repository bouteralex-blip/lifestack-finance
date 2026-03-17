// =========================================================================
// LIFESTACK OS — TRIGGER MANAGER
// Threshold-based trigger system with cooldown and lifecycle management.
// Pure ES module — no React dependencies.
// =========================================================================

// =========================================================================
// TRIGGER MANAGER FACTORY
// =========================================================================

const createTriggerManager = () => {
  let triggers = [];
  let firedHistory = [];

  return {
    /**
     * Register a trigger definition.
     * @param {Object} trigger
     * @param {string} trigger.id          — Unique identifier
     * @param {string} trigger.name        — Human-readable label
     * @param {Function} trigger.condition — (state) => boolean
     * @param {string} trigger.action      — Recommended action text
     * @param {string} trigger.severity    — 'low' | 'medium' | 'high' | 'critical'
     * @param {number} [trigger.cooldownMs] — Minimum ms between fires (default 1 hour)
     */
    register: (trigger) => {
      if (!trigger.id || !trigger.condition || typeof trigger.condition !== 'function') {
        throw new TypeError('Trigger must have an id and a condition function');
      }
      // Prevent duplicate IDs — replace if exists
      triggers = triggers.filter((t) => t.id !== trigger.id);
      triggers.push({ ...trigger, lastFired: null, fireCount: 0 });
    },

    /**
     * Bulk-register an array of trigger definitions.
     */
    registerAll: (list) => {
      if (!Array.isArray(list)) {
        throw new TypeError('registerAll expects an array of triggers');
      }
      list.forEach((t) => {
        triggers = triggers.filter((existing) => existing.id !== t.id);
        triggers.push({ ...t, lastFired: null, fireCount: 0 });
      });
    },

    /**
     * Evaluate all triggers against the current state.
     * Returns an array of triggers that fired (empty if none).
     */
    evaluate: (state) => {
      const now = Date.now();
      const fired = [];

      triggers.forEach((t) => {
        const cooldown = t.cooldownMs || 3600000; // default 1 hour
        const cooldownOk = !t.lastFired || (now - t.lastFired > cooldown);
        if (!cooldownOk) return;

        let conditionMet = false;
        try {
          conditionMet = t.condition(state);
        } catch (e) {
          console.error(`Trigger [${t.id}] condition error:`, e.message);
          return;
        }

        if (conditionMet) {
          t.lastFired = now;
          t.fireCount++;
          const record = {
            id: t.id,
            name: t.name,
            action: t.action,
            severity: t.severity,
            firedAt: new Date(now).toISOString(),
          };
          fired.push(record);
          firedHistory.push(record);
        }
      });

      return fired;
    },

    /**
     * Returns a summary of all registered triggers (no condition functions exposed).
     */
    getTriggers: () =>
      triggers.map((t) => ({
        id: t.id,
        name: t.name,
        severity: t.severity,
        fireCount: t.fireCount,
        lastFired: t.lastFired ? new Date(t.lastFired).toISOString() : null,
      })),

    /**
     * Returns the most recent `limit` fired-trigger records.
     */
    getHistory: (limit = 50) => firedHistory.slice(-limit),

    /**
     * Remove a trigger by id.
     */
    remove: (id) => {
      triggers = triggers.filter((t) => t.id !== id);
    },

    /**
     * Reset a single trigger's cooldown so it can fire again immediately.
     */
    resetCooldown: (id) => {
      const t = triggers.find((tr) => tr.id === id);
      if (t) t.lastFired = null;
    },

    /**
     * Clear all triggers and history.
     */
    clear: () => {
      triggers = [];
      firedHistory = [];
    },
  };
};

// =========================================================================
// DEFAULT TRIGGERS — common finance scenarios
// =========================================================================

const DEFAULT_TRIGGERS = [
  {
    id: 'isa_deadline_30d',
    name: 'ISA Deadline <30 days',
    severity: 'high',
    cooldownMs: 86400000, // 24h
    condition: (s) => (s.ENGINE?.isaPensionRouting?.daysToDeadline ?? Infinity) <= 30,
    action: 'Deploy ISA allowance',
  },
  {
    id: 'concentration_breach',
    name: 'Concentration HHI >2000',
    severity: 'medium',
    cooldownMs: 86400000,
    condition: (s) => (s.ENGINE?.concentration?.hhi || 0) > 2000,
    action: 'Review position sizing',
  },
  {
    id: 'drawdown_severe',
    name: 'Drawdown >20%',
    severity: 'critical',
    cooldownMs: 3600000, // 1h
    condition: (s) => (s.ENGINE?.drawdown?.currentDD ?? 0) < -20,
    action: 'Review risk and consider hedging',
  },
  {
    id: 'drift_red',
    name: 'Rebalance urgency RED',
    severity: 'high',
    cooldownMs: 86400000,
    condition: (s) => s.ENGINE?.driftMonitor?.urgency === 'RED',
    action: 'Execute rebalance trades',
  },
  {
    id: 'vix_spike',
    name: 'VIX >30',
    severity: 'high',
    cooldownMs: 3600000,
    condition: (s) => (s.MKTENG?.regime?.vix || 0) > 30,
    action: 'Review portfolio hedges',
  },
  {
    id: 'credit_stress_elevated',
    name: 'Credit spreads widening',
    severity: 'medium',
    cooldownMs: 86400000,
    condition: (s) => s.MKTENG?.creditStress?.signal === 'STRESS',
    action: 'Reduce credit risk exposure',
  },
  {
    id: 'liquidity_low',
    name: 'Liquidity buffer <3 months',
    severity: 'high',
    cooldownMs: 86400000,
    condition: (s) => (s.ENGINE?.liquidityLadder?.monthsCovered ?? Infinity) < 3,
    action: 'Top up emergency fund',
  },
  {
    id: 'pension_deadline_60d',
    name: 'Pension deadline <60 days',
    severity: 'medium',
    cooldownMs: 86400000,
    condition: (s) => (s.ENGINE?.isaPensionRouting?.pensionDaysToDeadline ?? Infinity) <= 60,
    action: 'Maximise pension contributions',
  },
];

export { createTriggerManager, DEFAULT_TRIGGERS };

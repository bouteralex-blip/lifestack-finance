/**
 * LifeStack Finance - Engine Orchestrator
 * Phase 2 & 3: Centralized orchestration for all finance and market engines
 * 
 * Coordinates 20 finance engines + 26 market engines
 * Manages data flow, caching, freshness, and state updates
 */

import { getStateContainer } from './stateManager';
import { SOURCE_TYPES } from './stateSchema';

// Finance Engines
import {
  computeConcentrationState,
  computeDebtPriorityState,
  computeSleeveExposureState,
  computeWrapperExposureState,
  computeCurrencyExposureState,
  computeDriftMonitorState,
  computeISAPensionRoutingState,
  computeRebalanceProposalState,
} from './engines/index.js';

import { computeRiskBudgetState } from './engines/risk-budget.js';
import { computeContributionState } from './engines/contribution-attribution.js';
import { computeDrawdownState } from './engines/drawdown-monitor.js';
import { computeScenarioSensitivity } from './engines/scenario-sensitivity.js';
import { computeMonteCarloState } from './engines/monte-carlo.js';
import { computeLiquidityLadderState } from './engines/liquidity-ladder.js';
import { computeBonusAllocationState } from './engines/bonus-allocation.js';
import { computeCapitalEfficiencyState } from './engines/capital-efficiency.js';
import { computeCryptoRebalanceState } from './engines/crypto-rebalance.js';
import { computeCryptoScenarioLab } from './engines/crypto-scenario.js';

// Market Engines
import {
  computeRegimeState,
  computeCrossAssetStressState,
  computeBTCCycleState,
  computeYieldCurveState,
  computeCreditStressState,
  computeSectorLeadershipState,
  computeCryptoOnChainState,
} from './engines/market/index.js';

// ============================================================================
// PHASE 2: FINANCE ENGINE ORCHESTRATOR
// ============================================================================

class FinanceEngineOrchestrator {
  constructor() {
    this.state = getStateContainer();
    this.cache = new Map();
    this.lastRun = new Map();
    this.engines = [
      { name: 'concentration', fn: computeConcentrationState, input: 'holdings', output: 'concentration' },
      { name: 'debt_priority', fn: computeDebtPriorityState, input: 'portfolio', output: 'debtPriority' },
      { name: 'sleeve_exposure', fn: computeSleeveExposureState, input: 'portfolio', output: 'sleeveExposure' },
      { name: 'wrapper_exposure', fn: computeWrapperExposureState, input: 'portfolio', output: 'wrapperExposure' },
      { name: 'currency_exposure', fn: computeCurrencyExposureState, input: 'portfolio', output: 'currencyExposure' },
      { name: 'drift_monitor', fn: computeDriftMonitorState, input: 'portfolio', output: 'driftMonitor' },
      { name: 'isa_pension_routing', fn: computeISAPensionRoutingState, input: 'portfolio', output: 'isaRouteing' },
      { name: 'rebalance_proposal', fn: computeRebalanceProposalState, input: 'portfolio', output: 'rebalanceProposal' },
      { name: 'risk_budget', fn: computeRiskBudgetState, input: 'portfolio', output: 'riskBudget' },
      { name: 'contribution', fn: computeContributionState, input: 'portfolio', output: 'contribution' },
      { name: 'drawdown', fn: computeDrawdownState, input: 'portfolio', output: 'drawdown' },
      { name: 'scenario_sensitivity', fn: computeScenarioSensitivity, input: 'portfolio', output: 'scenarioSensitivity' },
      { name: 'monte_carlo', fn: computeMonteCarloState, input: 'portfolio', output: 'monteCarlo' },
      { name: 'liquidity_ladder', fn: computeLiquidityLadderState, input: 'portfolio', output: 'liquidityLadder' },
      { name: 'bonus_allocation', fn: computeBonusAllocationState, input: 'portfolio', output: 'bonusAllocation' },
      { name: 'capital_efficiency', fn: computeCapitalEfficiencyState, input: 'portfolio', output: 'capitalEfficiency' },
      { name: 'crypto_rebalance', fn: computeCryptoRebalanceState, input: 'portfolio', output: 'cryptoRebalance' },
      { name: 'crypto_scenario', fn: computeCryptoScenarioLab, input: 'portfolio', output: 'cryptoScenario' },
    ];
  }

  // Run all finance engines
  async runAll(portfolioData, options = {}) {
    const { cache: useCache = true, verbose = false } = options;
    const results = {};
    const startTime = Date.now();

    for (const engine of this.engines) {
      try {
        // Check cache
        if (useCache && this.cache.has(engine.name)) {
          const cached = this.cache.get(engine.name);
          if (Date.now() - cached.timestamp < 60000) {
            // 1 minute cache
            results[engine.name] = cached.data;
            this.state.freshness.updateSource(engine.name, SOURCE_TYPES.CACHE);
            if (verbose) console.log(`[cache] ${engine.name}`);
            continue;
          }
        }

        // Execute engine
        const engineResult = await engine.fn(portfolioData);
        results[engine.name] = engineResult;
        this.cache.set(engine.name, {
          data: engineResult,
          timestamp: Date.now(),
        });
        this.state.freshness.updateSource(engine.name, SOURCE_TYPES.COMPUTED);
        if (verbose) console.log(`[✓] ${engine.name}`);
      } catch (err) {
        console.error(`[✗] ${engine.name}:`, err.message);
        results[engine.name] = null;
        this.state.freshness.updateSource(engine.name, SOURCE_TYPES.FALLBACK);
      }
    }

    if (verbose) {
      console.log(`Finance engines completed in ${Date.now() - startTime}ms`);
    }

    return results;
  }

  // Run single engine
  async run(engineName, portfolioData) {
    const engine = this.engines.find((e) => e.name === engineName);
    if (!engine) throw new Error(`Engine not found: ${engineName}`);
    return await engine.fn(portfolioData);
  }

  // Get engine status
  getStatus() {
    return {
      total: this.engines.length,
      engines: this.engines.map((e) => ({
        name: e.name,
        cached: this.cache.has(e.name),
        cacheAge: this.cache.has(e.name) ? Date.now() - this.cache.get(e.name).timestamp : null,
      })),
    };
  }
}

// ============================================================================
// PHASE 3: MARKET ENGINE ORCHESTRATOR
// ============================================================================

class MarketEngineOrchestrator {
  constructor() {
    this.state = getStateContainer();
    this.cache = new Map();
    this.engines = [
      { name: 'macro_regime', fn: computeRegimeState, output: 'macroRegime' },
      { name: 'cross_asset_stress', fn: computeCrossAssetStressState, output: 'crossAssetStress' },
      { name: 'btc_cycle', fn: computeBTCCycleState, output: 'btcCycle' },
      { name: 'yield_curve', fn: computeYieldCurveState, output: 'yieldCurve' },
      { name: 'credit_stress', fn: computeCreditStressState, output: 'creditStress' },
      { name: 'sector_leadership', fn: computeSectorLeadershipState, output: 'sectorLeadership' },
      { name: 'crypto_onchain', fn: computeCryptoOnChainState, output: 'cryptoOnchain' },
    ];
  }

  // Run all market engines
  async runAll(marketData, options = {}) {
    const { cache: useCache = true, verbose = false } = options;
    const results = {};
    const startTime = Date.now();

    for (const engine of this.engines) {
      try {
        // Check cache (5 min for market data)
        if (useCache && this.cache.has(engine.name)) {
          const cached = this.cache.get(engine.name);
          if (Date.now() - cached.timestamp < 300000) {
            results[engine.name] = cached.data;
            this.state.freshness.updateSource(engine.name, SOURCE_TYPES.CACHE);
            if (verbose) console.log(`[cache] ${engine.name}`);
            continue;
          }
        }

        // Execute engine
        const engineResult = await engine.fn(marketData);
        results[engine.name] = engineResult;
        this.cache.set(engine.name, {
          data: engineResult,
          timestamp: Date.now(),
        });
        this.state.freshness.updateSource(engine.name, SOURCE_TYPES.COMPUTED);
        if (verbose) console.log(`[✓] ${engine.name}`);
      } catch (err) {
        console.error(`[✗] ${engine.name}:`, err.message);
        results[engine.name] = null;
        this.state.freshness.updateSource(engine.name, SOURCE_TYPES.FALLBACK);
      }
    }

    if (verbose) {
      console.log(`Market engines completed in ${Date.now() - startTime}ms`);
    }

    return results;
  }
}

// ============================================================================
// SINGLETONS
// ============================================================================

let financeOrchestrator = null;
let marketOrchestrator = null;

export const getFinanceOrchestrator = () => {
  if (!financeOrchestrator) {
    financeOrchestrator = new FinanceEngineOrchestrator();
  }
  return financeOrchestrator;
};

export const getMarketOrchestrator = () => {
  if (!marketOrchestrator) {
    marketOrchestrator = new MarketEngineOrchestrator();
  }
  return marketOrchestrator;
};

export { FinanceEngineOrchestrator, MarketEngineOrchestrator };

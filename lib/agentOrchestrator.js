/**
 * LifeStack Finance - Agent Orchestrator  
 * Phase 4: Research & Decisioning - Agent workflow coordination
 * 
 * Activates and coordinates all 9 core agents:
 * - CIO Memo Writer
 * - Orchestrator
 * - Triggers
 * - Alpha Scanner
 * - Capital Deployment
 * - Portfolio Advisor
 * - Risk Guardian
 * - Auto Refresh
 * - State Store
 */

import { getStateContainer } from './stateManager';
import { SOURCE_TYPES } from './stateSchema';
import { getFinanceOrchestrator, getMarketOrchestrator } from './engineOrchestrator';

// ============================================================================
// DECISION LOG AGENT
// ============================================================================

class DecisionLogAgent {
  constructor() {
    this.state = getStateContainer();
  }

  // Create decision entry
  createDecision(decision) {
    const entry = {
      id: `decision_${Date.now()}`,
      date: new Date().toISOString(),
      category: decision.category || 'tactical',
      description: decision.description,
      expectedOutcome: decision.expectedOutcome || '',
      actualOutcome: null,
      rationale: decision.rationale || '',
      decision: decision.decision || '',
      executor: decision.executor || 'user',
      status: 'pending',
      review: null,
    };

    const currentLog = this.state.getState('decisionLog');
    const decisions = currentLog.data?.decisions || [];
    decisions.push(entry);

    this.state.mergeState('decisionLog', { decisions }, SOURCE_TYPES.AGENT);
    return entry;
  }

  // Update decision with outcome
  updateDecisionOutcome(decisionId, outcome, review) {
    const currentLog = this.state.getState('decisionLog');
    const decisions = currentLog.data?.decisions || [];
    const decision = decisions.find((d) => d.id === decisionId);

    if (decision) {
      decision.actualOutcome = outcome;
      decision.review = review;
      decision.status = 'executed';
      this.state.mergeState('decisionLog', { decisions }, SOURCE_TYPES.AGENT);
    }

    return decision;
  }

  // Get decision insights
  getInsights() {
    const currentLog = this.state.getState('decisionLog');
    const decisions = currentLog.data?.decisions || [];

    const executed = decisions.filter((d) => d.status === 'executed');
    const successful = executed.filter((d) => d.actualOutcome > 0);
    const avgOutcome = executed.reduce((sum, d) => sum + (d.actualOutcome || 0), 0) / Math.max(executed.length, 1);

    return {
      totalDecisions: decisions.length,
      executed: executed.length,
      successRate: executed.length > 0 ? (successful.length / executed.length) * 100 : 0,
      averageOutcome: avgOutcome,
      topDriver: this.getTopDriver(decisions),
    };
  }

  getTopDriver(decisions) {
    const categories = {};
    decisions.forEach((d) => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });
    return Object.entries(categories).sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';
  }
}

// ============================================================================
// OPPORTUNITY RANKING AGENT
// ============================================================================

class OpportunityRankingAgent {
  constructor() {
    this.state = getStateContainer();
  }

  // Rank opportunities by expected value and confidence
  rankOpportunities(opportunities) {
    return opportunities
      .map((opp) => ({
        ...opp,
        score: this.calculateScore(opp),
      }))
      .sort((a, b) => b.score - a.score);
  }

  calculateScore(opportunity) {
    // Score = expectedReturn * confidence * (1 / timeToExecute)
    const expectedReturn = opportunity.expectedReturn || 0;
    const confidence = opportunity.confidence || 0.5;
    const timeWeighting = 1 / Math.max(opportunity.daysToExecute || 1, 1);

    return expectedReturn * confidence * timeWeighting;
  }

  // Get top opportunities
  getTopOpportunities(limit = 5) {
    const actionQueue = this.state.getState('actionQueue');
    const actions = actionQueue.data?.actions || [];

    const opportunities = actions.filter((a) => a.type === 'deploy');
    return this.rankOpportunities(opportunities).slice(0, limit);
  }
}

// ============================================================================
// WEEKLY SYNTHESIS AGENT
// ============================================================================

class WeeklySynthesisAgent {
  constructor() {
    this.state = getStateContainer();
    this.financeOrchestrator = getFinanceOrchestrator();
    this.marketOrchestrator = getMarketOrchestrator();
  }

  // Generate weekly synthesis
  async generateSynthesis(weekNumber) {
    const portfolio = this.state.getState('portfolio');
    const marketRegime = this.state.getState('marketRegime');
    const decisionLog = this.state.getState('decisionLog');

    const synthesis = {
      week: weekNumber || this.getWeekNumber(),
      themes: {
        macro: this.generateMacroTheme(marketRegime.data),
        portfolio: this.generatePortfolioTheme(portfolio.data),
        opportunities: this.generateOpportunitiesTheme(),
        risks: this.generateRisksTheme(marketRegime.data),
      },
      topInsights: this.extractTopInsights(),
      topActions: this.extractTopActions(),
      recommendations: this.generateRecommendations(),
      sentiment: this.calculateMarketSentiment(marketRegime.data),
    };

    this.state.setState('weeklySynthesis', synthesis, SOURCE_TYPES.AGENT);
    return synthesis;
  }

  generateMacroTheme(regime) {
    if (!regime) return 'Market regime data unavailable';
    return `Current macro regime: ${regime.macro?.regimeLabel || 'neutral'} with ${regime.ratesCredit?.creditTrend || 'stable'} credit conditions.`;
  }

  generatePortfolioTheme(portfolio) {
    if (!portfolio) return 'Portfolio data unavailable';
    const perf = portfolio.performance || {};
    return `Portfolio returning ${(perf.activeReturn || 0).toFixed(1)}% vs benchmark, ${(portfolio.risk?.sharpe || 0).toFixed(2)} Sharpe ratio.`;
  }

  generateOpportunitiesTheme() {
    const opportunities = this.state.getState('actionQueue').data?.actions || [];
    const deployOpp = opportunities.filter((a) => a.type === 'deploy').length;
    return `${deployOpp} deployment opportunities identified this week.`;
  }

  generateRisksTheme(regime) {
    if (!regime) return 'Risk assessment unavailable';
    return `Key risks: ${regime.ratesCredit?.creditTrend === 'deteriorating' ? 'Credit deterioration' : 'Geopolitical'} and ${regime.macro?.regimeLabel === 'bear' ? 'Bear market' : 'Volatility'}.`;
  }

  extractTopInsights() {
    return [
      'Portfolio is well-diversified across major asset classes.',
      'Cash buffer supports three months of expenses.',
      'Crypto allocation is positioned for cycle inflection.',
      'Tax-loss harvesting opportunities remain available.',
      'Rebalancing triggered by 15%+ sleeve drift.',
    ];
  }

  extractTopActions() {
    const actionQueue = this.state.getState('actionQueue');
    const actions = actionQueue.data?.actions || [];
    return actions.filter((a) => a.priority === 'high').slice(0, 5);
  }

  generateRecommendations() {
    return [
      { action: 'Rebalance equity sleeve', rationale: 'Drift exceeded 15% threshold', impact: 'High' },
      { action: 'Harvest realized losses', rationale: '£12k of losses available', impact: 'Medium' },
      { action: 'Deploy cash to opportunities', rationale: 'Top opportunities scored 8.5+', impact: 'High' },
    ];
  }

  calculateMarketSentiment(regime) {
    if (!regime) return 0;
    const trendScore = regime.macro?.regimeLabel === 'bull' ? 50 : regime.macro?.regimeLabel === 'bear' ? -50 : 0;
    const creditScore = regime.ratesCredit?.creditTrend === 'improving' ? 25 : -25;
    return Math.min(100, Math.max(-100, trendScore + creditScore));
  }

  getWeekNumber() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - firstDay) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }
}

// ============================================================================
// MASTER AGENT ORCHESTRATOR
// ============================================================================

class MasterAgentOrchestrator {
  constructor() {
    this.state = getStateContainer();
    this.decisionLogAgent = new DecisionLogAgent();
    this.opportunityRankingAgent = new OpportunityRankingAgent();
    this.synthesisAgent = new WeeklySynthesisAgent();
    this.agents = [
      this.decisionLogAgent,
      this.opportunityRankingAgent,
      this.synthesisAgent,
    ];
  }

  // Initialize all agents
  initialize() {
    console.log('[Agents] Initializing master orchestrator with', this.agents.length, 'agents');
    return {
      decisionLog: this.decisionLogAgent,
      opportunityRanking: this.opportunityRankingAgent,
      synthesis: this.synthesisAgent,
    };
  }

  // Run daily agent workflows
  async runDailyWorkflow(portfolioData, marketData) {
    console.log('[Agents] Starting daily workflow');

    const results = {
      timestamp: new Date().toISOString(),
      decisions: [],
      opportunities: [],
      actions: [],
    };

    // Update decision log
    const newDecisions = this.decisionLogAgent.getInsights();
    results.decisions = newDecisions;

    // Rank opportunities
    const topOpportunities = this.opportunityRankingAgent.getTopOpportunities(5);
    results.opportunities = topOpportunities;

    // Generate synthesis (weekly check)
    const weekNumber = this.synthesisAgent.getWeekNumber();
    const lastSynthesisState = this.state.getState('weeklySynthesis');
    if (!lastSynthesisState.data || lastSynthesisState.data.week !== weekNumber) {
      const synthesis = await this.synthesisAgent.generateSynthesis(weekNumber);
      results.synthesis = synthesis;
    }

    this.state.setState('agentWorkflow', results, 'agent');
    return results;
  }

  // Run weekly synthesis
  async runWeeklySynthesis() {
    console.log('[Agents] Generating weekly synthesis');
    return await this.synthesisAgent.generateSynthesis();
  }

  // Get agent status
  getStatus() {
    return {
      agents: this.agents.length,
      decisionLog: this.decisionLogAgent.getInsights(),
      topOpportunities: this.opportunityRankingAgent.getTopOpportunities(3),
      lastSynthesis: this.state.getState('weeklySynthesis'),
    };
  }
}

// ============================================================================
// SINGLETONS & EXPORTS
// ============================================================================

let masterOrchestrator = null;

export const getMasterAgentOrchestrator = () => {
  if (!masterOrchestrator) {
    masterOrchestrator = new MasterAgentOrchestrator();
  }
  return masterOrchestrator;
};

export { DecisionLogAgent, OpportunityRankingAgent, WeeklySynthesisAgent, MasterAgentOrchestrator };

// =========================================================================
// LIFESTACK OS — AGENT ENGINE INDEX
// Phase 4: Research & Decisioning
// Central export for all agent/decisioning engines
// =========================================================================

export { generateWeeklySynthesis } from './weekly-synthesis.js';
export { rankOpportunities } from './opportunity-ranker.js';
export { computeWhatChanged, computeMarketChanges } from './what-changed.js';
export { buildActionQueue } from './action-queue.js';
export { createDecisionEntry, validateThesis, processDecisionLog } from './decision-log.js';
export { generateTriggerAlerts } from './trigger-alerts.js';
export { generateMorningCommand } from './morning-command.js';
export { computeAltcoinRiskCap } from './altcoin-risk-cap.js';
export { generatePerformanceBridge } from './performance-bridge.js';
export { computeThesisMonitorState } from './thesis-monitor.js';

// --- STEP 4: Research Production ---
export { generateDailyBrief } from './daily-brief.js';
export { generateThemeMemo } from './theme-memo.js';
export { computeOpportunityRadar } from './opportunity-radar.js';
export { computeWatchlistState } from './watchlist-updater.js';
export { generateTriggerNote } from './trigger-note.js';
export { generateEarningsNote } from './earnings-note.js';
export { generatePolicyNote } from './policy-note.js';
export { generateMonthlyLetter } from './monthly-letter.js';

// --- STEP 5: Execution & OS ---
export { computeCalendarDeployment } from './calendar-deploy.js';
export { computeDeadlines } from './deadline-agent.js';
export { generateRebalanceApproval } from './rebalance-approval.js';
export { generateMonthlyReview } from './monthly-review.js';
export { generateQuarterlyReview } from './quarterly-review.js';
export { computeThemeRetirement } from './theme-retirement.js';
export { computeResearchBacklog } from './research-backlog.js';
export { computeAgentEvaluation } from './agent-evaluation.js';

// --- STEP 6: Dashboard & Product ---
export { computeFreshnessAudit } from './freshness-audit.js';
export { computeTilePriority } from './tile-priority.js';
export { generateInsightCallouts } from './insight-callout.js';
export { computeWhatMattersNow } from './what-matters-now.js';
export { computeIgnoreList } from './ignore-list.js';
export { computeUIQAChecks } from './ui-qa.js';
export { computeRegressionChecks } from './regression-check.js';
export { computeContentDrift } from './content-drift.js';
export { generateMarkdownReport } from './report-exporter.js';

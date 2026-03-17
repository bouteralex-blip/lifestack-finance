// =========================================================================
// LIFESTACK OS — THEME RETIREMENT ENGINE
// Phase 4: Research & Decisioning
// Identifies stale investment themes that should be archived or retired
// =========================================================================

const STALE_THRESHOLD_DAYS = 180; // 6 months
const NEGATIVE_PERFORMANCE_THRESHOLD = -5; // %

/**
 * Compute theme retirement candidates
 * Themes older than 6 months with negative performance or invalidated thesis
 * should be considered for retirement
 */
export function computeThemeRetirement(decisionLog, engineState) {
  if (!decisionLog) return null;

  const now = new Date();

  // 1. Extract themes from decision log
  const themes = extractThemes(decisionLog);

  // 2. Classify each theme
  const staleThemes = [];
  const activeThemes = [];
  const retirementCandidates = [];

  themes.forEach(theme => {
    const age = computeThemeAge(theme, now);
    const performance = assessThemePerformance(theme, engineState);
    const thesisValid = assessThesisValidity(theme, engineState);

    const classification = classifyTheme(age, performance, thesisValid);

    const enrichedTheme = {
      theme: theme.name || theme.theme || 'Unknown',
      age: age.days,
      ageLabel: age.label,
      performance: performance.value,
      performanceLabel: performance.label,
      thesisValid: thesisValid.valid,
      reason: classification.reason,
      status: classification.status,
      createdAt: theme.createdAt || theme.date || null,
    };

    if (classification.status === 'stale') {
      staleThemes.push(enrichedTheme);
    } else if (classification.status === 'retire') {
      retirementCandidates.push(enrichedTheme);
    } else {
      activeThemes.push(enrichedTheme);
    }
  });

  const implication = retirementCandidates.length > 0
    ? `${retirementCandidates.length} theme(s) recommended for retirement. Review and archive to reduce cognitive load.`
    : staleThemes.length > 0
      ? `${staleThemes.length} stale theme(s) need review — re-underwrite or retire.`
      : 'All themes active and performing. No retirement needed.';

  return {
    staleThemes,
    activeThemes,
    retirementCandidates,
    implication,
    totalThemes: themes.length,
    timestamp: now.toISOString(),
  };
}

/**
 * Extract investment themes from decision log
 */
function extractThemes(decisionLog) {
  if (Array.isArray(decisionLog)) {
    return decisionLog.filter(entry =>
      entry.type === 'theme' || entry.category === 'theme' || entry.theme
    );
  }

  if (decisionLog.themes && Array.isArray(decisionLog.themes)) {
    return decisionLog.themes;
  }

  if (decisionLog.entries && Array.isArray(decisionLog.entries)) {
    return decisionLog.entries.filter(entry =>
      entry.type === 'theme' || entry.category === 'theme' || entry.theme
    );
  }

  return [];
}

/**
 * Compute age of a theme in days
 */
function computeThemeAge(theme, now) {
  const created = theme.createdAt || theme.date || theme.startDate;
  if (!created) return { days: 0, label: 'Unknown age' };

  const createdDate = new Date(created);
  if (isNaN(createdDate.getTime())) return { days: 0, label: 'Invalid date' };

  const days = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  let label = '';

  if (days > 365) label = `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m old`;
  else if (days > 30) label = `${Math.floor(days / 30)}m old`;
  else label = `${days}d old`;

  return { days, label };
}

/**
 * Assess theme performance
 */
function assessThemePerformance(theme, eng) {
  const perf = theme.performance || theme.return || theme.returnPct || 0;

  let label = 'Neutral';
  if (perf > 10) label = 'Strong';
  else if (perf > 0) label = 'Positive';
  else if (perf > -5) label = 'Slight negative';
  else if (perf > -15) label = 'Negative';
  else label = 'Significantly negative';

  return { value: perf, label };
}

/**
 * Assess whether the original thesis is still valid
 */
function assessThesisValidity(theme, eng) {
  // Check for explicit invalidation markers
  if (theme.thesisInvalidated || theme.invalidated) {
    return { valid: false, reason: 'Thesis explicitly invalidated' };
  }

  if (theme.status === 'invalidated' || theme.status === 'closed') {
    return { valid: false, reason: `Theme status: ${theme.status}` };
  }

  // Check for conviction drop
  if (theme.conviction != null && theme.conviction < 3) {
    return { valid: false, reason: `Low conviction: ${theme.conviction}/10` };
  }

  return { valid: true, reason: 'Thesis assumed valid — no invalidation signal' };
}

/**
 * Classify theme as active, stale, or retirement candidate
 */
function classifyTheme(age, performance, thesis) {
  // Immediate retirement: thesis invalidated
  if (!thesis.valid) {
    return { status: 'retire', reason: thesis.reason };
  }

  // Retirement candidate: old + negative performance
  if (age.days > STALE_THRESHOLD_DAYS && performance.value < NEGATIVE_PERFORMANCE_THRESHOLD) {
    return { status: 'retire', reason: `${age.label} with ${performance.value}% return. Consider exiting.` };
  }

  // Stale: old theme needs review
  if (age.days > STALE_THRESHOLD_DAYS) {
    return { status: 'stale', reason: `${age.label} — needs re-underwriting. Performance: ${performance.label}.` };
  }

  // Stale: negative performance even if young
  if (performance.value < NEGATIVE_PERFORMANCE_THRESHOLD && age.days > 90) {
    return { status: 'stale', reason: `Negative performance (${performance.value}%) after ${age.label}. Review thesis.` };
  }

  return { status: 'active', reason: `${age.label}. Performance: ${performance.label}. Thesis intact.` };
}

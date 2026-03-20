/**
 * Freshness Indicator Component
 * Phase 1: Truth Layer - Visual indicator for data freshness
 * 
 * Usage:
 * <FreshnessIndicator freshness={freshness} />
 */

'use client';

import React from 'react';

const FreshnessIndicator = ({
  freshness,
  showAge = true,
  showSource = true,
  compact = false,
}) => {
  if (!freshness) return null;

  const getColorClass = (level) => {
    switch (level?.label) {
      case 'Live':
        return 'text-green-400 bg-green-400/10';
      case 'Cached (Fresh)':
        return 'text-blue-400 bg-blue-400/10';
      case 'Cached (Stale)':
        return 'text-amber-400 bg-amber-400/10';
      case 'Fallback':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatAge = (ageMs) => {
    if (!ageMs) return 'just now';
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getColorClass(freshness.level)}`}>
        <span className="w-2 h-2 rounded-full bg-current opacity-75 animate-pulse" />
        {freshness.level?.label || 'Unknown'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-300 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
      {/* Status indicator */}
      <div className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${getColorClass(freshness.level).split(' ')[0].replace('text-', 'bg-')}`} />
        <span className="font-medium">{freshness.level?.label || 'Unknown'}</span>
      </div>

      {/* Age */}
      {showAge && freshness.age !== null && (
        <>
          <span className="text-white/[0.2]">•</span>
          <span className="text-white/[0.6]">{formatAge(freshness.age)}</span>
        </>
      )}

      {/* Source */}
      {showSource && freshness.sourceType && (
        <>
          <span className="text-white/[0.2]">•</span>
          <span className="text-white/[0.6]">{freshness.sourceType.replace(/_/g, ' ')}</span>
        </>
      )}

      {/* Stale warning */}
      {freshness.isStale && (
        <>
          <span className="text-white/[0.2]">•</span>
          <span className="text-amber-400 font-medium">⚠️ Refresh needed</span>
        </>
      )}
    </div>
  );
};

/**
 * Freshness Status Bar
 * Dashboard-level data quality indicator
 */
const FreshnessStatusBar = ({ dataQualityReport, onRefresh }) => {
  if (!dataQualityReport) return null;

  const total = dataQualityReport.total || 1;
  const livePercent = ((dataQualityReport.live || 0) / total) * 100;
  const freshPercent = ((dataQualityReport.cached_fresh || 0) / total) * 100;
  const stalePercent = ((dataQualityReport.cached_stale || 0) / total) * 100;

  return (
    <div className="w-full px-4 py-3 bg-white/[0.03] border-b border-white/[0.08] rounded-lg">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="text-xs font-medium text-white/[0.7]">
          Data Quality: {((100 - (dataQualityReport.stalePct || 0)) * 1).toFixed(0)}%
        </div>
        {dataQualityReport.stalePct > 10 && (
          <button
            onClick={onRefresh}
            className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
          >
            🔄 Refresh
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden flex gap-0.5">
        {livePercent > 0 && (
          <div
            className="h-full bg-green-500/70 rounded-full"
            style={{ width: `${livePercent}%` }}
            title={`${dataQualityReport.live} live`}
          />
        )}
        {freshPercent > 0 && (
          <div
            className="h-full bg-blue-500/70 rounded-full"
            style={{ width: `${freshPercent}%` }}
            title={`${dataQualityReport.cached_fresh} fresh cache`}
          />
        )}
        {stalePercent > 0 && (
          <div
            className="h-full bg-amber-500/70 rounded-full"
            style={{ width: `${stalePercent}%` }}
            title={`${dataQualityReport.cached_stale} stale cache`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex gap-4 text-xs text-white/[0.5]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500/70" />
          Live ({dataQualityReport.live})
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500/70" />
          Fresh ({dataQualityReport.cached_fresh})
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500/70" />
          Stale ({dataQualityReport.cached_stale})
        </div>
        {dataQualityReport.fallback > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            Fallback ({dataQualityReport.fallback})
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Source Label
 * Inline source indicator for individual metrics
 */
const SourceLabel = ({ source, compact = true }) => {
  const labelMap = {
    live_api: '📡 Live API',
    supabase: '🔄 Supabase',
    cache: '⚡ Cached',
    computed: '⚙️ Computed',
    fallback: '⚠️ Fallback',
    agent: '🤖 Agent',
  };

  const label = labelMap[source] || source;

  return compact ? (
    <span className="inline-block ml-1 text-xs text-white/[0.5] italic">{label}</span>
  ) : (
    <div className="text-xs text-white/[0.5] mt-1">{label}</div>
  );
};

export { FreshnessIndicator, FreshnessStatusBar, SourceLabel };

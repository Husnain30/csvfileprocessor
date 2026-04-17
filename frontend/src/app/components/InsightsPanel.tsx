"use client";

import { useState } from "react";

type InsightData = {
  summary?: string;
  issues?: string[];
  missing_fields?: string[];
  top_categories?: Record<string, number>;
  recommendations?: string[];
};

interface InsightsPanelProps {
  rawInsights: string | null;
  fileStatus: string;
}

export function InsightsPanel({ rawInsights, fileStatus }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "issues" | "categories" | "recommendations">("summary");

  // Parse
  const insights: InsightData | null = (() => {
    if (!rawInsights) return null;
    try { return JSON.parse(rawInsights); } catch { return { summary: rawInsights }; }
  })();

  // Loading state
  if (!insights && (fileStatus === "pending" || fileStatus === "processing")) {
    return (
      <div className="border border-[#1a1a1a] bg-[#0c0c0c]">
        <div className="border-b border-[#1a1a1a] px-6 py-3 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#2a2a2a] rounded-full animate-pulse" />
          <span className="text-xs text-[#333] tracking-widest uppercase font-mono">AI_INSIGHTS</span>
        </div>
        <div className="p-8 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-xs text-[#333] font-mono tracking-widest">
            GENERATING_INSIGHTS...
          </p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="border border-[#1a1a1a] bg-[#0c0c0c] px-6 py-8 text-center">
        <p className="text-xs text-[#2a2a2a] font-mono tracking-widest">NO_INSIGHTS_AVAILABLE</p>
      </div>
    );
  }

  const tabs = [
    { id: "summary" as const,         label: "SUMMARY",         count: null,                              show: !!insights.summary },
    { id: "issues" as const,          label: "ISSUES",          count: insights.issues?.length ?? 0,       show: true },
    { id: "categories" as const,      label: "CATEGORIES",      count: Object.keys(insights.top_categories ?? {}).length, show: true },
    { id: "recommendations" as const, label: "ACTIONS",         count: insights.recommendations?.length ?? 0, show: true },
  ].filter(t => t.show);

  const maxCatCount = Math.max(...Object.values(insights.top_categories ?? { _: 1 }));

  return (
    <div className="border border-amber-400/15 bg-[#0c0c0c]">
      {/* Header */}
      <div className="border-b border-amber-400/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="text-xs text-amber-400 tracking-widest uppercase font-mono font-bold">
            AI_INSIGHTS
          </span>
        </div>
        <span className="text-[10px] text-[#2a2a2a] font-mono tracking-widest">POWERED BY CLAUDE</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#111] flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-2.5 text-[10px] font-mono tracking-widest uppercase transition-all border-b-2 flex items-center gap-2
              ${activeTab === tab.id
                ? "text-amber-400 border-amber-400 bg-amber-400/3"
                : "text-[#333] border-transparent hover:text-[#666] hover:border-[#2a2a2a]"
              }
            `}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`
                px-1 py-0.5 text-[9px] border
                ${activeTab === tab.id
                  ? "border-amber-400/30 text-amber-400/70 bg-amber-400/5"
                  : "border-[#1e1e1e] text-[#2a2a2a]"
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            {insights.summary ? (
              <div className="flex gap-4">
                <div className="w-px bg-amber-400/20 shrink-0 mt-1" />
                <p className="text-sm text-[#888] leading-relaxed">{insights.summary}</p>
              </div>
            ) : (
              <p className="text-xs text-[#333] font-mono">No summary available.</p>
            )}

            {/* Quick stats row */}
            {insights.missing_fields && insights.missing_fields.length > 0 && (
              <div className="pt-4 border-t border-[#111]">
                <p className="text-[10px] text-[#333] tracking-widest mb-3 uppercase">Missing Fields Detected</p>
                <div className="flex flex-wrap gap-2">
                  {insights.missing_fields.map((f) => (
                    <span key={f} className="border border-yellow-400/20 bg-yellow-400/3 px-2.5 py-1 text-xs text-yellow-400/60 font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ISSUES */}
        {activeTab === "issues" && (
          <div>
            {!insights.issues || insights.issues.length === 0 ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-6 h-6 border border-emerald-400/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-emerald-400/70 font-mono tracking-wider">NO_ISSUES_DETECTED</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {insights.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 border border-red-500/10 bg-red-500/3 group hover:border-red-500/20 transition-colors"
                  >
                    <span className="text-red-400/40 shrink-0 mt-0.5 text-xs">◆</span>
                    <span className="text-xs text-[#888] leading-relaxed">{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        {activeTab === "categories" && (
          <div>
            {!insights.top_categories || Object.keys(insights.top_categories).length === 0 ? (
              <p className="text-xs text-[#333] font-mono py-4">No category data found.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(insights.top_categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-4 group">
                      <div className="w-28 text-xs text-[#555] font-mono truncate shrink-0">{cat}</div>
                      <div className="flex-1 h-px bg-[#111] relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-amber-400/40 group-hover:bg-amber-400/60 transition-colors"
                          style={{ width: `${(count / maxCatCount) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-amber-400/70 font-mono w-10 text-right shrink-0">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div>
            {!insights.recommendations || insights.recommendations.length === 0 ? (
              <p className="text-xs text-[#333] font-mono py-4">No recommendations available.</p>
            ) : (
              <ol className="space-y-3">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-4 p-3 border border-[#111] hover:border-[#1e1e1e] transition-colors group">
                    <span className="text-amber-400/40 font-mono text-xs shrink-0 mt-0.5 font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-[#777] leading-relaxed group-hover:text-[#999] transition-colors">{rec}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
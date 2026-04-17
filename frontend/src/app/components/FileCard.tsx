import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

type FileRecord = {
  id: string;
  originalName: string;
  status: string;
  rowCount: number | null;
  processedCount: number | null;
  errorCount: number | null;
  createdAt: string;
  updatedAt: string;
};

interface FileCardProps {
  file: FileRecord;
  index?: number;
}

function ProgressBar({ processed, total }: { processed: number; total: number }) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-[#444] font-mono mb-1.5">
        <span>PROGRESS</span>
        <span className="text-amber-400/70">{pct}%</span>
      </div>
      <div className="h-px bg-[#1a1a1a] w-full relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-amber-400/60 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function FileCard({ file, index = 0 }: FileCardProps) {
  const successRate =
    file.rowCount && file.processedCount
      ? Math.round((file.processedCount / file.rowCount) * 100)
      : null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      className="border border-[#1a1a1a] bg-[#0c0c0c] hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-all duration-200 group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent line on hover */}
      <div className="h-px w-0 group-hover:w-full bg-amber-400/40 transition-all duration-500" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* File icon */}
            <div className="w-8 h-8 border border-[#1e1e1e] flex items-center justify-center shrink-0 group-hover:border-amber-400/20 transition-colors">
              <svg className="w-3.5 h-3.5 text-[#3a3a3a] group-hover:text-amber-400/40 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-mono truncate leading-tight">{file.originalName}</p>
              <p className="text-[#333] text-xs mt-0.5 font-mono">{timeAgo(file.createdAt)}</p>
            </div>
          </div>
          <StatusBadge status={file.status} size="sm" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-px bg-[#111] mb-4">
          {[
            { label: "ROWS", value: file.rowCount ?? "—", color: "text-white" },
            { label: "OK", value: file.processedCount ?? "—", color: "text-emerald-400" },
            { label: "ERR", value: file.errorCount ?? "—", color: "text-red-400/70" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0c0c0c] px-3 py-2.5 text-center">
              <p className="text-[10px] text-[#333] tracking-widest mb-1">{label}</p>
              <p className={`font-mono text-sm font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar (shown only when processing or completed) */}
        {(file.status === "processing" || file.status === "completed") &&
          file.rowCount && file.processedCount != null && (
            <ProgressBar processed={file.processedCount} total={file.rowCount} />
          )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {successRate !== null && file.status === "completed" && (
              <span className={`text-xs font-mono ${successRate >= 90 ? "text-emerald-400" : successRate >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                {successRate}% success
              </span>
            )}
            {file.status === "processing" && (
              <span className="text-xs text-blue-400/70 font-mono animate-pulse">
                processing...
              </span>
            )}
            {file.status === "failed" && (
              <span className="text-xs text-red-400/70 font-mono">processing failed</span>
            )}
          </div>

          <Link
            href={`/products/${file.id}`}
            className="flex items-center gap-1.5 text-xs text-[#444] hover:text-amber-400 transition-colors font-mono tracking-widest group/link"
          >
            VIEW
            <svg className="w-3 h-3 translate-x-0 group-hover/link:translate-x-0.5 transition-transform"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
type Status = "pending" | "processing" | "completed" | "failed" | "processed" | "error" | "duplicate";

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string; dot?: boolean }> = {
  pending:    { color: "text-yellow-400",  bg: "bg-yellow-400/5",  border: "border-yellow-400/30"  },
  processing: { color: "text-blue-400",    bg: "bg-blue-400/5",    border: "border-blue-400/30", dot: true },
  completed:  { color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/30" },
  failed:     { color: "text-red-400",     bg: "bg-red-400/5",     border: "border-red-400/30"     },
  processed:  { color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
  error:      { color: "text-red-400",     bg: "bg-red-400/5",     border: "border-red-400/20"     },
  duplicate:  { color: "text-orange-400",  bg: "bg-orange-400/5",  border: "border-orange-400/20"  },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function StatusBadge({ status, size = "md", showLabel = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status] ?? {
    color: "text-[#666]",
    bg: "bg-[#111]",
    border: "border-[#2a2a2a]",
  };

  const sizeClass = size === "sm"
    ? "px-1.5 py-0.5 text-[10px]"
    : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border font-mono tracking-widest uppercase
        ${config.color} ${config.bg} ${config.border} ${sizeClass}
      `}
    >
      {config.dot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${config.color.replace("text-", "bg-")} animate-pulse`}
        />
      )}
      {showLabel && status}
    </span>
  );
}
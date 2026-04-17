"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface UploadZoneProps {
  onSuccess?: (fileId: string) => void;
  compact?: boolean;
}

export function UploadZone({ onSuccess, compact = false }: UploadZoneProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Only .csv files are accepted.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 18, 88));
      }, 180);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const data = await res.json();
      setUploadedFileId(data.fileId);
      setState("success");
      onSuccess?.(data.fileId);
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }, [onSuccess]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    setUploadedFileId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const minH = compact ? 200 : 320;

  // ─── Idle / Dragging ───────────────────────────────────────────────
  if (state === "idle" || state === "dragging") {
    return (
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState("idle")}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer border-2 transition-all duration-300 group
          ${state === "dragging"
            ? "border-amber-400 bg-amber-400/5"
            : "border-[#1e1e1e] hover:border-amber-400/40 bg-[#0f0f0f]"
          }
        `}
        style={{ minHeight: minH }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Corner brackets */}
        {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
            <div className={`absolute ${i % 2 === 0 ? "left-0" : "right-0"} top-0 w-5 h-px bg-amber-400/50 transition-all duration-300 ${state === "dragging" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            <div className={`absolute ${i % 2 === 0 ? "left-0" : "right-0"} top-0 w-px h-5 bg-amber-400/50 transition-all duration-300 ${state === "dragging" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none">
          {/* Upload icon */}
          <div className={`
            flex items-center justify-center mb-5 transition-all duration-300
            ${compact ? "w-10 h-10" : "w-14 h-14"}
            border ${state === "dragging" ? "border-amber-400 bg-amber-400/10 scale-110" : "border-[#222] group-hover:border-amber-400/40"}
          `}>
            <svg
              className={`transition-colors duration-300 ${compact ? "w-4 h-4" : "w-5 h-5"} ${state === "dragging" ? "text-amber-400" : "text-[#3a3a3a] group-hover:text-amber-400/50"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <p className={`font-syne font-bold text-white mb-1.5 ${compact ? "text-sm" : "text-lg"}`}>
            {state === "dragging" ? "RELEASE TO UPLOAD" : "DROP CSV FILE HERE"}
          </p>
          <p className="text-xs text-[#3a3a3a] tracking-[0.25em] mb-5">OR CLICK TO BROWSE</p>

          {!compact && (
            <div className="flex items-center gap-4 text-[10px] text-[#2a2a2a] tracking-widest">
              <span>.csv only</span>
              <span className="w-px h-3 bg-[#1e1e1e]" />
              <span>Any columns</span>
              <span className="w-px h-3 bg-[#1e1e1e]" />
              <span>1000+ rows</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Uploading ─────────────────────────────────────────────────────
  if (state === "uploading") {
    return (
      <div
        className="border border-[#1e1e1e] bg-[#0f0f0f] flex flex-col items-center justify-center gap-5 p-10"
        style={{ minHeight: minH }}
      >
        {/* Spinning ring */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border border-[#1e1e1e] rounded-full" />
          <div className="absolute inset-0 border border-amber-400/30 rounded-full border-t-amber-400 animate-spin" />
          <div className="absolute inset-2 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#555] text-xs font-mono truncate max-w-[200px]">{fileName}</span>
            <span className="text-amber-400 text-xs font-mono shrink-0 ml-2">{Math.round(progress)}%</span>
          </div>
          <div className="h-px bg-[#1a1a1a] w-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer */}
            <div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent transition-all duration-200"
              style={{ left: `calc(${progress}% - 16px)` }}
            />
          </div>
        </div>
        <p className="text-[#333] text-xs tracking-[0.3em] font-mono animate-pulse">UPLOADING...</p>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div
        className="border border-red-500/30 bg-red-500/3 flex flex-col items-center justify-center gap-4 p-10"
        style={{ minHeight: minH }}
      >
        <div className="w-10 h-10 border border-red-500/40 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-red-400 text-xs font-mono tracking-widest mb-1">UPLOAD_FAILED</p>
          <p className="text-[#555] text-xs">{errorMsg}</p>
        </div>
        <button
          onClick={reset}
          className="px-5 py-2 border border-[#2a2a2a] text-xs text-[#666] hover:border-amber-400 hover:text-amber-400 transition-all tracking-widest font-mono"
        >
          TRY_AGAIN
        </button>
      </div>
    );
  }

  // ─── Success ───────────────────────────────────────────────────────
  return (
    <div
      className="border border-amber-400/25 bg-amber-400/3 flex flex-col items-center justify-center gap-5 p-10"
      style={{ minHeight: minH }}
    >
      <div className="w-10 h-10 border border-amber-400/50 flex items-center justify-center relative">
        <div className="absolute inset-0 border border-amber-400/20 scale-110 animate-ping" />
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-syne font-bold text-white text-sm mb-1">FILE_QUEUED</p>
        <p className="text-[#444] text-xs font-mono">{fileName}</p>
        <p className="text-[#333] text-xs mt-1">Python worker is processing asynchronously</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/products/${uploadedFileId}`)}
          className="px-5 py-2 bg-amber-400 text-black text-xs font-bold tracking-widest hover:bg-amber-300 transition-colors font-mono"
        >
          VIEW_RESULTS →
        </button>
        <button
          onClick={reset}
          className="px-5 py-2 border border-[#2a2a2a] text-xs text-[#555] hover:border-[#3a3a3a] hover:text-[#888] transition-all font-mono"
        >
          UPLOAD_MORE
        </button>
      </div>
    </div>
  );
}
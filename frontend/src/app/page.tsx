"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export default function UploadPage() {
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
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 15, 85));
      }, 200);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setUploadedFileId(data.fileId);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setState("dragging"); };
  const onDragLeave = () => setState("idle");

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    setUploadedFileId("");
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-[#1e1e1e]" />
          <span className="text-xs tracking-[0.3em] text-[#444] uppercase">v1.0 · Product Pipeline</span>
          <div className="h-px flex-1 bg-[#1e1e1e]" />
        </div>
        <h1 className="font-syne text-5xl font-extrabold text-white leading-none tracking-tight">
          UPLOAD<br />
          <span className="text-amber-400">DATASET</span>
        </h1>
        <p className="mt-4 text-[#555] text-sm max-w-md leading-relaxed">
          Drop any product CSV — the system auto-detects columns, cleans the data,
          and generates AI insights asynchronously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Drop zone — takes 3/5 */}
        <div className="lg:col-span-3">
          {state === "idle" || state === "dragging" || state === "error" ? (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer border-2 transition-all duration-300 group
                ${state === "dragging"
                  ? "border-amber-400 bg-amber-400/5 animate-pulse-border"
                  : state === "error"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[#1e1e1e] hover:border-amber-400/40 bg-[#0f0f0f]"
                }
              `}
              style={{ minHeight: 320 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {/* Corner accents */}
              {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4`}>
                  <div className={`absolute ${i % 2 === 0 ? "left-0" : "right-0"} top-0 w-4 h-px bg-amber-400/60`} />
                  <div className={`absolute ${i % 2 === 0 ? "left-0" : "right-0"} top-0 w-px h-4 bg-amber-400/60`} />
                </div>
              ))}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                {state === "error" ? (
                  <>
                    <div className="w-12 h-12 border border-red-500/50 flex items-center justify-center mb-5">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-400 text-sm font-mono mb-2">UPLOAD_ERROR</p>
                    <p className="text-[#555] text-xs text-center mb-6">{errorMsg}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="px-5 py-2 border border-[#2a2a2a] text-xs text-[#888] hover:border-amber-400 hover:text-amber-400 transition-all"
                    >
                      TRY_AGAIN
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 border flex items-center justify-center mb-6 transition-all duration-300
                      ${state === "dragging" ? "border-amber-400 bg-amber-400/10 scale-110" : "border-[#2a2a2a] group-hover:border-amber-400/50"}`}>
                      <svg className={`w-6 h-6 transition-colors ${state === "dragging" ? "text-amber-400" : "text-[#444] group-hover:text-amber-400/60"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="font-syne text-lg font-semibold text-white mb-2">
                      {state === "dragging" ? "RELEASE TO UPLOAD" : "DROP CSV FILE HERE"}
                    </p>
                    <p className="text-xs text-[#444] mb-6 tracking-widest">OR CLICK TO BROWSE</p>
                    <div className="flex items-center gap-4 text-xs text-[#333]">
                      <span>.csv only</span>
                      <span className="w-px h-3 bg-[#2a2a2a]" />
                      <span>Any column structure</span>
                      <span className="w-px h-3 bg-[#2a2a2a]" />
                      <span>1000+ rows supported</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : state === "uploading" ? (
            <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-10" style={{ minHeight: 320 }}>
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-12 h-12 border border-amber-400/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-amber-400 animate-ping opacity-20" />
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#555] truncate max-w-[180px]">{fileName}</span>
                    <span className="text-amber-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-px bg-[#1e1e1e] w-full relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#444] tracking-widest animate-pulse">UPLOADING_FILE...</p>
              </div>
            </div>
          ) : (
            // Success
            <div className="border border-amber-400/30 bg-amber-400/5 p-10" style={{ minHeight: 320 }}>
              <div className="flex flex-col items-center justify-center h-full gap-5">
                <div className="w-12 h-12 border border-amber-400 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-syne font-bold text-white mb-1">FILE_QUEUED</p>
                  <p className="text-xs text-[#555]">{fileName}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/products/${uploadedFileId}`)}
                    className="px-5 py-2 bg-amber-400 text-black text-xs font-bold tracking-widest hover:bg-amber-300 transition-colors"
                  >
                    VIEW_RESULTS →
                  </button>
                  <button
                    onClick={reset}
                    className="px-5 py-2 border border-[#2a2a2a] text-xs text-[#666] hover:border-[#444] transition-colors"
                  >
                    UPLOAD_MORE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info panel — takes 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {[
            { step: "01", title: "AUTO-DETECT", desc: "Headers and types are inferred automatically from your CSV structure." },
            { step: "02", title: "ASYNC PROCESS", desc: "Python worker cleans names, normalizes prices, deduplicates rows, and generates slugs." },
            { step: "03", title: "AI INSIGHTS", desc: "Claude analyzes your dataset for anomalies, missing fields, and patterns." },
            { step: "04", title: "LIVE RESULTS", desc: "View processed products and insights in real time as they complete." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="border border-[#1a1a1a] bg-[#0c0c0c] p-5 flex gap-4 group hover:border-[#2a2a2a] transition-colors">
              <span className="text-amber-400/40 font-mono text-xs font-bold mt-0.5 shrink-0">{step}</span>
              <div>
                <p className="text-xs font-bold tracking-widest text-white mb-1">{title}</p>
                <p className="text-xs text-[#444] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, string> = {
  pending:    "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  processing: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  completed:  "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  failed:     "text-red-400 border-red-400/30 bg-red-400/5",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`border px-2 py-0.5 text-xs font-mono tracking-widest uppercase ${STATUS_STYLES[status] ?? "text-[#666] border-[#2a2a2a]"}`}>
      {status === "processing" && <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    if (res.ok) setFiles(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.3em] text-[#444] uppercase mb-3">Pipeline</p>
          <h1 className="font-syne text-4xl font-extrabold text-white leading-none">
            UPLOADED <span className="text-amber-400">FILES</span>
          </h1>
        </div>
        <Link href="/"
          className="px-5 py-2.5 border border-[#1e1e1e] text-xs text-[#666] hover:border-amber-400 hover:text-amber-400 transition-all tracking-widest">
          + NEW_UPLOAD
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#444] text-xs py-20">
          <div className="w-4 h-4 border border-[#2a2a2a] border-t-amber-400 rounded-full animate-spin" />
          LOADING_FILES...
        </div>
      ) : files.length === 0 ? (
        <div className="border border-[#1a1a1a] p-20 text-center">
          <p className="text-[#333] font-syne text-2xl font-bold mb-3">NO_FILES_YET</p>
          <p className="text-xs text-[#444]">Upload a CSV to get started.</p>
        </div>
      ) : (
        <div className="border border-[#1a1a1a]">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a1a1a] text-xs text-[#3a3a3a] tracking-widest uppercase">
            <span className="col-span-4">File Name</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Rows</span>
            <span className="col-span-2">Processed</span>
            <span className="col-span-1">Errors</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {files.map((file, i) => (
            <div
              key={file.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm border-b border-[#0f0f0f] last:border-0 hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? "" : "bg-[#0c0c0c]"}`}
            >
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 border border-[#1e1e1e] flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs truncate font-mono">{file.originalName}</p>
                  <p className="text-[#333] text-xs mt-0.5">{new Date(file.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="col-span-2"><StatusBadge status={file.status} /></div>

              <div className="col-span-2 text-[#666] font-mono text-xs">
                {file.rowCount ?? "—"}
              </div>
              <div className="col-span-2 text-emerald-400/70 font-mono text-xs">
                {file.processedCount ?? "—"}
              </div>
              <div className="col-span-1 text-red-400/70 font-mono text-xs">
                {file.errorCount ?? "—"}
              </div>

              <div className="col-span-1 text-right">
                <Link
                  href={`/products/${file.id}`}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors tracking-wider"
                >
                  VIEW →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
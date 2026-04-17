"use client";



import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FileRecord = {
  id: string;
  originalName: string;
  status: string;
  rowCount: number | null;
  processedCount: number | null;
  errorCount: number | null;
  insights: string | null;
  createdAt: string;
};

type Product = {
  id: string;
  rawData: Record<string, unknown>;
  name: string | null;
  slug: string | null;
  price: number | null;
  status: string;
  errorMessage: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending:    "text-yellow-400",
  processing: "text-blue-400",
  completed:  "text-emerald-400",
  failed:     "text-red-400",
};

export default function ProductsPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const [fileRes, prodRes] = await Promise.all([
      fetch(`/api/files/${fileId}`),
      fetch(`/api/products/${fileId}?page=${page}&limit=25`),
    ]);
    if (fileRes.ok) setFile(await fileRes.json());
    if (prodRes.ok) {
      const data = await prodRes.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fileId, page]);

  const columns = products.length > 0 ? Object.keys(products[0].rawData) : [];

  const parseInsights = (raw: string | null) => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return { summary: raw }; }
  };

  const insights = parseInsights(file?.insights ?? null);

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] text-[#444] uppercase mb-3">Results</p>
          <h1 className="font-syne text-4xl font-extrabold text-white leading-none mb-2">
            <span className="text-amber-400">PRODUCTS</span>
          </h1>
          {file && (
            <p className="text-xs text-[#555] font-mono">{file.originalName}</p>
          )}
        </div>
        {file && (
          <div className={`border px-3 py-1.5 text-xs font-mono tracking-widest uppercase ${STATUS_COLORS[file.status] ?? "text-[#666]"} border-current/30 bg-current/5`}>
            {file.status === "processing" && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />}
            {file.status}
          </div>
        )}
      </div>

      {/* Stats bar */}
      {file && (
        <div className="grid grid-cols-4 gap-px bg-[#1a1a1a]">
          {[
            { label: "TOTAL_ROWS", value: file.rowCount ?? "—", color: "text-white" },
            { label: "PROCESSED", value: file.processedCount ?? "—", color: "text-emerald-400" },
            { label: "ERRORS", value: file.errorCount ?? "—", color: "text-red-400" },
            { label: "SUCCESS_RATE", value: file.rowCount ? `${Math.round(((file.processedCount ?? 0) / file.rowCount) * 100)}%` : "—", color: "text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0c0c0c] px-6 py-5">
              <p className="text-xs text-[#333] tracking-widest mb-2">{label}</p>
              <p className={`font-syne text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="border border-amber-400/20 bg-amber-400/3">
          <div className="border-b border-amber-400/10 px-6 py-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-xs text-amber-400 tracking-widest uppercase font-bold">AI_INSIGHTS</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.summary && (
              <div>
                <p className="text-xs text-[#444] tracking-widest mb-2 uppercase">Summary</p>
                <p className="text-sm text-[#aaa] leading-relaxed">{insights.summary}</p>
              </div>
            )}
            {insights.issues && insights.issues.length > 0 && (
              <div>
                <p className="text-xs text-[#444] tracking-widest mb-2 uppercase">Issues Detected</p>
                <ul className="space-y-1">
                  {insights.issues.map((issue: string, i: number) => (
                    <li key={i} className="text-xs text-red-400/80 flex gap-2">
                      <span className="text-red-400/40">◆</span>{issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insights.top_categories && (
              <div>
                <p className="text-xs text-[#444] tracking-widest mb-2 uppercase">Top Categories</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(insights.top_categories as Record<string, number>).map(([cat, count]) => (
                    <span key={cat} className="border border-[#2a2a2a] px-2 py-0.5 text-xs text-[#666]">
                      {cat} <span className="text-amber-400">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {insights.missing_fields && insights.missing_fields.length > 0 && (
              <div>
                <p className="text-xs text-[#444] tracking-widest mb-2 uppercase">Missing Fields</p>
                <div className="flex flex-wrap gap-2">
                  {insights.missing_fields.map((f: string) => (
                    <span key={f} className="border border-yellow-400/20 bg-yellow-400/5 px-2 py-0.5 text-xs text-yellow-400/70">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#444] tracking-widest uppercase">Product Records</p>
          <p className="text-xs text-[#333] font-mono">Page {page} / {totalPages}</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-[#444] text-xs py-20">
            <div className="w-4 h-4 border border-[#2a2a2a] border-t-amber-400 rounded-full animate-spin" />
            LOADING_PRODUCTS...
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#1a1a1a] p-16 text-center">
            <p className="text-[#333] font-syne font-bold text-xl mb-2">
              {file?.status === "pending" || file?.status === "processing"
                ? "PROCESSING_IN_PROGRESS..."
                : "NO_PRODUCTS_FOUND"}
            </p>
            <p className="text-xs text-[#333]">
              {file?.status === "processing" && "This page auto-refreshes every 5 seconds."}
            </p>
          </div>
        ) : (
          <>
            <div className="border border-[#1a1a1a] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left px-4 py-3 text-[#333] tracking-widest uppercase font-normal whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-3 text-[#333] tracking-widest uppercase font-normal whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 text-[#333] tracking-widest uppercase font-normal whitespace-nowrap">Slug</th>
                    <th className="text-left px-4 py-3 text-[#333] tracking-widest uppercase font-normal whitespace-nowrap">Price</th>
                    {columns.filter(c => !["name", "slug", "price"].includes(c.toLowerCase())).slice(0, 4).map(col => (
                      <th key={col} className="text-left px-4 py-3 text-[#333] tracking-widest uppercase font-normal whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr key={product.id}
                      className={`border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? "" : "bg-[#0c0c0c]"}`}>
                      <td className="px-4 py-3">
                        <span className={`${STATUS_COLORS[product.status] ?? "text-[#666]"} tracking-widest`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white max-w-[200px] truncate">{product.name ?? "—"}</td>
                      <td className="px-4 py-3 text-[#555] max-w-[180px] truncate font-mono">{product.slug ?? "—"}</td>
                      <td className="px-4 py-3 text-amber-400/80 font-mono">
                        {product.price != null ? `$${product.price.toFixed(2)}` : "—"}
                      </td>
                      {columns.filter(c => !["name", "slug", "price"].includes(c.toLowerCase())).slice(0, 4).map(col => (
                        <td key={col} className="px-4 py-3 text-[#555] max-w-[150px] truncate">
                          {String(product.rawData[col] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#1e1e1e] text-xs text-[#555] hover:border-amber-400 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed tracking-widest"
              >
                ← PREV
              </button>
              <span className="text-xs text-[#333] font-mono">{page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#1e1e1e] text-xs text-[#555] hover:border-amber-400 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed tracking-widest"
              >
                NEXT →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
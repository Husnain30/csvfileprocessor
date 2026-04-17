"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

type Product = {
  id: string;
  rawData: Record<string, unknown>;
  name: string | null;
  slug: string | null;
  price: number | null;
  category: string | null;
  sku: string | null;
  status: string;
  errorMessage: string | null;
};

interface ProductTableProps {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const CORE_COLS = ["name", "slug", "price", "category", "sku"];

export function ProductTable({
  products,
  page,
  totalPages,
  total,
  onPageChange,
  loading = false,
}: ProductTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Extra raw columns beyond core ones
  const extraCols = products.length > 0
    ? Object.keys(products[0].rawData).filter(
        (k) => !CORE_COLS.includes(k.toLowerCase())
      ).slice(0, 3)
    : [];

  const filtered = search.trim()
    ? products.filter((p) =>
        [p.name, p.slug, p.category, p.sku]
          .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : products;

  if (loading) {
    return (
      <div className="border border-[#1a1a1a] bg-[#0c0c0c]">
        {/* Skeleton rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-6 py-4 border-b border-[#0f0f0f] animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-3 w-16 bg-[#1a1a1a] rounded-none" />
            <div className="h-3 w-40 bg-[#1a1a1a] rounded-none" />
            <div className="h-3 w-32 bg-[#1a1a1a] rounded-none" />
            <div className="h-3 w-20 bg-[#1a1a1a] rounded-none" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-[#1a1a1a] bg-[#0c0c0c] py-20 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border border-[#1e1e1e] flex items-center justify-center">
          <svg className="w-4 h-4 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-[#2a2a2a] font-syne font-bold tracking-widest">NO_PRODUCTS_YET</p>
        <p className="text-[#222] text-xs">Worker is processing or no rows were found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table controls */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#333]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH_PRODUCTS..."
            className="bg-[#0c0c0c] border border-[#1a1a1a] text-[#888] placeholder-[#2a2a2a] text-xs font-mono pl-8 pr-4 py-2 focus:outline-none focus:border-amber-400/30 w-64 tracking-wider"
          />
        </div>
        <p className="text-xs text-[#333] font-mono shrink-0">
          {total.toLocaleString()} records · page {page}/{totalPages}
        </p>
      </div>

      {/* Table */}
      <div className="border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["STATUS", "NAME", "PRICE", "CATEGORY", "SKU", "SLUG", ...extraCols.map(c => c.toUpperCase()), ""].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[#2a2a2a] tracking-widest uppercase font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, i) => (
              <>
                <tr
                  key={product.id}
                  onClick={() => setExpandedRow(expandedRow === product.id ? null : product.id)}
                  className={`
                    border-b border-[#0d0d0d] cursor-pointer transition-colors
                    ${i % 2 === 0 ? "bg-transparent" : "bg-[#0b0b0b]"}
                    ${expandedRow === product.id ? "bg-amber-400/3 border-amber-400/10" : "hover:bg-[#0f0f0f]"}
                  `}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={product.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-white max-w-[180px]">
                    <span className="truncate block">{product.name ?? <span className="text-[#2a2a2a]">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.price != null
                      ? <span className="text-amber-400/80">${product.price.toFixed(2)}</span>
                      : <span className="text-[#2a2a2a]">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 max-w-[120px]">
                    <span className="text-[#666] truncate block">{product.category ?? <span className="text-[#2a2a2a]">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[120px]">
                    <span className="text-[#555] truncate block">{product.sku ?? <span className="text-[#2a2a2a]">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="text-[#444] truncate block">{product.slug ?? <span className="text-[#2a2a2a]">—</span>}</span>
                  </td>
                  {extraCols.map((col) => (
                    <td key={col} className="px-4 py-3 max-w-[120px]">
                      <span className="text-[#444] truncate block">
                        {String(product.rawData[col] ?? "—")}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <svg
                      className={`w-3 h-3 text-[#333] inline transition-transform duration-200 ${expandedRow === product.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                </tr>

                {/* Expanded raw data row */}
                {expandedRow === product.id && (
                  <tr key={`${product.id}-expanded`} className="border-b border-amber-400/10 bg-amber-400/3">
                    <td colSpan={7 + extraCols.length} className="px-6 py-4">
                      {product.status === "error" && product.errorMessage && (
                        <div className="mb-3 flex items-start gap-2 text-red-400/80">
                          <span className="text-red-400/40 shrink-0">◆</span>
                          <span className="text-xs">{product.errorMessage}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-[#333] tracking-widest mb-2 uppercase">Raw CSV Data</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Object.entries(product.rawData).map(([k, v]) => (
                          <div key={k} className="bg-[#0c0c0c] border border-[#111] px-3 py-2">
                            <p className="text-[9px] text-[#333] tracking-widest uppercase mb-0.5">{k}</p>
                            <p className="text-xs text-[#777] truncate">{String(v) || <span className="text-[#222]">empty</span>}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="w-8 h-8 border border-[#1a1a1a] text-[#444] hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 h-8 border border-[#1a1a1a] text-xs text-[#444] hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed tracking-widest"
          >
            PREV
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 border text-xs transition-all ${
                  p === page
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                    : "border-[#1a1a1a] text-[#444] hover:border-[#2a2a2a] hover:text-[#888]"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 h-8 border border-[#1a1a1a] text-xs text-[#444] hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed tracking-widest"
          >
            NEXT
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="w-8 h-8 border border-[#1a1a1a] text-[#444] hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#2a2a2a] font-mono">
          {((page - 1) * 25) + 1}–{Math.min(page * 25, total)} of {total.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
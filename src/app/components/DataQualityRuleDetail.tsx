import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  EvidenceResultFilter,
  fetchQualityRuleEvidence,
  QualityRuleEvidence,
} from "../DashboardDataContext";
import { StatusBadge } from "./DataQuality";

const PAGE_SIZE = 20;

interface DataQualityRuleDetailProps {
  ruleKey: string;
  onBack: () => void;
}

export function DataQualityRuleDetail({ ruleKey, onBack }: DataQualityRuleDetailProps) {
  const [filter, setFilter] = useState<EvidenceResultFilter>("all");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<QualityRuleEvidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchQualityRuleEvidence(ruleKey, filter, offset, PAGE_SIZE, controller.signal)
      .then(setData)
      .catch(requestError => {
        if (requestError instanceof Error && requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ruleKey, filter, offset, reloadKey]);

  const selectFilter = (nextFilter: EvidenceResultFilter) => {
    setFilter(nextFilter);
    setOffset(0);
  };

  if (!data && loading) {
    return (
      <div className="h-64 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Memuat bukti pemeriksaan…</span>
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-[900px] mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 mb-5">
          <ArrowLeft className="w-4 h-4" /> Kembali ke matriks
        </button>
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="font-medium text-slate-900 dark:text-slate-100">Bukti pemeriksaan tidak dapat dimuat</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          <button onClick={() => setReloadKey(value => value + 1)} className="mt-4 px-4 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-sm">Coba lagi</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { rule } = data;
  const status = rule.failed ? rule.severity : "healthy";
  const pageStart = data.filteredTotal ? data.offset + 1 : 0;
  const pageEnd = Math.min(data.offset + data.evidence.length, data.filteredTotal);
  const hasPrevious = data.offset > 0;
  const hasNext = data.offset + data.limit < data.filteredTotal;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Matriks Pemeriksaan
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md px-2 py-1">{rule.dimensionLabel}</span>
              <StatusBadge status={status} />
            </div>
            <h1 className="text-slate-900 dark:text-slate-100">Bukti: {rule.label}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">{rule.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Skor Aturan", value: rule.score.toFixed(1), color: rule.score >= 85 ? "text-emerald-600" : rule.score >= 70 ? "text-amber-600" : "text-red-600" },
          { label: "Lulus", value: rule.passed.toLocaleString("id-ID"), color: "text-emerald-600" },
          { label: "Gagal", value: rule.failed.toLocaleString("id-ID"), color: rule.failed ? "text-red-600" : "text-emerald-600" },
          { label: "Bobot Skor", value: `${rule.weight}%`, color: "text-blue-600" },
        ].map(metric => (
          <div key={metric.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</p>
            <p className={`text-2xl font-semibold tabular-nums mt-1 ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-slate-900 dark:text-slate-100">Cara Pemeriksaan</h3>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kondisi yang diharapkan</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{rule.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tindakan korektif</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{rule.recommendation}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Formula</p>
          <p className="font-mono text-sm mt-3">Skor = Lulus ÷ Diperiksa × 100</p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
            {rule.applicable ? `${rule.passed} ÷ ${rule.applicable} × 100 = ${rule.score.toFixed(1)}` : "Tidak ada data yang dapat diperiksa"}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-slate-900 dark:text-slate-100">Evidence Pemeriksaan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nilai aktual yang digunakan backend untuk menentukan hasil setiap entitas.</p>
          </div>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
            {([
              ["all", `Semua (${data.total})`],
              ["failed", `Gagal (${rule.failed})`],
              ["passed", `Lulus (${rule.passed})`],
            ] as [EvidenceResultFilter, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => selectFilter(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === value ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="overflow-x-auto relative">
          {loading && <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>}
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Hasil</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Artikel / Sumber</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Nilai Aktual</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Kondisi Diharapkan</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Alasan</th>
              </tr>
            </thead>
            <tbody>
              {data.evidence.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 align-top hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${item.result === "passed" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
                      {item.result === "passed" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.result === "passed" ? "Lulus" : "Gagal"}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex items-start gap-2">
                      {item.entityType === "source" && <Database className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 break-words">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.source}</p>
                        {(item.publishedDate || item.crawlDate) && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Publikasi: {item.publishedDate || "—"} · Crawl: {item.crawlDate || "—"}</p>}
                        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">Buka artikel <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 break-words max-w-xs">{item.observedValue}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 break-words max-w-xs">{item.expectedValue}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!data.evidence.length && (
          <div className="px-5 py-12 text-center">
            <Database className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-3">Tidak ada evidence pada filter ini</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih filter lain untuk melihat hasil pemeriksaan.</p>
          </div>
        )}

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Menampilkan {pageStart}–{pageEnd} dari {data.filteredTotal}</p>
          <div className="flex items-center gap-2">
            <button disabled={!hasPrevious || loading} onClick={() => setOffset(value => Math.max(0, value - PAGE_SIZE))} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
            </button>
            <button disabled={!hasNext || loading} onClick={() => setOffset(value => value + PAGE_SIZE)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 disabled:opacity-40">
              Berikutnya <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

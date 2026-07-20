import { AlertTriangle, CheckCircle, ChevronRight, Download, RefreshCw, XCircle } from "lucide-react";
import { exportArticlesCsv, QualityStatus, useDashboardData } from "../DashboardDataContext";

type StatusLevel = QualityStatus;

const statusConfig: Record<StatusLevel, { icon: React.ElementType; label: string; bg: string; text: string; border: string; bar: string }> = {
  excellent: {
    icon: CheckCircle,
    label: "Sangat Baik",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    bar: "bg-emerald-500",
  },
  healthy: {
    icon: CheckCircle,
    label: "Sehat",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    bar: "bg-green-500",
  },
  warning: {
    icon: AlertTriangle,
    label: "Perlu Perhatian",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    bar: "bg-amber-500",
  },
  critical: {
    icon: XCircle,
    label: "Kritis",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    bar: "bg-red-500",
  },
};

export function StatusBadge({ status }: { status: StatusLevel }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 95 ? "#10b981" : score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444";
  const safeScore = Math.max(0, Math.min(score, 100));
  return (
    <div className="w-full max-w-[280px] mx-auto">
      <svg className="block w-full h-auto" viewBox="0 0 260 158" role="img" aria-label={`Skor kualitas data ${safeScore.toFixed(1)} dari 100`}>
        <path
          d="M 30 126 A 100 100 0 0 1 230 126"
          fill="none"
          strokeWidth={16}
          strokeLinecap="round"
          className="stroke-slate-200 dark:stroke-slate-700"
          pathLength={100}
        />
        <path
          d="M 30 126 A 100 100 0 0 1 230 126"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${safeScore} ${100 - safeScore}`}
          style={{ transition: "stroke-dasharray 700ms ease, stroke 300ms ease" }}
        />
        <text x={130} y={100} textAnchor="middle" fontSize={36} fontWeight={700} fill={color} fontFamily="Inter, sans-serif">{safeScore.toFixed(1)}</text>
        <text x={130} y={123} textAnchor="middle" fontSize={13} fontWeight={500} className="fill-slate-400 dark:fill-slate-500" fontFamily="Inter, sans-serif">dari 100</text>
        <text x={22} y={153} textAnchor="middle" fontSize={10} className="fill-slate-400 dark:fill-slate-500" fontFamily="Inter, sans-serif">0</text>
        <text x={238} y={153} textAnchor="middle" fontSize={10} className="fill-slate-400 dark:fill-slate-500" fontFamily="Inter, sans-serif">100</text>
      </svg>
      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400" aria-label="Ambang status skor">
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />&lt;70</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />70–84</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />85–94</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />≥95</span>
      </div>
    </div>
  );
}

export function DataQuality({ onSelectRule }: { onSelectRule: (ruleKey: string) => void }) {
  const { data, loading, refresh } = useDashboardData();
  const { dataQualityMetrics, articles } = data;
  const { overallScore, overallStatus, dimensions, rules, crawlIssues, lastCrawl, sources } = dataQualityMetrics;
  const parsedLastCrawl = new Date(lastCrawl.replace(" ", "T"));
  const lastCrawlDate = Number.isNaN(parsedLastCrawl.getTime())
    ? "Belum tersedia"
    : parsedLastCrawl.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const failedRules = rules
    .filter(rule => rule.failed > 0)
    .sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1) || b.weight - a.weight);
  const hasData = articles.length > 0;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-slate-100">Kualitas Data</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Penilaian terukur atas kelengkapan, validitas, keunikan, ketepatan waktu, dan konsistensi data.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={() => void refresh()} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={() => exportArticlesCsv(articles)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors">
            <Download className="w-4 h-4" />
            Export laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center">
          <h3 className="text-slate-900 dark:text-slate-100 self-start">Skor Kualitas Data</h3>
          <ScoreGauge score={overallScore} />
          <div className="mt-2"><StatusBadge status={overallStatus} /></div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 text-center">Rata-rata tertimbang dari {rules.length} aturan berdasarkan persentase data yang lolos.</p>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: "Crawl Terakhir Berhasil", value: lastCrawlDate },
            { label: "Sumber Sehat", value: `${sources.filter(source => source.status === "healthy").length} / ${sources.length}` },
            { label: "Total Artikel Terindeks", value: articles.length.toLocaleString("id-ID") },
            { label: "Sumber Bermasalah", value: `${crawlIssues} sumber` },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-slate-100">Dimensi Penilaian</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bobot seluruh dimensi berjumlah 100%.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {dimensions.map(dimension => {
            const cfg = statusConfig[dimension.status];
            return (
              <div key={dimension.key} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bobot {dimension.weight}%</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{dimension.label}</p>
                  </div>
                  <span className={`text-lg font-semibold tabular-nums ${cfg.text}`}>{dimension.score.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.max(0, Math.min(dimension.score, 100))}%` }} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{dimension.issues ? `${dimension.issues} kegagalan pemeriksaan` : "Tidak ada kegagalan"}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Isu yang Terdeteksi</h3>
        {!hasData ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <XCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Belum ada data untuk dinilai</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Jalankan crawler terlebih dahulu agar matriks kualitas dapat dihitung.</p>
            </div>
          </div>
        ) : failedRules.length ? (
          <div className="space-y-3">
            {failedRules.map(rule => {
              const cfg = statusConfig[rule.severity];
              const Icon = cfg.icon;
              return (
                <div key={rule.key} className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className={`text-sm font-medium ${cfg.text}`}>{rule.label}</span>
                      <StatusBadge status={rule.severity} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rule.recommendation}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Skor aturan {rule.score.toFixed(1)} · bobot {rule.weight}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-lg font-semibold tabular-nums ${cfg.text}`}>{rule.failed}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">dari {rule.applicable}</p>
                    <button onClick={() => onSelectRule(rule.key)} className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2">
                      Lihat bukti <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Semua pemeriksaan lulus</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Tidak ada isu kualitas pada data yang sedang terindeks.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-slate-100">Matriks Pemeriksaan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rincian seluruh aturan yang membentuk skor kualitas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Aturan</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Dimensi</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Lulus</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Gagal</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Skor</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Bobot</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => {
                const status: StatusLevel = rule.failed ? rule.severity : "healthy";
                return (
                  <tr key={rule.key} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{rule.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">{rule.description}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300 capitalize">{dimensions.find(dimension => dimension.key === rule.dimension)?.label || rule.dimension}</td>
                    <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 text-right">{rule.applicable ? rule.passed : "N/A"}</td>
                    <td className="px-5 py-3 text-xs tabular-nums text-right">{rule.failed ? <span className="font-medium text-red-600 dark:text-red-400">{rule.failed}</span> : <span className="text-emerald-600 dark:text-emerald-400">0</span>}</td>
                    <td className="px-5 py-3 text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200 text-right">{rule.score.toFixed(1)}</td>
                    <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 text-right">{rule.weight}%</td>
                    <td className="px-5 py-3"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => onSelectRule(rule.key)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                        Lihat bukti <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-slate-100">Status per Sumber</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Crawl dinilai terhadap waktu saat ini, bukan terhadap crawl terbaru dalam dataset.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Sumber</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Crawl Terakhir</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Artikel</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Isu Metadata</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(source => (
                <tr key={source.name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 text-sm">{source.name}</td>
                  <td className="px-5 py-3"><StatusBadge status={source.status} /></td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{source.lastCrawl}</td>
                  <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 text-right">{source.articles.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-right">{source.issues ? <span className="text-xs font-medium text-red-600 dark:text-red-400">{source.issues}</span> : <span className="text-xs text-emerald-600 dark:text-emerald-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Rekomendasi Tindakan Korektif</h3>
        <div className="space-y-3">
          {failedRules.length ? failedRules.slice(0, 5).map(rule => {
            const cfg = statusConfig[rule.severity];
            const Icon = cfg.icon;
            return (
              <div key={rule.key} className="flex items-start gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.text}`} />
                <div>
                  <span className={`text-xs font-semibold ${cfg.text}`}>{rule.severity === "critical" ? "Prioritas Tinggi" : "Prioritas Sedang"} · </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{rule.recommendation}</span>
                </div>
              </div>
            );
          }) : (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Tidak ada tindakan korektif yang diperlukan saat ini.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

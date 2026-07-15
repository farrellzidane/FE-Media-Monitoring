import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, Clock } from "lucide-react";
import { exportArticlesCsv, useDashboardData } from "../DashboardDataContext";

type StatusLevel = "healthy" | "warning" | "critical";

const statusConfig: Record<StatusLevel, { icon: React.ElementType; label: string; bg: string; text: string; border: string }> = {
  healthy: {
    icon: CheckCircle,
    label: "Sehat",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  warning: {
    icon: AlertTriangle,
    label: "Perlu Perhatian",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  critical: {
    icon: XCircle,
    label: "Kritis",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

function StatusBadge({ status }: { status: StatusLevel }) {
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
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75;
  const gap = circ * 0.75 - dash;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={180} height={130} viewBox="0 0 180 130">
        <circle cx={90} cy={110} r={r} fill="none" stroke="#e2e8f0" strokeWidth={12} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={circ * 0.375} strokeLinecap="round" />
        <circle cx={90} cy={110} r={r} fill="none" stroke={color} strokeWidth={12} strokeDasharray={`${dash} ${gap + circ * 0.25}`} strokeDashoffset={circ * 0.375} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={90} y={105} textAnchor="middle" fontSize={28} fontWeight={600} fill={color} fontFamily="Inter, sans-serif">{score.toFixed(1)}</text>
        <text x={90} y={125} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="Inter, sans-serif">dari 100</text>
      </svg>
    </div>
  );
}

export function DataQuality() {
  const { data, loading, refresh } = useDashboardData();
  const { dataQualityMetrics, articles } = data;
  const { overallScore, missingDates, duplicates, staleArticles, crawlIssues, lastCrawl, sources } = dataQualityMetrics;
  const parsedLastCrawl = new Date(lastCrawl.replace(" ", "T"));
  const lastCrawlDate = Number.isNaN(parsedLastCrawl.getTime()) ? "Belum tersedia" : parsedLastCrawl.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const overallStatus: StatusLevel = overallScore >= 90 ? "healthy" : overallScore >= 75 ? "warning" : "critical";

  const issues = [
    { label: "Tanggal Publikasi Hilang", value: missingDates, status: "warning" as StatusLevel, action: "Isi tanggal yang hilang dari metadata artikel" },
    { label: "Duplikasi Headline", value: duplicates, status: "warning" as StatusLevel, action: "Tinjau dan hapus duplikasi konten" },
    { label: "Artikel Lama", value: staleArticles, status: staleArticles ? "warning" as StatusLevel : "healthy" as StatusLevel, action: "Tinjau atau arsipkan artikel lama" },
    { label: "Sumber dengan Masalah Crawl", value: crawlIssues, status: crawlIssues ? "critical" as StatusLevel : "healthy" as StatusLevel, action: "Periksa koneksi dan penjadwal crawler" },
  ];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-slate-100">Kualitas Data</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor kesehatan data, masalah crawl, dan rekomendasi perbaikan.</p>
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

      {/* Overall score + last crawl */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score gauge */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center">
          <h3 className="text-slate-900 dark:text-slate-100 mb-2 self-start">Skor Kualitas Data</h3>
          <ScoreGauge score={overallScore} />
          <StatusBadge status={overallStatus} />
          <p className="text-xs text-slate-400 mt-2 text-center">Skor dihitung oleh backend dari kelengkapan tanggal, judul, duplikasi, dan usia artikel.</p>
        </div>

        {/* Last crawl + stat */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: "Crawl Terakhir Berhasil", value: lastCrawlDate, icon: Clock, iconBg: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
            { label: "Sumber Aktif", value: `${sources.filter(s => s.status === "healthy").length} / ${sources.length}`, icon: CheckCircle, iconBg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
            { label: "Total Artikel Terindeks", value: sources.reduce((s, src) => s + src.articles, 0).toLocaleString("id-ID"), icon: null, iconBg: "" },
            { label: "Sumber Bermasalah", value: `${sources.filter(s => s.status !== "healthy").length} sumber`, icon: AlertTriangle, iconBg: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Isu yang Terdeteksi</h3>
        <div className="space-y-3">
          {issues.map(issue => {
            const cfg = statusConfig[issue.status];
            const Icon = cfg.icon;
            return (
              <div key={issue.label} className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`text-sm font-medium ${cfg.text}`}>{issue.label}</span>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{issue.action}</p>
                </div>
                <span className={`text-lg font-semibold tabular-nums flex-shrink-0 ${cfg.text}`}>{issue.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-slate-100">Status per Sumber</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Sumber</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Crawl Terakhir</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Artikel</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Isu</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {sources.map(src => (
                <tr key={src.name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 text-sm">{src.name}</td>
                  <td className="px-5 py-3"><StatusBadge status={src.status} /></td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{src.lastCrawl}</td>
                  <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 text-right">{src.articles.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-right">
                    {src.issues > 0 ? (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">{src.issues}</span>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {src.issues > 0 && (
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Perbaiki</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Rekomendasi Tindakan Korektif</h3>
        <div className="space-y-3">
          {[
            { priority: crawlIssues ? "Prioritas Tinggi" : "Status", action: crawlIssues ? `Periksa ${crawlIssues} sumber yang terlambat atau memiliki masalah metadata.` : "Semua sumber terpantau dalam kondisi baik.", status: crawlIssues ? "critical" as StatusLevel : "healthy" as StatusLevel },
            { priority: "Prioritas Sedang", action: `Tinjau ${missingDates} artikel dengan tanggal publikasi kosong.`, status: missingDates ? "warning" as StatusLevel : "healthy" as StatusLevel },
            { priority: "Prioritas Sedang", action: `Tinjau ${duplicates} headline yang terdeteksi identik.`, status: duplicates ? "warning" as StatusLevel : "healthy" as StatusLevel },
            { priority: "Prioritas Rendah", action: `Tinjau ${staleArticles} artikel lama untuk kebutuhan pengarsipan.`, status: "healthy" as StatusLevel },
          ].map((rec, i) => {
            const cfg = statusConfig[rec.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.text}`} />
                <div>
                  <span className={`text-xs font-semibold ${cfg.text}`}>{rec.priority} · </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{rec.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

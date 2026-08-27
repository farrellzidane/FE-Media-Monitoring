import { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { AlertTriangle, ChevronRight, Download, Radio, RefreshCw, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { StatusBadge } from "./DataQuality";
import { exportArticlesCsv, Sentiment, useDashboardData } from "../DashboardDataContext";

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

function dominantSentiment(positive: number, neutral: number, negative: number): Sentiment {
  if (positive >= neutral && positive >= negative) return "positive";
  return negative > neutral ? "negative" : "neutral";
}

function SourceSentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div className="flex-1 flex h-2.5 rounded-full overflow-hidden gap-px min-w-[80px]">
      <div className="bg-emerald-500 transition-all" style={{ width: `${positive}%` }} title={`Positif ${positive}%`} />
      <div className="bg-amber-400 transition-all" style={{ width: `${neutral}%` }} title={`Netral ${neutral}%`} />
      <div className="bg-red-500 transition-all" style={{ width: `${negative}%` }} title={`Negatif ${negative}%`} />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
}

function KpiCard({ label, value, icon: Icon, iconBg }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
      </div>
    </div>
  );
}

export function Sources({ onViewSourceArticles }: { onViewSourceArticles: (source: string) => void }) {
  const { data, loading, refresh } = useDashboardData();
  const { sourceDistribution, dataQualityMetrics, summary, articles } = data;
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const qualityByName = new Map(dataQualityMetrics.sources.map(source => [source.name, source]));
    return sourceDistribution
      .map(source => {
        const quality = qualityByName.get(source.name);
        return {
          name: source.name,
          articles: source.articles,
          positive: source.positive,
          neutral: source.neutral,
          negative: source.negative,
          dominant: dominantSentiment(source.positive, source.neutral, source.negative),
          status: quality?.status ?? "healthy",
          lastCrawl: quality?.lastCrawl ?? "Tidak diketahui",
          issues: quality?.issues ?? 0,
        };
      })
      .sort((a, b) => b.articles - a.articles);
  }, [sourceDistribution, dataQualityMetrics.sources]);

  const filteredRows = rows.filter(row => row.name.toLowerCase().includes(search.toLowerCase()));
  const healthySources = dataQualityMetrics.sources.filter(source => source.status === "healthy").length;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-slate-100">Sumber Berita</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analisis mendalam per sumber: volume, sentimen dominan, dan perbandingan.</p>
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Sumber" value={summary.totalSources.toLocaleString("id-ID")} icon={Radio} iconBg="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
        <KpiCard label="Total Artikel" value={summary.totalArticles.toLocaleString("id-ID")} icon={TrendingUp} iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KpiCard label="Sumber Sehat" value={`${healthySources} / ${dataQualityMetrics.sources.length}`} icon={ShieldCheck} iconBg="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Sumber Bermasalah" value={dataQualityMetrics.crawlIssues.toLocaleString("id-ID")} icon={AlertTriangle} iconBg="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>

      {/* Volume comparison + sentiment ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-slate-900 dark:text-slate-100 mb-1">Volume per Sumber</h3>
          <p className="text-xs text-slate-400 mb-4">Jumlah artikel yang terindeks per media · klik batang untuk melihat artikel</p>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">Belum ada data sumber.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 34)}>
              <BarChart data={rows} layout="vertical" barCategoryGap="25%" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} interval={0} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value: number) => [value, "Artikel"]} />
                <Bar dataKey="articles" radius={[0, 4, 4, 0]} name="Artikel" cursor="pointer" onClick={(entry) => onViewSourceArticles(entry.name)}>
                  {rows.map((entry, i) => (
                    <Cell key={i} fill={SENTIMENT_COLORS[entry.dominant]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Sentimen Dominan per Sumber</h3>
              <p className="text-xs text-slate-400">Proporsi positif / netral / negatif</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs flex-shrink-0">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Positif</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Netral</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Negatif</span>
            </div>
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {rows.length === 0 ? (
              <p className="text-sm text-slate-400 py-16 text-center">Belum ada data sentimen sumber.</p>
            ) : rows.map(row => (
              <div key={row.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-300 w-24 flex-shrink-0 truncate" title={row.name}>{row.name}</span>
                <SourceSentimentBar positive={row.positive} neutral={row.neutral} negative={row.negative} />
                <SentimentBadge sentiment={row.dominant} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail comparison table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-slate-900 dark:text-slate-100">Perbandingan Sumber</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Klik sebuah baris untuk melihat artikel dari sumber tersebut.</p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              type="text"
              placeholder="Cari sumber..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Radio className="w-9 h-9 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{rows.length === 0 ? "Belum ada sumber yang terindeks" : "Tidak ada sumber yang cocok"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Sumber</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Sentimen Dominan</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Distribusi</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Artikel</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">Crawl Terakhir</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Isu</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(row => (
                  <tr
                    key={row.name}
                    onClick={() => onViewSourceArticles(row.name)}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">{row.name}</td>
                    <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-5 py-3"><SentimentBadge sentiment={row.dominant} size="sm" /></td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="max-w-[180px]">
                        <SourceSentimentBar positive={row.positive} neutral={row.neutral} negative={row.negative} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 text-right">{row.articles.toLocaleString("id-ID")}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell whitespace-nowrap">{row.lastCrawl}</td>
                    <td className="px-5 py-3 text-right">{row.issues ? <span className="text-xs font-medium text-red-600 dark:text-red-400">{row.issues}</span> : <span className="text-xs text-emerald-600 dark:text-emerald-400">—</span>}</td>
                    <td className="px-5 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

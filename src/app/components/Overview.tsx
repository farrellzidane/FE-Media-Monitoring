import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, Minus, FileText, Globe, Tag, Download, Bookmark, ExternalLink, AlertTriangle, Info, AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { ArticleDrawer } from "./ArticleDrawer";
import { DashboardArticle, Insight, exportArticlesCsv, useDashboardData } from "../DashboardDataContext";

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

function KpiCard({ label, value, change, subLabel, icon: Icon, iconBg }: {
  label: string; value: string; change?: number; subLabel?: string;
  icon: React.ElementType; iconBg: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${change > 0 ? "text-emerald-600" : change < 0 ? "text-red-500" : "text-slate-400"}`}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(change)}% vs periode lalu
          </p>
        )}
        {subLabel && <p className="text-xs text-slate-400 mt-0.5">{subLabel}</p>}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = {
    critical: { icon: AlertCircle, bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    info: { icon: Info, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  };
  const c = config[insight.severity];
  const Icon = c.icon;
  return (
    <div className={`p-3 rounded-lg border ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.text}`} />
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${c.text}`}>{insight.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{insight.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">{insight.time}</span>
            <button className={`text-xs font-medium ${c.text} hover:underline`}>Lihat detail →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 56, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function Overview({ onViewAllArticles }: { onViewAllArticles: () => void }) {
  const { data } = useDashboardData();
  const {
    articleVolumeData, sentimentTrendData, categoryDistribution,
    sourceDistribution, trendingTopics, articles, insights,
    overallSentiment: donutData, summary, dataQualityMetrics,
  } = data;
  const [volumeView, setVolumeView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedArticle, setSelectedArticle] = useState<DashboardArticle | null>(null);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleSave = (id: string) => {
    setSavedArticles(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSeries = (key: string) => {
    setHiddenSeries(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const weeklyData = [];
  for (let i = 0; i < articleVolumeData.length; i += 7) {
    const chunk = articleVolumeData.slice(i, i + 7);
    weeklyData.push({
      date: chunk[0].date,
      articles: chunk.reduce((s, d) => s + d.articles, 0),
      prev: chunk.reduce((s, d) => s + d.prev, 0),
    });
  }

  const monthlyData = articleVolumeData.reduce<typeof articleVolumeData>((months, day) => {
    const monthLabel = day.date.split(/\s+/).find(part => /[^\d]/.test(part)) ?? day.date;
    const currentMonth = months.at(-1);

    if (currentMonth?.date === monthLabel) {
      currentMonth.articles += day.articles;
      currentMonth.prev += day.prev;
    } else {
      months.push({ date: monthLabel, articles: day.articles, prev: day.prev });
    }

    return months;
  }, []);

  const chartData = volumeView === "daily"
    ? articleVolumeData
    : volumeView === "weekly"
      ? weeklyData
      : monthlyData;

  const artWithSave = articles.map(a => ({ ...a, saved: savedArticles.has(a.id) }));

  return (
    <>
      <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-slate-900 dark:text-slate-100">Media Intelligence Overview</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor cakupan, sentimen, dan topik berkembang di media berita Indonesia.</p>
          </div>
          <button onClick={() => exportArticlesCsv(articles)} className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors">
            <Download className="w-4 h-4" />
            Export laporan
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Total Artikel" value={summary.totalArticles.toLocaleString("id-ID")} icon={FileText} iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
          <KpiCard label="Sumber Berita" value={summary.totalSources.toLocaleString("id-ID")} subLabel="Termonitor" icon={Globe} iconBg="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
          <KpiCard label="Kategori" value={summary.totalCategories.toLocaleString("id-ID")} subLabel="Termonitor" icon={Tag} iconBg="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
          <KpiCard label="Sentimen Positif" value={`${summary.positivePercent}%`} icon={TrendingUp} iconBg="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
          <KpiCard label="Sentimen Negatif" value={`${summary.negativePercent}%`} icon={TrendingDown} iconBg="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
          <KpiCard label="Skor Kualitas Data" value={`${dataQualityMetrics.overallScore.toFixed(1)}%`} icon={Sparkles} iconBg="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Main analytics row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Article Volume */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 dark:text-slate-100">Volume Artikel</h3>
                <p className="text-xs text-slate-400">Periode saat ini vs periode sebelumnya</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {(["daily", "weekly", "monthly"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVolumeView(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      volumeView === v
                        ? "bg-slate-900 dark:bg-blue-600 text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {{ daily: "Harian", weekly: "Mingguan", monthly: "Bulanan" }[v]}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 5)} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white" }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Area type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={1.5} fill="url(#gradPrev)" dot={false} name="Periode Lalu" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="articles" stroke="#3b82f6" strokeWidth={2} fill="url(#gradCurrent)" dot={false} name="Periode Ini" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Donut */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Distribusi Sentimen</h3>
            <p className="text-xs text-slate-400 mb-4">30 hari terakhir · {summary.totalArticles.toLocaleString("id-ID")} artikel</p>
            <div className="flex items-center justify-center">
              <PieChart width={180} height={180}>
                <Pie
                  data={donutData}
                  cx={85}
                  cy={85}
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}%`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </div>
            <div className="space-y-2.5 mt-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{d.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{d.value}%</span>
                    <span className="text-xs text-slate-400 ml-1">({d.count.toLocaleString("id-ID")})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Trend + Trending Topics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Sentiment Trend */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 dark:text-slate-100">Tren Sentimen</h3>
                <p className="text-xs text-slate-400">Distribusi sentimen artikel · klik legenda untuk sembunyikan</p>
              </div>
              <div className="flex gap-2">
                {(["positive", "neutral", "negative"] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => toggleSeries(key)}
                    className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-all ${
                      hiddenSeries.has(key) ? "opacity-35 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLORS[key] }} />
                    <span className="text-slate-600 dark:text-slate-300">{key === "positive" ? "Positif" : key === "neutral" ? "Netral" : "Negatif"}</span>
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sentimentTrendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gradNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white" }}
                  itemStyle={{ padding: "2px 0" }}
                />
                {!hiddenSeries.has("positive") && (
                  <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fill="url(#gradPositive)"
                    dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
                    name="Positif" />
                )}
                {!hiddenSeries.has("neutral") && (
                  <Area type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} fill="url(#gradNeutral)"
                    dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
                    name="Netral" />
                )}
                {!hiddenSeries.has("negative") && (
                  <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fill="url(#gradNegative)"
                    dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#ef4444", stroke: "white", strokeWidth: 2 }}
                    name="Negatif" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trending Topics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Topik Populer</h3>
            <p className="text-xs text-slate-400 mb-4">Berdasarkan jumlah sebutan</p>
            <div className="space-y-3">
              {trendingTopics.map((topic, i) => (
                <div key={topic.topic} className="flex items-center gap-3">
                  <span className="text-xs tabular-nums font-medium text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{topic.topic}</span>
                      <SentimentBadge sentiment={topic.sentiment} size="sm" />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-slate-400">{topic.mentions.toLocaleString("id-ID")} sebutan</span>
                      <span className={`text-xs font-medium ${topic.change > 0 ? "text-emerald-600" : topic.change < 0 ? "text-red-500" : "text-slate-400"}`}>
                        {topic.change > 0 ? "+" : ""}{topic.change}%
                      </span>
                    </div>
                  </div>
                  <SparkLine data={topic.trend} color={SENTIMENT_COLORS[topic.sentiment]} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coverage breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Distribusi Kategori</h3>
            <p className="text-xs text-slate-400 mb-4">Klik untuk filter dashboard</p>
            <ResponsiveContainer width="100%" height={Math.max(220, categoryDistribution.length * 32)}>
              <BarChart data={categoryDistribution} layout="vertical" barCategoryGap="25%" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={90} interval={0} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Artikel" cursor="pointer" onClick={(d) => setActiveCategory(activeCategory === d.name ? null : d.name)}>
                  {categoryDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={activeCategory === null || activeCategory === entry.name ? entry.color : "#e2e8f0"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Source */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Distribusi Sumber</h3>
            <p className="text-xs text-slate-400 mb-4">Top 8 sumber · {(30).toLocaleString()} hari terakhir</p>
            <div className="space-y-2">
              {sourceDistribution.slice(0, 8).map((src) => {
                const maxArticles = Math.max(...sourceDistribution.map(s => s.articles));
                return (
                  <div key={src.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-20 truncate">{src.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(src.articles / maxArticles) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400 w-12 text-right">{src.articles.toLocaleString("id-ID")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Latest coverage + Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* News table */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-slate-100">Cakupan Terbaru</h3>
              <button
                type="button"
                onClick={onViewAllArticles}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Sentimen</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Headline</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Sumber</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">Konfiden</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">Tanggal</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {artWithSave.slice(0, 6).map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <td className="px-4 py-3">
                        <SentimentBadge sentiment={article.sentiment} size="sm" />
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug text-xs" title={article.headline}>
                          {article.headline}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">{article.source}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{(article.confidence * 100).toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell whitespace-nowrap">{formatDate(article.published)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                            className={`p-1.5 rounded transition-colors ${article.saved ? "text-blue-600" : "text-slate-300 hover:text-slate-500"}`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded text-slate-300 hover:text-slate-500 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Temuan Otomatis</h3>
            <p className="text-xs text-slate-400 mb-4">Dideteksi oleh sistem monitoring</p>
            <div className="space-y-3">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedArticle && (
        <ArticleDrawer
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSave={(id) => { toggleSave(id); setSelectedArticle(prev => prev ? { ...prev, saved: !prev.saved } : null); }}
        />
      )}
    </>
  );
}

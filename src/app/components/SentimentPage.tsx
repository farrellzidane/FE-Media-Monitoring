import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { Info } from "lucide-react";
import { useDashboardData } from "../DashboardDataContext";

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
};

function getConfidenceBand(confidence: number) {
  if (confidence >= 0.9) return { label: "Sangat Yakin", range: "≥ 90%", colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" };
  if (confidence >= 0.7) return { label: "Cukup Yakin", range: "70–90%", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" };
  return { label: "Perlu Tinjauan", range: "< 70%", colorClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" };
}

function SentimentRankingBar({ name, positive, neutral, negative }: { name: string; positive: number; neutral: number; negative: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 dark:text-slate-300 w-24 flex-shrink-0 truncate">{name}</span>
      <div className="flex-1 flex h-3 rounded-full overflow-hidden gap-px">
        <div className="bg-emerald-500 transition-all" style={{ width: `${positive}%` }} title={`Positif ${positive}%`} />
        <div className="bg-amber-400 transition-all" style={{ width: `${neutral}%` }} title={`Netral ${neutral}%`} />
        <div className="bg-red-500 transition-all" style={{ width: `${negative}%` }} title={`Negatif ${negative}%`} />
      </div>
      <div className="flex gap-2 text-xs tabular-nums flex-shrink-0">
        <span className="text-emerald-600 dark:text-emerald-400 w-7 text-right">{positive}%</span>
        <span className="text-amber-600 dark:text-amber-400 w-7 text-right">{neutral}%</span>
        <span className="text-red-600 dark:text-red-400 w-7 text-right">{negative}%</span>
      </div>
    </div>
  );
}

export function SentimentPage() {
  const { data } = useDashboardData();
  const { sentimentTrendData, sourceDistribution, categoryDistribution, overallSentiment: overallData, summary } = data;
  const confidenceBand = getConfidenceBand(summary.averageConfidence);
  const categorySentiment = categoryDistribution.map(category => {
    const total = category.positive + category.neutral + category.negative;
    return {
      ...category,
      positive: total ? Math.round(category.positive / total * 100) : 0,
      neutral: total ? Math.round(category.neutral / total * 100) : 0,
      negative: total ? Math.round(category.negative / total * 100) : 0,
    };
  });
  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-slate-100">Analisis Sentimen</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Distribusi, tren, dan perbandingan sentimen dari model backend</p>
      </div>

      {/* Overall dist + IndoBERT info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-slate-900 dark:text-slate-100 mb-4">Distribusi Keseluruhan</h3>
          <div className="flex justify-center">
            <PieChart width={180} height={180}>
              <Pie data={overallData} cx={85} cy={85} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {overallData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val: number) => [`${val}%`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </div>
          <div className="space-y-3 mt-2">
            {overallData.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{d.name}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{d.value}%</span>
                <span className="text-xs text-slate-400">({d.count.toLocaleString("id-ID")})</span>
              </div>
            ))}
          </div>
        </div>

        {/* IndoBERT info */}
        <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-blue-800 dark:text-blue-300">Tentang Skor Kepercayaan Model</h3>
          </div>
          <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
            <p>Platform ini menggunakan model sentimen multibahasa di backend untuk mengklasifikasikan sentimen artikel berita secara otomatis.</p>
            <p>Skor kepercayaan mencerminkan seberapa yakin model terhadap prediksi sentimennya:</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { range: "≥ 90%", label: "Sangat Andal", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
                { range: "70–90%", label: "Cukup Andal", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
                { range: "< 70%", label: "Perlu Tinjauan", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
              ].map(item => (
                <div key={item.range} className={`rounded-lg p-3 text-center ${item.color}`}>
                  <div className="text-sm font-semibold tabular-nums">{item.range}</div>
                  <div className="text-xs mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Rata-rata kepercayaan model saat ini: <strong>{(summary.averageConfidence * 100).toFixed(1)}%</strong>
              <span className={`ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${confidenceBand.colorClass}`}>
                {confidenceBand.label} · {confidenceBand.range}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-1">Tren Sentimen dari Waktu ke Waktu</h3>
        <p className="text-xs text-slate-400 mb-4">Jumlah artikel per kategori sentimen · 30 hari terakhir</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={sentimentTrendData} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} dot={{ r: 3 }} name="Positif" />
            <Line type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} dot={{ r: 3 }} name="Netral" />
            <Line type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} dot={{ r: 3 }} name="Negatif" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Source sentiment ranking */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-slate-100">Sentimen per Sumber</h3>
            <p className="text-xs text-slate-400">Distribusi positif / netral / negatif per media</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Positif</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Netral</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Negatif</span>
          </div>
        </div>
        <div className="space-y-3">
          {sourceDistribution.map(src => (
            <SentimentRankingBar key={src.name} {...src} />
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-slate-900 dark:text-slate-100 mb-1">Sentimen per Kategori</h3>
        <p className="text-xs text-slate-400 mb-4">Batang bertumpuk menunjukkan proporsi sentimen per kategori</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={categorySentiment}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v}%`, ""]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="Positif" radius={[0, 0, 0, 0]} />
            <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="Netral" />
            <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="Negatif" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

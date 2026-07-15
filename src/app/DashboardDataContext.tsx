import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Sentiment = "positive" | "neutral" | "negative";

export interface DashboardArticle {
  id: string;
  headline: string;
  source: string;
  category: string;
  sentiment: Sentiment;
  confidence: number;
  published: string;
  excerpt: string;
  url: string;
  saved: boolean;
  crawlDate: string;
}

export interface Insight {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
}

interface ApiArticle {
  title?: string | null;
  source?: string | null;
  category?: string | null;
  published_date?: string | null;
  crawl_date?: string | null;
  url?: string | null;
  content?: string | null;
  sentiment?: string | null;
  confidence?: number | null;
}

interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

interface ApiAnalytics {
  quality: {
    total_articles: number;
    missing_dates: number;
    empty_titles: number;
    duplicate_titles: number;
    old_articles: number;
    quality_score: number;
  };
  daily_volume: Record<string, number>;
  trend: Record<string, SentimentCounts>;
  category_sentiment: Record<string, SentimentCounts>;
  source_sentiment: Record<string, SentimentCounts>;
  keywords: [string, number][];
  latest_articles: ApiArticle[];
  articles?: ApiArticle[];
}

type SourceStatus = "healthy" | "warning" | "critical";

interface DashboardData {
  articles: DashboardArticle[];
  articleVolumeData: { date: string; articles: number; prev: number }[];
  sentimentTrendData: ({ date: string } & SentimentCounts)[];
  categoryDistribution: ({ name: string; value: number; color: string } & SentimentCounts)[];
  sourceDistribution: ({ name: string; articles: number } & SentimentCounts)[];
  trendingTopics: { topic: string; mentions: number; change: number; sentiment: Sentiment; trend: number[] }[];
  insights: Insight[];
  overallSentiment: { name: string; value: number; color: string; count: number }[];
  summary: {
    totalArticles: number;
    totalSources: number;
    totalCategories: number;
    positivePercent: number;
    negativePercent: number;
    averageConfidence: number;
  };
  dataQualityMetrics: {
    overallScore: number;
    missingDates: number;
    duplicates: number;
    staleArticles: number;
    crawlIssues: number;
    lastCrawl: string;
    sources: { name: string; status: SourceStatus; lastCrawl: string; articles: number; issues: number }[];
  };
}

interface DashboardContextValue {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const CATEGORY_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#06b6d4", "#0ea5e9", "#38bdf8"];

const emptyData: DashboardData = {
  articles: [],
  articleVolumeData: [],
  sentimentTrendData: [],
  categoryDistribution: [],
  sourceDistribution: [],
  trendingTopics: [],
  insights: [],
  overallSentiment: [
    { name: "Positif", value: 0, color: "#10b981", count: 0 },
    { name: "Netral", value: 0, color: "#f59e0b", count: 0 },
    { name: "Negatif", value: 0, color: "#ef4444", count: 0 },
  ],
  summary: { totalArticles: 0, totalSources: 0, totalCategories: 0, positivePercent: 0, negativePercent: 0, averageConfidence: 0 },
  dataQualityMetrics: { overallScore: 0, missingDates: 0, duplicates: 0, staleArticles: 0, crawlIssues: 0, lastCrawl: "", sources: [] },
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function normalizeSentiment(value?: string | null): Sentiment {
  const normalized = value?.toLowerCase();
  return normalized === "positive" || normalized === "negative" ? normalized : "neutral";
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function displayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function relativeTime(value: string, latestTimestamp: number) {
  const timestamp = new Date(value.replace(" ", "T")).getTime();
  if (!Number.isFinite(timestamp)) return "Tidak diketahui";
  const minutes = Math.max(0, Math.round((latestTimestamp - timestamp) / 60_000));
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.round(hours / 24)} hari lalu`;
}

function mapDashboardData(analytics: ApiAnalytics, rawArticles: ApiArticle[]): DashboardData {
  const enrichedByUrl = new Map((analytics.articles || analytics.latest_articles || []).map(article => [article.url, article]));
  const enrichedByTitle = new Map((analytics.articles || analytics.latest_articles || []).map(article => [article.title, article]));
  const sourceArticles = rawArticles.length ? rawArticles : (analytics.articles || analytics.latest_articles || []);

  const articles = sourceArticles.map((raw, index) => {
    const enriched = enrichedByUrl.get(raw.url) || enrichedByTitle.get(raw.title) || raw;
    return {
      id: raw.url || `${index + 1}`,
      headline: raw.title || "Tanpa judul",
      source: raw.source || "Tidak diketahui",
      category: raw.category || "Tanpa kategori",
      sentiment: normalizeSentiment(enriched.sentiment),
      confidence: Number(enriched.confidence || 0),
      published: raw.published_date || raw.crawl_date || "",
      excerpt: (raw.content || "Ringkasan artikel tidak tersedia.").slice(0, 600),
      url: raw.url || "#",
      saved: false,
      crawlDate: raw.crawl_date || "",
    } satisfies DashboardArticle;
  });

  const volumeEntries = Object.entries(analytics.daily_volume || {});
  const articleVolumeData = volumeEntries.map(([date, count], index) => ({
    date: displayDate(date),
    articles: count,
    prev: index >= 7 ? volumeEntries[index - 7][1] : 0,
  }));

  const sentimentTrendData = Object.entries(analytics.trend || {}).map(([date, counts]) => ({
    date: displayDate(date),
    ...counts,
  }));

  const categoryDistribution = Object.entries(analytics.category_sentiment || {})
    .map(([name, counts], index) => ({ name, value: counts.positive + counts.neutral + counts.negative, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length], ...counts }))
    .sort((a, b) => b.value - a.value);

  const sourceDistribution = Object.entries(analytics.source_sentiment || {})
    .map(([name, counts]) => {
      const total = counts.positive + counts.neutral + counts.negative;
      return {
        name,
        articles: total,
        positive: percentage(counts.positive, total),
        neutral: percentage(counts.neutral, total),
        negative: percentage(counts.negative, total),
      };
    })
    .sort((a, b) => b.articles - a.articles);

  const totals = Object.values(analytics.trend || {}).reduce(
    (sum, item) => ({ positive: sum.positive + item.positive, neutral: sum.neutral + item.neutral, negative: sum.negative + item.negative }),
    { positive: 0, neutral: 0, negative: 0 },
  );
  const sentimentTotal = totals.positive + totals.neutral + totals.negative;
  const overallSentiment = [
    { name: "Positif", value: percentage(totals.positive, sentimentTotal), color: "#10b981", count: totals.positive },
    { name: "Netral", value: percentage(totals.neutral, sentimentTotal), color: "#f59e0b", count: totals.neutral },
    { name: "Negatif", value: percentage(totals.negative, sentimentTotal), color: "#ef4444", count: totals.negative },
  ];

  const dominantSentiment: Sentiment = totals.positive >= totals.neutral && totals.positive >= totals.negative
    ? "positive"
    : totals.negative > totals.neutral ? "negative" : "neutral";
  const trendingTopics = (analytics.keywords || []).slice(0, 6).map(([topic, mentions]) => ({
    topic,
    mentions,
    change: 0,
    sentiment: dominantSentiment,
    trend: [mentions, mentions],
  }));

  const latestCrawl = articles.map(article => article.crawlDate).filter(Boolean).sort().at(-1) || "";
  const latestTimestamp = new Date(latestCrawl.replace(" ", "T")).getTime() || Date.now();
  const sourceNames = [...new Set(articles.map(article => article.source))];
  const sources = sourceNames.map(name => {
    const matching = articles.filter(article => article.source === name);
    const lastCrawl = matching.map(article => article.crawlDate).filter(Boolean).sort().at(-1) || "";
    const timestamp = new Date(lastCrawl.replace(" ", "T")).getTime();
    const ageMinutes = Number.isFinite(timestamp) ? Math.max(0, (latestTimestamp - timestamp) / 60_000) : Infinity;
    const issues = matching.filter(article => !article.published || article.headline === "Tanpa judul").length;
    const status: SourceStatus = ageMinutes >= 360 ? "critical" : ageMinutes >= 120 || issues > 0 ? "warning" : "healthy";
    return { name, status, lastCrawl: relativeTime(lastCrawl, latestTimestamp), articles: matching.length, issues };
  });
  const crawlIssues = sources.filter(source => source.status !== "healthy").length;
  const quality = analytics.quality;

  const insights: Insight[] = [];
  if (quality.missing_dates > 0) insights.push({ id: "missing", severity: "warning", title: "Tanggal Publikasi Hilang", description: `${quality.missing_dates} artikel belum memiliki tanggal publikasi.`, time: "Data terbaru" });
  if (quality.duplicate_titles > 0) insights.push({ id: "duplicates", severity: "warning", title: "Duplikasi Terdeteksi", description: `${quality.duplicate_titles} headline terdeteksi sebagai duplikat.`, time: "Data terbaru" });
  if (crawlIssues > 0) insights.push({ id: "crawl", severity: "critical", title: "Sumber Perlu Perhatian", description: `${crawlIssues} sumber memiliki keterlambatan atau masalah metadata.`, time: "Data terbaru" });
  if (!insights.length) insights.push({ id: "healthy", severity: "info", title: "Data Dalam Kondisi Baik", description: "Tidak ada masalah kualitas utama yang terdeteksi.", time: "Data terbaru" });

  return {
    articles,
    articleVolumeData,
    sentimentTrendData,
    categoryDistribution,
    sourceDistribution,
    trendingTopics,
    insights,
    overallSentiment,
    summary: {
      totalArticles: quality.total_articles || articles.length,
      totalSources: sourceNames.length,
      totalCategories: new Set(articles.map(article => article.category)).size,
      positivePercent: percentage(totals.positive, sentimentTotal),
      negativePercent: percentage(totals.negative, sentimentTotal),
      averageConfidence: articles.length ? articles.reduce((sum, article) => sum + article.confidence, 0) / articles.length : 0,
    },
    dataQualityMetrics: {
      overallScore: quality.quality_score,
      missingDates: quality.missing_dates,
      duplicates: quality.duplicate_titles,
      staleArticles: quality.old_articles,
      crawlIssues,
      lastCrawl: latestCrawl,
      sources,
    },
  };
}

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`Backend merespons ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const [analytics, articles] = await Promise.all([
        getJson<ApiAnalytics>("/analytics?keyword_limit=15&article_limit=15", controller.signal),
        getJson<ApiArticle[]>("/articles", controller.signal),
      ]);
      setData(mapDashboardData(analytics, articles));
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(() => ({ data, loading, error, lastUpdated, refresh }), [data, loading, error, lastUpdated, refresh]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboardData must be used inside DashboardDataProvider");
  return context;
}

export function exportArticlesCsv(articles: DashboardArticle[]) {
  const header = ["headline", "source", "category", "sentiment", "confidence", "published", "url"];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [header.join(","), ...articles.map(article => [article.headline, article.source, article.category, article.sentiment, article.confidence, article.published, article.url].map(escape).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `media-monitoring-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

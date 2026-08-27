import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Sentiment = "positive" | "neutral" | "negative";

export interface DashboardArticle {
  id: string;
  headline: string;
  source: string;
  category: string;
  sentiment: Sentiment;
  sentimentReason: string;
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
  sentiment_reason?: string | null;
  confidence?: number | null;
}

interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export type QualityStatus = "excellent" | "healthy" | "warning" | "critical";

export interface QualityRule {
  key: string;
  label: string;
  description: string;
  recommendation: string;
  dimension: string;
  weight: number;
  applicable: number;
  passed: number;
  failed: number;
  score: number;
  severity: Exclude<QualityStatus, "excellent">;
}

export interface QualityDimension {
  key: string;
  label: string;
  weight: number;
  score: number;
  weightedScore: number;
  issues: number;
  status: QualityStatus;
}

export type EvidenceResultFilter = "all" | "passed" | "failed";

export interface QualityEvidenceItem {
  id: string;
  entityType: "article" | "source";
  result: Exclude<EvidenceResultFilter, "all">;
  title: string;
  source: string;
  url: string | null;
  publishedDate: string | null;
  crawlDate: string | null;
  observedValue: string;
  expectedValue: string;
  reason: string;
}

export interface QualityRuleEvidence {
  rule: QualityRule & { dimensionLabel: string };
  resultFilter: EvidenceResultFilter;
  total: number;
  filteredTotal: number;
  limit: number;
  offset: number;
  evidence: QualityEvidenceItem[];
}

interface ApiQualityRuleEvidence {
  rule: QualityRule & { dimension_label: string };
  result_filter: EvidenceResultFilter;
  total: number;
  filtered_total: number;
  limit: number;
  offset: number;
  evidence: {
    id: string;
    entity_type: "article" | "source";
    result: "passed" | "failed";
    title: string;
    source: string;
    url: string | null;
    published_date: string | null;
    crawl_date: string | null;
    observed_value: string;
    expected_value: string;
    reason: string;
  }[];
}

interface ApiQualitySource {
  name: string;
  status: Exclude<QualityStatus, "excellent">;
  last_crawl?: string | null;
  crawl_age_minutes?: number | null;
  articles: number;
  issues: number;
}

interface ApiAnalytics {
  quality: {
    total_articles: number;
    missing_dates: number;
    empty_titles: number;
    duplicate_titles: number;
    old_articles: number;
    quality_score: number;
    status: QualityStatus;
    dimensions: {
      key: string;
      label: string;
      weight: number;
      score: number;
      weighted_score: number;
      issues: number;
      status: QualityStatus;
    }[];
    rules: QualityRule[];
    sources: ApiQualitySource[];
  };
  daily_volume: Record<string, number>;
  trend: Record<string, SentimentCounts>;
  category_sentiment: Record<string, SentimentCounts>;
  source_sentiment: Record<string, SentimentCounts>;
  keywords: [string, number][];
  latest_articles: ApiArticle[];
  articles?: ApiArticle[];
}

type SourceStatus = Exclude<QualityStatus, "excellent">;

interface DashboardData {
  articles: DashboardArticle[];
  articleVolumeData: { date: string; articles: number; prev: number }[];
  sentimentTrendData: ({ date: string } & SentimentCounts)[];
  categoryDistribution: ({ name: string; value: number; color: string } & SentimentCounts)[];
  sourceDistribution: ({ name: string; articles: number } & SentimentCounts)[];
  trendingTopics: { topic: string; mentions: number; change: number; sentiment: Sentiment; trend: number[] }[];
  keywords: { keyword: string; count: number }[];
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
    overallStatus: QualityStatus;
    dimensions: QualityDimension[];
    rules: QualityRule[];
    crawlIssues: number;
    lastCrawl: string;
    sources: { name: string; status: SourceStatus; lastCrawl: string; crawlAgeMinutes: number | null; articles: number; issues: number }[];
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
  keywords: [],
  insights: [],
  overallSentiment: [
    { name: "Positif", value: 0, color: "#10b981", count: 0 },
    { name: "Netral", value: 0, color: "#f59e0b", count: 0 },
    { name: "Negatif", value: 0, color: "#ef4444", count: 0 },
  ],
  summary: { totalArticles: 0, totalSources: 0, totalCategories: 0, positivePercent: 0, negativePercent: 0, averageConfidence: 0 },
  dataQualityMetrics: { overallScore: 0, overallStatus: "critical", dimensions: [], rules: [], crawlIssues: 0, lastCrawl: "", sources: [] },
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

function relativeMinutes(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "Tidak diketahui";
  const minutes = Math.max(0, Math.round(value));
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
      sentimentReason: enriched.sentiment_reason || raw.sentiment_reason || "",
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
  const keywords = (analytics.keywords || []).map(([keyword, count]) => ({ keyword, count }));

  const sourceNames = [...new Set(articles.map(article => article.source))];
  const quality = analytics.quality;
  const sources = (quality.sources || []).map(source => ({
    name: source.name,
    status: source.status,
    lastCrawl: relativeMinutes(source.crawl_age_minutes),
    crawlAgeMinutes: source.crawl_age_minutes ?? null,
    articles: source.articles,
    issues: source.issues,
  }));
  const latestCrawl = (quality.sources || [])
    .map(source => source.last_crawl || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
  const crawlIssues = sources.filter(source => source.status !== "healthy").length;

  const insights: Insight[] = [];
  (quality.rules || [])
    .filter(rule => rule.failed > 0)
    .sort((a, b) => b.weight - a.weight || b.failed - a.failed)
    .slice(0, 3)
    .forEach(rule => insights.push({
      id: rule.key,
      severity: rule.severity === "critical" ? "critical" : "warning",
      title: rule.label,
      description: `${rule.failed} dari ${rule.applicable} pemeriksaan gagal. ${rule.recommendation}`,
      time: "Data terbaru",
    }));
  if (!insights.length) insights.push({ id: "healthy", severity: "info", title: "Data Dalam Kondisi Baik", description: "Tidak ada masalah kualitas utama yang terdeteksi.", time: "Data terbaru" });

  return {
    articles,
    articleVolumeData,
    sentimentTrendData,
    categoryDistribution,
    sourceDistribution,
    trendingTopics,
    keywords,
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
      overallStatus: quality.status,
      dimensions: (quality.dimensions || []).map(dimension => ({
        key: dimension.key,
        label: dimension.label,
        weight: dimension.weight,
        score: dimension.score,
        weightedScore: dimension.weighted_score,
        issues: dimension.issues,
        status: dimension.status,
      })),
      rules: quality.rules || [],
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

export async function fetchQualityRuleEvidence(
  ruleKey: string,
  resultFilter: EvidenceResultFilter,
  offset: number,
  limit: number,
  signal: AbortSignal,
): Promise<QualityRuleEvidence> {
  const params = new URLSearchParams({
    result: resultFilter,
    offset: String(offset),
    limit: String(limit),
  });
  const response = await getJson<ApiQualityRuleEvidence>(
    `/data-quality/rules/${encodeURIComponent(ruleKey)}/evidence?${params}`,
    signal,
  );
  const { dimension_label: dimensionLabel, ...rule } = response.rule;
  return {
    rule: { ...rule, dimensionLabel },
    resultFilter: response.result_filter,
    total: response.total,
    filteredTotal: response.filtered_total,
    limit: response.limit,
    offset: response.offset,
    evidence: response.evidence.map(item => ({
      id: item.id,
      entityType: item.entity_type,
      result: item.result,
      title: item.title,
      source: item.source,
      url: item.url,
      publishedDate: item.published_date,
      crawlDate: item.crawl_date,
      observedValue: item.observed_value,
      expectedValue: item.expected_value,
      reason: item.reason,
    })),
  };
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
        getJson<ApiAnalytics>("/analytics?keyword_limit=60&article_limit=15", controller.signal),
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

import { useMemo } from "react";
import { X, ExternalLink, Bookmark, BookmarkCheck, Copy, Clock, Tag, Info } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { useDashboardData } from "../DashboardDataContext";

const SENTIMENT_REASON_CLASSES = {
  positive: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
  neutral: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  negative: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
};

const SCORE_BAR_ROWS: { key: "positive" | "neutral" | "negative"; label: string; barClass: string }[] = [
  { key: "positive", label: "Positif", barClass: "bg-emerald-500" },
  { key: "neutral", label: "Netral", barClass: "bg-amber-500" },
  { key: "negative", label: "Negatif", barClass: "bg-red-500" },
];

interface Article {
  id: string;
  headline: string;
  source: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentReason: string;
  confidence: number;
  confidenceReason: string;
  sentimentScores: { positive: number; neutral: number; negative: number } | null;
  published: string;
  excerpt: string;
  url: string;
  saved: boolean;
}

interface ArticleDrawerProps {
  article: Article | null;
  onClose: () => void;
  onSave: (id: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ArticleDrawer({ article, onClose, onSave }: ArticleDrawerProps) {
  const { data } = useDashboardData();
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return data.articles
      .filter(a => a.id !== article.id && (a.category === article.category || a.source === article.source))
      .sort((a, b) =>
        Number(b.category === article.category) - Number(a.category === article.category) ||
        new Date(b.published).getTime() - new Date(a.published).getTime()
      )
      .slice(0, 3);
  }, [data.articles, article]);

  if (!article) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Detail Artikel</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Metadata pills */}
          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge sentiment={article.sentiment} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Konfiden: <span className="font-semibold text-slate-700 dark:text-slate-300">{(article.confidence * 100).toFixed(0)}%</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {article.headline}
          </h2>

          {/* Source & time */}
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{article.source}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(article.published)}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Skor Kepercayaan Model</span>
              <span className="font-medium">{(article.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${article.confidence * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Skor &gt; 85% menunjukkan klasifikasi sentimen dengan tingkat keyakinan tinggi.
            </p>
            {article.confidenceReason && (
              <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{article.confidenceReason}</span>
              </p>
            )}
          </div>

          {/* Per-label score breakdown */}
          {article.sentimentScores && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rincian Skor Sentimen</h3>
              <div className="space-y-1.5">
                {SCORE_BAR_ROWS.map(row => (
                  <div key={row.key} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{row.label}</span>
                      <span className="font-medium">{(article.sentimentScores![row.key] * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.barClass}`}
                        style={{ width: `${article.sentimentScores![row.key] * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Excerpt */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ringkasan Artikel</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{article.excerpt}</p>
          </div>

          {/* Sentiment reason */}
          {article.sentimentReason && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Alasan Sentimen</h3>
              <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm leading-relaxed ${SENTIMENT_REASON_CLASSES[article.sentiment]}`}>
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{article.sentimentReason}</p>
              </div>
            </div>
          )}

          {/* Related */}
          {relatedArticles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cakupan Terkait</h3>
              <div className="space-y-2">
                {relatedArticles.map(rel => (
                  <a
                    key={rel.id}
                    href={rel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <SentimentBadge sentiment={rel.sentiment} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">{rel.headline}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{rel.source} · {new Date(rel.published).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => onSave(article.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors flex-1 justify-center ${
              article.saved
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {article.saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {article.saved ? "Tersimpan" : "Simpan"}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Copy className="w-4 h-4" />
            Salin tautan
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka
          </a>
        </div>
      </aside>
    </>
  );
}

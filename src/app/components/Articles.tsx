import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, X, LayoutList, LayoutGrid, Bookmark, ExternalLink, SlidersHorizontal } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { ArticleDrawer } from "./ArticleDrawer";
import { DashboardArticle, exportArticlesCsv, useDashboardData } from "../DashboardDataContext";

const SENTIMENTS = [
  { value: "positive" as const, label: "Positif" },
  { value: "neutral" as const, label: "Netral" },
  { value: "negative" as const, label: "Negatif" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function Articles({ initialSearch = "" }: { initialSearch?: string }) {
  const { data } = useDashboardData();
  const { articles } = data;
  const sources = useMemo(() => [...new Set(articles.map(article => article.source))].sort(), [articles]);
  const categories = useMemo(() => [...new Set(articles.map(article => article.category))].sort(), [articles]);
  const [search, setSearch] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedArticle, setSelectedArticle] = useState<DashboardArticle | null>(null);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"published" | "confidence">("published");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 7;

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const toggleSource = (s: string) => setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCategory = (c: string) => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleSave = (id: string) => setSavedArticles(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearAll = () => { setSearch(""); setSelectedSources([]); setSelectedCategories([]); setSelectedSentiment(null); setPage(1); };

  const filtered = useMemo(() => {
    let result = [...articles];
    if (search) result = result.filter(a => a.headline.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase()));
    if (selectedSources.length) result = result.filter(a => selectedSources.includes(a.source));
    if (selectedCategories.length) result = result.filter(a => selectedCategories.includes(a.category));
    if (selectedSentiment) result = result.filter(a => a.sentiment === selectedSentiment);
    result.sort((a, b) => sortField === "published"
      ? new Date(b.published).getTime() - new Date(a.published).getTime()
      : b.confidence - a.confidence
    );
    return result;
  }, [articles, search, selectedSources, selectedCategories, selectedSentiment, sortField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeFilters = selectedSources.length + selectedCategories.length + (selectedSentiment ? 1 : 0);

  const artWithSave = paginated.map(a => ({ ...a, saved: savedArticles.has(a.id) }));

  return (
    <>
      <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-slate-900 dark:text-slate-100">Article Explorer</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length.toLocaleString("id-ID")} artikel ditemukan</p>
          </div>
          <button onClick={() => exportArticlesCsv(filtered)} className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search + Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                type="text"
                placeholder="Cari headline, sumber..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{activeFilters}</span>
              )}
            </button>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`p-2 ${viewMode === "table" ? "bg-slate-100 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                <LayoutList className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-slate-100 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                <LayoutGrid className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sumber</p>
                <div className="flex flex-wrap gap-1.5">
                  {sources.map(s => (
                    <button
                      key={s}
                      onClick={() => { toggleSource(s); setPage(1); }}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${selectedSources.includes(s) ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Kategori</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => { toggleCategory(c); setPage(1); }}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${selectedCategories.includes(c) ? "bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sentimen</p>
                <div className="flex flex-wrap gap-1.5">
                  {SENTIMENTS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setSelectedSentiment(selectedSentiment === s.value ? null : s.value); setPage(1); }}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${selectedSentiment === s.value ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {selectedSources.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md">
                  {s}
                  <button onClick={() => toggleSource(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedCategories.map(c => (
                <span key={c} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-md">
                  {c}
                  <button onClick={() => toggleCategory(c)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedSentiment && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                  {SENTIMENTS.find(s => s.value === selectedSentiment)?.label}
                  <button onClick={() => setSelectedSentiment(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">Hapus semua</button>
            </div>
          )}
        </div>

        {/* Sort & view info */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Urutkan:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as "published" | "confidence")}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="published">Terbaru</option>
              <option value="confidence">Kepercayaan tertinggi</option>
            </select>
          </div>
        </div>

        {/* Table view */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <Filter className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tidak ada artikel yang sesuai filter</p>
                <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">Hapus semua filter</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Headline</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Sumber</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Kategori</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Sentimen</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell whitespace-nowrap">Konfiden</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">Tanggal</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {artWithSave.map((article) => (
                      <tr
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{article.headline}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{article.source}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">{article.category}</span>
                        </td>
                        <td className="px-4 py-3"><SentimentBadge sentiment={article.sentiment} size="sm" /></td>
                        <td className="px-4 py-3 text-xs tabular-nums text-slate-600 dark:text-slate-300 hidden lg:table-cell">{(article.confidence * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap hidden lg:table-cell">{formatDate(article.published)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => toggleSave(article.id)}
                              className={`p-1.5 rounded transition-colors ${article.saved ? "text-blue-600" : "text-slate-300 hover:text-slate-500"}`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artWithSave.map(article => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <SentimentBadge sentiment={article.sentiment} size="sm" />
                  <span className="text-xs text-slate-400">{(article.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-snug mb-3">{article.headline}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{article.source}</span>
                  <span>{formatDate(article.published)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm transition-colors ${p === page ? "bg-slate-900 dark:bg-blue-600 text-white" : "border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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

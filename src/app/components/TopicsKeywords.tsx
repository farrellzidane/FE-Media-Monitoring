import { useMemo, useState } from "react";
import { Hash } from "lucide-react";
import { useDashboardData } from "../DashboardDataContext";

const TIER_CLASSES = [
  "text-blue-800 dark:text-blue-300 font-bold",
  "text-blue-700 dark:text-blue-400 font-semibold",
  "text-blue-600 dark:text-blue-400 font-semibold",
  "text-blue-500 dark:text-blue-500 font-medium",
  "text-slate-500 dark:text-slate-400 font-medium",
];

const MIN_FONT_PX = 13;
const MAX_FONT_PX = 34;

function tierFor(t: number) {
  if (t >= 0.8) return 0;
  if (t >= 0.6) return 1;
  if (t >= 0.4) return 2;
  if (t >= 0.2) return 3;
  return 4;
}

export function TopicsKeywords() {
  const { data } = useDashboardData();
  const [hovered, setHovered] = useState<string | null>(null);

  const keywords = useMemo(
    () => [...data.keywords].sort((a, b) => b.count - a.count),
    [data.keywords],
  );

  const { cloud, maxCount, totalMentions } = useMemo(() => {
    const top = keywords.slice(0, 50);
    const counts = top.map(k => k.count);
    const min = Math.min(...counts, 1);
    const max = Math.max(...counts, 1);
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const span = logMax - logMin || 1;

    const scaled = top.map(k => {
      const t = (Math.log(k.count) - logMin) / span;
      return {
        ...k,
        t,
        tier: tierFor(t),
        fontSize: MIN_FONT_PX + t * (MAX_FONT_PX - MIN_FONT_PX),
      };
    });

    return {
      cloud: scaled,
      maxCount: max,
      totalMentions: keywords.reduce((sum, k) => sum + k.count, 0),
    };
  }, [keywords]);

  const topList = keywords.slice(0, 12);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-slate-100">Topik & Kata Kunci</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Eksplorasi kata kunci trending berdasarkan frekuensi kemunculan di artikel</p>
      </div>

      {keywords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Hash className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">Belum ada kata kunci yang dapat ditampilkan.</p>
        </div>
      ) : (
        <>
          {/* Word cloud */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-slate-900 dark:text-slate-100">Word Cloud</h3>
              <span className="text-xs text-slate-400 flex-shrink-0">{keywords.length} kata kunci</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">Ukuran dan intensitas warna merepresentasikan frekuensi sebutan kata kunci</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center py-4">
              {cloud.map(item => (
                <span
                  key={item.keyword}
                  title={`${item.keyword}: ${item.count.toLocaleString("id-ID")} sebutan`}
                  onMouseEnter={() => setHovered(item.keyword)}
                  onMouseLeave={() => setHovered(null)}
                  className={`leading-none capitalize cursor-default transition-opacity ${TIER_CLASSES[item.tier]} ${hovered && hovered !== item.keyword ? "opacity-40" : "opacity-100"}`}
                  style={{ fontSize: `${item.fontSize}px` }}
                >
                  {item.keyword}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-2">
              <span>Jarang</span>
              <div className="flex items-end gap-1">
                {TIER_CLASSES.slice().reverse().map((cls, i) => (
                  <span key={i} className={`${cls} leading-none`} style={{ fontSize: `${13 + i * 5}px` }}>Aa</span>
                ))}
              </div>
              <span>Sering</span>
            </div>
          </div>

          {/* Ranked list */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-slate-900 dark:text-slate-100 mb-1">Kata Kunci Teratas</h3>
            <p className="text-xs text-slate-400 mb-4">{topList.length} kata kunci dengan jumlah sebutan terbanyak dari total {totalMentions.toLocaleString("id-ID")} sebutan</p>
            <div className="space-y-3">
              {topList.map((item, i) => (
                <div key={item.keyword} className="flex items-center gap-3">
                  <span className="text-xs tabular-nums font-medium text-slate-400 w-4 flex-shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize w-40 flex-shrink-0 truncate">{item.keyword}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 dark:bg-blue-500"
                      style={{ width: `${maxCount ? Math.max(4, (item.count / maxCount) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400 w-16 text-right flex-shrink-0">
                    {item.count.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

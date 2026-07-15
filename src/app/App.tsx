import { useState } from "react";
import { Layout } from "./components/Layout";
import { Overview } from "./components/Overview";
import { Articles } from "./components/Articles";
import { SentimentPage } from "./components/SentimentPage";
import { DataQuality } from "./components/DataQuality";
import { AlertCircle, Loader2 } from "lucide-react";
import { DashboardDataProvider, useDashboardData } from "./DashboardDataContext";

type Page = "overview" | "articles" | "sentiment" | "topics" | "sources" | "quality" | "export" | "settings";

function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-slate-800 dark:text-slate-200">{title}</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">{desc}</p>
    </div>
  );
}

function DashboardApp() {
  const [currentPage, setCurrentPage] = useState<Page>("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { data, loading, error, refresh } = useDashboardData();

  if (loading && data.articles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3 px-6">
        <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
        <p className="text-sm font-medium">Memuat data media monitoring…</p>
        <p className="text-xs text-slate-500 text-center">Analisis sentimen pertama dapat membutuhkan beberapa saat.</p>
      </div>
    );
  }

  if (error && data.articles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
          <AlertCircle className="w-9 h-9 text-red-500 mx-auto mb-3" />
          <h1 className="text-slate-900 font-semibold">Backend tidak dapat dihubungi</h1>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <button onClick={() => void refresh()} className="mt-5 px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-700">Coba lagi</button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "overview": return <Overview />;
      case "articles": return <Articles initialSearch={globalSearch} />;
      case "sentiment": return <SentimentPage />;
      case "quality": return <DataQuality />;
      case "topics": return <PlaceholderPage title="Topik & Kata Kunci" desc="Eksplorasi kata kunci trending, frekuensi sebutan, dan co-occurrence network." />;
      case "sources": return <PlaceholderPage title="Sumber Berita" desc="Analisis mendalam per sumber: volume, sentimen dominan, dan perbandingan." />;
      case "export": return <PlaceholderPage title="Export Data" desc="Ekspor artikel, laporan sentimen, dan data analitik ke CSV atau PDF." />;
      case "settings": return <PlaceholderPage title="Pengaturan" desc="Konfigurasi sumber yang dipantau, jadwal crawl, dan preferensi notifikasi." />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode(d => !d)}
      onSearch={(query) => {
        setGlobalSearch(query);
        setCurrentPage("articles");
      }}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <DashboardDataProvider>
      <DashboardApp />
    </DashboardDataProvider>
  );
}

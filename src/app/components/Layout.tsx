import { useState } from "react";
import {
  LayoutDashboard, FileText, TrendingUp, Hash, Radio,
  ShieldCheck, Download, Settings, Search, RefreshCw,
  Bell, ChevronDown, Menu, X, Sun, Moon, LogOut, User,
  Newspaper
} from "lucide-react";
import { useDashboardData } from "../DashboardDataContext";

type Page = "overview" | "articles" | "sentiment" | "topics" | "sources" | "quality" | "export" | "settings";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onSearch: (query: string) => void;
}

const navItems = [
  { id: "overview" as Page, label: "Overview", icon: LayoutDashboard },
  { id: "articles" as Page, label: "Articles", icon: FileText },
  { id: "sentiment" as Page, label: "Sentiment", icon: TrendingUp },
  { id: "topics" as Page, label: "Topics & Keywords", icon: Hash },
  { id: "sources" as Page, label: "Sources", icon: Radio },
  { id: "quality" as Page, label: "Data Quality", icon: ShieldCheck },
  { id: "export" as Page, label: "Export", icon: Download },
  { id: "settings" as Page, label: "Settings", icon: Settings },
];

export function Layout({ children, currentPage, onPageChange, darkMode, onToggleDark, onSearch }: LayoutProps) {
  const { loading, lastUpdated, refresh } = useDashboardData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center flex-shrink-0">
          <Newspaper className="w-4 h-4 text-blue-300" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">Media Monitoring</div>
          <div className="text-blue-300/70 text-xs">Intelligence Platform</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-blue-500/20 text-white font-medium"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Monitoring active</span>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "dark" : ""} bg-slate-50 dark:bg-slate-950`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form
            className="flex-1 max-w-md relative"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch(searchQuery.trim());
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="text"
              placeholder="Search headlines, topics, or sources…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </form>

          <div className="hidden sm:flex items-center gap-2 ml-auto">
            {/* Date range */}
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Last 30 days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Refresh */}
            <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" title="Refresh data">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Dark mode */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Last updated */}
            <span className="hidden lg:block text-xs text-slate-400 dark:text-slate-500">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : "Belum diperbarui"}
            </span>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  AR
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Arif Rahman</div>
                    <div className="text-xs text-slate-500">arif@mediamon.id</div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile icons */}
          <div className="flex sm:hidden items-center gap-1 ml-auto">
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[44px] min-h-[44px] justify-center ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

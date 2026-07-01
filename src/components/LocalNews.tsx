import React, { useState, useEffect } from "react";
import { Newspaper, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LocalNewsProps {
  provinceName: string;
  language?: "id" | "en";
  theme?: "dark" | "light";
}

export default function LocalNews({ provinceName, language = "id", theme = "dark" }: LocalNewsProps) {
  const [news, setNews] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const isEn = language === "en";

  const fetchNews = async () => {
    setLoading(true);
    setNews("");
    setIsOffline(false);
    
    try {
      const res = await fetch("/api/gemini/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: provinceName, lang: language }),
      });
      
      const data = await res.json();
      setNews(data.text || "");
      if (data.isOffline) {
        setIsOffline(true);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews(isEn ? "Failed to fetch news." : "Gagal mengambil berita.");
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [provinceName, language]);

  return (
    <div className={`mt-4 p-4 rounded-2xl border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-slate-900/40 border-slate-700/50" 
        : "bg-slate-50 border-slate-200"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
            <Newspaper className="w-4 h-4" />
          </div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            {isEn ? "Latest Local News" : "Berita Lokal Terkini"}
          </h3>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className={`p-1.5 rounded-lg transition-colors ${
            loading 
              ? "opacity-50 cursor-not-allowed" 
              : theme === "dark" 
                ? "hover:bg-slate-800 text-slate-400 hover:text-white" 
                : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
          }`}
          title={isEn ? "Refresh news" : "Perbarui berita"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className={`text-sm prose prose-sm max-w-none ${theme === "dark" ? "prose-invert prose-p:text-slate-300 prose-headings:text-slate-200 prose-a:text-blue-400" : "prose-p:text-slate-600 prose-headings:text-slate-800 prose-a:text-blue-600"}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              {isEn ? "Searching latest headlines using AI..." : "Mencari berita utama terbaru menggunakan AI..."}
            </p>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown>{news}</ReactMarkdown>
          </div>
        )}
      </div>
      
      {isOffline && !loading && (
        <div className={`mt-3 pt-3 border-t text-xs flex gap-2 items-start ${theme === "dark" ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
          <span className="text-amber-500 mt-0.5">⚠️</span>
          <p>
            {isEn 
              ? "To see real-time news, please configure your GEMINI_API_KEY in the Settings." 
              : "Untuk melihat berita real-time, konfigurasikan GEMINI_API_KEY Anda di Pengaturan."}
          </p>
        </div>
      )}
    </div>
  );
}

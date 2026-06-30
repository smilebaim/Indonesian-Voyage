import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";
import { Province, PROVINCES } from "../data/provinces";
import { Sparkles, BarChart2, TrendingUp, Info, GitCompare, ChevronDown } from "lucide-react";
import D3RadarChart from "./D3RadarChart";

interface ProvinceStatsProps {
  province: Province;
  language: "id" | "en";
  theme?: "dark" | "light";
}

interface StatItem {
  subject: string;
  value: number;
}

// Generates highly representative, deterministic metrics for each Indonesian province
const calculateProvinceStats = (province: Province, language: "id" | "en"): StatItem[] => {
  const { id, island } = province;
  const isEn = language === "en";

  // 1. Biodiversity Metric
  let biodiversity = 60;
  if (island === "Papua") biodiversity = 96;
  else if (island === "Kalimantan") biodiversity = 92;
  else if (island === "Sumatra") biodiversity = 88;
  else if (island === "Sulawesi") biodiversity = 84;
  else if (id === "bali" || island === "NusaTenggaraBali") biodiversity = 78;
  else if (island === "Maluku") biodiversity = 82;
  else biodiversity = 65 + (id.length % 5) * 3;

  // 2. Cultural Richness Metric
  let cultural = 70;
  if (id === "aceh" || id === "sumbar" || id === "bali" || id === "diy" || id === "yogyakarta" || island === "Papua") cultural = 96;
  else if (island === "Jawa" || island === "Sumatra") cultural = 88;
  else if (island === "NusaTenggaraBali") cultural = 85;
  else if (island === "Sulawesi") cultural = 82;
  else cultural = 72 + (id.charCodeAt(0) % 6) * 3;

  // 3. Geographic Variety Metric
  let geographic = 65;
  if (island === "Maluku" || island === "NusaTenggaraBali" || id === "kepri") geographic = 94; // Island-rich
  else if (island === "Papua" || island === "Sulawesi") geographic = 90; // Complex terrains, deep sea
  else if (island === "Sumatra" || island === "Jawa") geographic = 85; // Massive volcanic mountains & coasts
  else geographic = 72 + (id.length % 7) * 3;

  // 4. Community/Ethnic Diversity Metric
  let ethnic = 60;
  if (id === "dki" || id === "jakarta" || id === "sumut" || id === "kaltim") ethnic = 98; // Major melting pots
  else if (island === "Jawa") ethnic = 86;
  else if (island === "Sumatra") ethnic = 78;
  else if (island === "Kalimantan") ethnic = 82; // Dayak, Banjar, Malay, Javanese
  else ethnic = 66 + (id.charCodeAt(1) % 6) * 4;

  // 5. Historical Heritage Metric
  let history = 55;
  if (id === "diy" || id === "yogyakarta" || id === "jateng" || id === "sumbar" || id === "aceh" || id === "bali") history = 97;
  else if (island === "Jawa") history = 92;
  else if (island === "Sumatra") history = 84;
  else if (island === "Maluku") history = 80; // Spice trade history
  else history = 64 + (id.length % 4) * 5;

  // 6. Urbanization & Infrastructure Metric
  let urbanization = 40;
  if (id === "dki" || id === "jakarta") urbanization = 99;
  else if (id === "jabar" || id === "jatim") urbanization = 82;
  else if (island === "Jawa") urbanization = 78;
  else if (island === "Sumatra") urbanization = 62;
  else if (island === "Sulawesi" || island === "Kalimantan") urbanization = 54;
  else urbanization = 42 + (id.length % 6) * 4;

  return [
    {
      subject: isEn ? "Biodiversity" : "Hayati",
      value: biodiversity,
    },
    {
      subject: isEn ? "Culture" : "Budaya",
      value: cultural,
    },
    {
      subject: isEn ? "Geography" : "Geografi",
      value: geographic,
    },
    {
      subject: isEn ? "Etnisitas" : "Etnisitas", // Wait, in English 'Ethnic Diversity', in Indonesian 'Etnisitas'
      subject_custom: isEn ? "Ethnic Diversity" : "Keberagaman Etnis",
      value: ethnic,
    },
    {
      subject: isEn ? "Heritage" : "Sejarah",
      value: history,
    },
    {
      subject: isEn ? "Urbanization" : "Urbanisasi",
      value: urbanization,
    },
  ].map(item => ({
    ...item,
    subject: (item as any).subject_custom || item.subject
  }));
};

export default function ProvinceStats({ province, language, theme = "dark" }: ProvinceStatsProps) {
  const isEn = language === "en";
  const data = calculateProvinceStats(province, language);

  // Comparison states
  const [isComparing, setIsComparing] = useState(false);
  
  const defaultCompareId = useMemo(() => {
    const sorted = PROVINCES.filter(p => p.id !== province.id);
    const preferred = ["bali", "jakarta", "yogyakarta", "kaltim"];
    const found = preferred.find(id => id !== province.id && PROVINCES.some(p => p.id === id));
    return found || sorted[0]?.id || "";
  }, [province.id]);

  const [compareProvinceId, setCompareProvinceId] = useState(defaultCompareId);

  // Sync compareProvinceId when selected first province changes
  useEffect(() => {
    if (compareProvinceId === province.id) {
      const remaining = PROVINCES.filter(p => p.id !== province.id);
      const preferred = ["bali", "jakarta", "yogyakarta", "kaltim"];
      const found = preferred.find(id => id !== province.id && PROVINCES.some(p => p.id === id));
      setCompareProvinceId(found || remaining[0]?.id || "");
    }
  }, [province.id, compareProvinceId]);

  const compareProvince = useMemo(() => {
    return PROVINCES.find(p => p.id === compareProvinceId) || PROVINCES[0];
  }, [compareProvinceId]);

  const dataCompare = useMemo(() => {
    return calculateProvinceStats(compareProvince, language);
  }, [compareProvince, language]);

  // Dynamic colors with elegant fallback
  const accentColor = province.color || "#3b82f6";
  const compareAccentColor = compareProvince?.color || "#ec4899";

  const getDominantFeature = () => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    
    if (isEn) {
      return `This province stands out most in **${top.subject}** (${top.value}/100), reflecting its strong local contribution to Indonesia's national identity.`;
    } else {
      return `Provinsi ini memiliki keunggulan tertinggi pada sektor **${top.subject}** (${top.value}/100), mencerminkan kontribusi kuatnya bagi keragaman nasional.`;
    }
  };

  const getComparisonInsight = () => {
    const comparisons = data.map((item, index) => {
      const val1 = item.value;
      const val2 = dataCompare[index].value;
      const diff = val1 - val2;
      return {
        subject: item.subject,
        diff,
        absDiff: Math.abs(diff),
        val1,
        val2
      };
    });

    const sortedByAbsDiff = [...comparisons].sort((a, b) => b.absDiff - a.absDiff);
    const topDiff = sortedByAbsDiff[0];
    
    if (!topDiff) return "";

    if (isEn) {
      const strongerProv = topDiff.diff > 0 ? province.name : compareProvince.name;
      const weakerProv = topDiff.diff > 0 ? compareProvince.name : province.name;
      
      let text = `**${strongerProv}** exhibits a significant lead in **${topDiff.subject}** compared to **${weakerProv}** (${Math.max(topDiff.val1, topDiff.val2)} vs ${Math.min(topDiff.val1, topDiff.val2)}). `;
      
      if (sortedByAbsDiff[1] && sortedByAbsDiff[1].absDiff > 10) {
        const second = sortedByAbsDiff[1];
        const secondStronger = second.diff > 0 ? province.name : compareProvince.name;
        text += `Conversely, **${secondStronger}** has a higher **${second.subject}** index score (${Math.max(second.val1, second.val2)}/100).`;
      }
      return text;
    } else {
      const strongerProv = topDiff.diff > 0 ? province.name : compareProvince.name;
      const weakerProv = topDiff.diff > 0 ? compareProvince.name : province.name;
      
      let text = `**${strongerProv}** menonjol secara signifikan pada sektor **${topDiff.subject}** dibandingkan dengan **${weakerProv}** (${Math.max(topDiff.val1, topDiff.val2)} vs ${Math.min(topDiff.val1, topDiff.val2)}). `;
      
      if (sortedByAbsDiff[1] && sortedByAbsDiff[1].absDiff > 10) {
        const second = sortedByAbsDiff[1];
        const secondStronger = second.diff > 0 ? province.name : compareProvince.name;
        text += `Sebaliknya, **${secondStronger}** unggul pada sektor **${second.subject}** (${Math.max(second.val1, second.val2)}/100).`;
      }
      return text;
    }
  };

  const remainingProvinces = useMemo(() => {
    return PROVINCES.filter(p => p.id !== province.id).sort((a, b) => a.name.localeCompare(b.name));
  }, [province.id]);

  return (
    <div className={`border rounded-2xl p-4.5 mt-5 flex flex-col gap-4 animate-fadeIn relative overflow-hidden transition-all duration-300 ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"}`}>
      {/* Glow highlight */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full filter blur-[40px] opacity-20 transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: isComparing ? `${accentColor}` : accentColor }}
      />
      {isComparing && (
        <div 
          className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full filter blur-[40px] opacity-15 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: compareAccentColor }}
        />
      )}

      {/* Header */}
      <div className={`flex flex-col gap-2 border-b pb-3 transition-colors ${theme === "dark" ? "border-white/5" : "border-slate-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest transition-colors text-gray-300">
              {isEn ? "Demographic & Geographic Diversity Index" : "Indeks Keragaman Demografi & Geografi"}
            </h4>
          </div>

          {/* Toggle comparison mode button */}
          <button
            onClick={() => setIsComparing(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
              isComparing 
                ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <GitCompare className={`w-3 h-3 ${isComparing ? "animate-pulse" : ""}`} />
            <span>{isEn ? "Compare" : "Bandingkan"}</span>
          </button>
        </div>

        {/* Primary province badge + selection line if comparing */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span 
            className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
            style={{ 
              color: accentColor, 
              borderColor: `${accentColor}30`,
              backgroundColor: `${accentColor}10`
            }}
          >
            {province.name}
          </span>

          {isComparing && (
            <>
              <span className="text-[10px] font-bold text-gray-500">
                vs
              </span>
              
              {/* Dropdown to select compared province */}
              <div className="relative inline-block">
                <select
                  value={compareProvinceId}
                  onChange={(e) => setCompareProvinceId(e.target.value)}
                  className={`appearance-none text-[9px] font-mono pl-2 pr-7 py-0.5 rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all ${
                    theme === "dark"
                      ? "bg-neutral-900 border-white/10 text-gray-300 hover:bg-neutral-800"
                      : "bg-transparent border-white/10 text-white hover:bg-white/5 shadow-sm"
                  }`}
                  style={{
                    color: compareAccentColor,
                    borderColor: `${compareAccentColor}40`,
                    backgroundColor: `${compareAccentColor}05`
                  }}
                >
                  {remainingProvinces.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-950 text-gray-300">
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" style={{ color: compareAccentColor }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Content: Radar Chart (D3 side-by-side or standard Recharts) */}
      {isComparing ? (
        <div className="w-full py-1">
          <D3RadarChart
            province1={{
              name: province.name,
              color: accentColor,
              data: data,
            }}
            province2={{
              name: compareProvince.name,
              color: compareAccentColor,
              data: dataCompare,
            }}
            theme={theme}
            language={language}
          />
        </div>
      ) : (
        /* Recharts Radar Chart Container */
        <div className="w-full h-[180px] flex items-center justify-center relative my-1 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
              <PolarGrid stroke={theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: theme === "dark" ? "#9ca3af" : "#475569", fontSize: 9, fontWeight: 500 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: theme === "dark" ? "#4b5563" : "#94a3b8", fontSize: 7 }}
                axisLine={false}
              />
              <Radar
                name={isEn ? "Index Score" : "Skor Indeks"}
                dataKey="value"
                stroke={accentColor}
                fill={accentColor}
                fillOpacity={0.25}
                activeDot={{ r: 4, stroke: theme === "dark" ? "#ffffff" : "#475569", strokeWidth: 1.5 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="px-3 py-1.5 backdrop-blur-md rounded-xl shadow-2xl text-[10px] border transition-all bg-black/95 border-white/10">
                        <p className="font-semibold mb-0.5 transition-colors text-gray-300">{payload[0].name}</p>
                        <p className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                          {payload[0].value} / 100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div className={`border p-3 rounded-xl flex gap-2.5 items-start transition-all duration-300 ${theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-white/5 border-white/10 shadow-[0_4px_12px_rgba(31,38,135,0.03)]"}`}>
        <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="w-3 h-3 text-blue-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest block transition-colors text-gray-400">
            {isComparing 
              ? (isEn ? "Comparative Regional Insight" : "Analisis Komparatif Wilayah")
              : (isEn ? "AI-Computed Insight" : "Analisis Keragaman Wilayah")
            }
          </span>
          <p 
            className="text-[11px] leading-normal transition-colors text-gray-300"
            dangerouslySetInnerHTML={{ __html: isComparing ? getComparisonInsight() : getDominantFeature() }}
          />
        </div>
      </div>
    </div>
  );
}

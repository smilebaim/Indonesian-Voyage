import React, { useState, useMemo } from "react";
import { Province, PROVINCES } from "../data/provinces";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Maximize2, 
  Users, 
  Layers, 
  Search, 
  SlidersHorizontal,
  Award,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface ProvinceRankingProps {
  selectedProvince: Province;
  onSelectProvince: (province: Province) => void;
  language: "id" | "en";
  theme: "dark" | "light";
}

type MetricType = "area" | "population" | "density";

// Detailed, highly representative statistical data for all 38 Indonesian provinces
export const PROVINCE_STATS_DATA: Record<string, { area: number; population: number }> = {
  "aceh": { area: 57956, population: 5300000 },
  "sumut": { area: 72981, population: 14800000 },
  "sumbar": { area: 42013, population: 5500000 },
  "riau": { area: 87023, population: 6400000 },
  "kepri": { area: 8201, population: 2100000 },
  "jambi": { area: 50058, population: 3600000 },
  "sumsel": { area: 91592, population: 8500000 },
  "babel": { area: 16424, population: 1500000 },
  "bengkulu": { area: 19919, population: 2000000 },
  "lampung": { area: 34623, population: 9000000 },
  "banten": { area: 9663, population: 11900000 },
  "jakarta": { area: 664, population: 10600000 },
  "jabar": { area: 35378, population: 49400000 },
  "jateng": { area: 32801, population: 36500000 },
  "yogyakarta": { area: 3133, population: 3700000 },
  "jatim": { area: 47800, population: 40700000 },
  "bali": { area: 5780, population: 4300000 },
  "ntb": { area: 18572, population: 5300000 },
  "ntt": { area: 48718, population: 5400000 },
  "kalbar": { area: 147307, population: 5400000 },
  "kalteng": { area: 153564, population: 2700000 },
  "kalsel": { area: 38744, population: 4100000 },
  "kaltim": { area: 129066, population: 3800000 },
  "kalara": { area: 71176, population: 700000 }, // North Kalimantan / Kaltara
  "sulut": { area: 13852, population: 2600000 },
  "sulbar": { area: 16787, population: 1400000 },
  "sulteng": { area: 61841, population: 3000000 },
  "sultra": { area: 38067, population: 2600000 },
  "sulsel": { area: 46717, population: 9100000 },
  "gorontalo": { area: 11257, population: 1200000 },
  "maluku": { area: 46914, population: 1800000 },
  "malut": { area: 31982, population: 1300000 },
  "papua": { area: 81049, population: 1000000 },
  "papuabar": { area: 60600, population: 560000 },
  "papuapus": { area: 61073, population: 1400000 }, // Papua Tengah
  "papuasel": { area: 117833, population: 520000 }, // Papua Selatan
  "papuapeg": { area: 108476, population: 1430000 }, // Papua Pegunungan
  "papuabaray": { area: 13837, population: 600000 } // Papua Barat Daya
};

export default function ProvinceRanking({
  selectedProvince,
  onSelectProvince,
  language,
  theme
}: ProvinceRankingProps) {
  const isEn = language === "en";
  const [metric, setMetric] = useState<MetricType>("population");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("All");

  // Format big numbers nicely
  const formatValue = (val: number, type: MetricType) => {
    if (type === "area") {
      return `${val.toLocaleString()} km²`;
    } else if (type === "population") {
      if (val >= 1000000) {
        return isEn 
          ? `${(val / 1000000).toFixed(2)} M` 
          : `${(val / 1000000).toFixed(2)} Jt`;
      }
      return val.toLocaleString();
    } else {
      return isEn 
        ? `${val.toFixed(1)} / km²` 
        : `${val.toFixed(1)} jiwa/km²`;
    }
  };

  // Compile full statistical items
  const rankingData = useMemo(() => {
    return PROVINCES.map(prov => {
      const stats = PROVINCE_STATS_DATA[prov.id] || { area: 10000, population: 1000000 };
      const density = stats.population / stats.area;
      
      return {
        province: prov,
        area: stats.area,
        population: stats.population,
        density: density,
        value: metric === "area" ? stats.area : metric === "population" ? stats.population : density
      };
    });
  }, [metric]);

  // Sorted and filtered list
  const sortedAndFilteredData = useMemo(() => {
    let result = [...rankingData];

    // Filter by island/region
    if (selectedIsland !== "All") {
      result = result.filter(item => item.province.island === selectedIsland);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.province.name.toLowerCase().includes(q) || 
        item.province.capital.toLowerCase().includes(q)
      );
    }

    // Sort descending by selected metric value
    return result.sort((a, b) => b.value - a.value);
  }, [rankingData, selectedIsland, searchQuery]);

  // Overall ranks (computed over all 38 provinces for absolute rankings)
  const absoluteRankMap = useMemo(() => {
    const sortedAll = [...rankingData].sort((a, b) => b.value - a.value);
    const ranks: Record<string, number> = {};
    sortedAll.forEach((item, index) => {
      ranks[item.province.id] = index + 1;
    });
    return ranks;
  }, [rankingData]);

  // Chart data: Top 10 from the current filtered set, or if selectedProvince is not in top 10, include it
  const chartData = useMemo(() => {
    const list = [...sortedAndFilteredData];
    const topN = list.slice(0, 10);
    
    // Check if currently selected province is in the top 10
    const selectedInTop = topN.some(item => item.province.id === selectedProvince.id);
    
    // If we have selected province in the filtered list but not in Top 10, append or replace the 10th one
    if (!selectedInTop && list.some(item => item.province.id === selectedProvince.id)) {
      const selectedItem = list.find(item => item.province.id === selectedProvince.id);
      if (selectedItem) {
        if (topN.length >= 10) {
          topN[9] = selectedItem; // replace last with selected
        } else {
          topN.push(selectedItem);
        }
      }
    }

    // Map to recharts friendly structure
    return topN.map(item => ({
      name: item.province.name,
      id: item.province.id,
      value: Math.round(item.value * 10) / 10,
      displayVal: formatValue(item.value, metric),
      color: item.province.color
    })).sort((a, b) => a.value - b.value); // Recharts vertical bar chart displays nicer sorted ascending
  }, [sortedAndFilteredData, selectedProvince.id, metric, isEn]);

  // Active province index or absolute rank
  const activeProvinceRank = absoluteRankMap[selectedProvince.id] || 0;
  const activeProvinceStats = PROVINCE_STATS_DATA[selectedProvince.id] || { area: 0, population: 0 };
  const activeProvinceDensity = activeProvinceStats.population / activeProvinceStats.area;

  return (
    <div className="space-y-6 animate-fadeIn" id="province-ranking-panel">
      {/* Title & Brief Explanation */}
      <div className="flex items-center justify-between border-b pb-4 transition-colors duration-300 border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEn ? "Province Rankings & Metrics" : "Peringkat & Metrik Provinsi"}
            </h3>
            <p className="text-xs text-gray-400">
              {isEn 
                ? "Compare and analyze geographic, demographic, and spatial distributions." 
                : "Bandingkan dan analisis distribusi geografis, demografis, dan spasial."}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Province Floating Micro-Dashboard */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        theme === "dark" 
          ? "bg-white/[0.02] border-white/5 shadow-inner" 
          : "bg-white/60 border-slate-200/60 shadow-sm"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: selectedProvince.color }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: selectedProvince.color }}></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {isEn ? "Selected Focus" : "Fokus Terpilih"}
            </span>
            <span className="text-sm font-bold text-white">
              {selectedProvince.name}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
            theme === "dark" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
          }`}>
            <Award className="w-3.5 h-3.5" />
            {isEn ? `Rank #${activeProvinceRank}` : `Peringkat #${activeProvinceRank}`}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border text-center transition-colors ${theme === "dark" ? "bg-black/20 border-white/5" : "bg-white/40 border-slate-200/40 shadow-sm"}`}>
            <div className="flex justify-center text-emerald-500 mb-1">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-semibold uppercase text-gray-400">
              {isEn ? "Area Size" : "Luas Wilayah"}
            </div>
            <div className="text-xs font-bold text-white">
              {formatValue(activeProvinceStats.area, "area")}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-center transition-colors ${theme === "dark" ? "bg-black/20 border-white/5" : "bg-white/40 border-slate-200/40 shadow-sm"}`}>
            <div className="flex justify-center text-blue-500 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-semibold uppercase text-gray-400">
              {isEn ? "Population" : "Penduduk"}
            </div>
            <div className="text-xs font-bold text-white">
              {formatValue(activeProvinceStats.population, "population")}
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-center transition-colors ${theme === "dark" ? "bg-black/20 border-white/5" : "bg-white/40 border-slate-200/40 shadow-sm"}`}>
            <div className="flex justify-center text-amber-500 mb-1">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-semibold uppercase text-gray-400">
              {isEn ? "Density" : "Kepadatan"}
            </div>
            <div className="text-xs font-bold text-white">
              {formatValue(activeProvinceDensity, "density")}
            </div>
          </div>
        </div>
      </div>

      {/* Control Tabs: Metric Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Metric selection pills */}
        <div className={`flex p-1 rounded-xl border flex-1 transition-all ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/5 border-white/10"}`}>
          <button
            onClick={() => setMetric("population")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              metric === "population"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {isEn ? "Population" : "Penduduk"}
          </button>
          <button
            onClick={() => setMetric("area")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              metric === "area"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {isEn ? "Area" : "Luas"}
          </button>
          <button
            onClick={() => setMetric("density")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              metric === "density"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {isEn ? "Density" : "Kepadatan"}
          </button>
        </div>

        {/* Island filter select */}
        <div className="relative">
          <select
            value={selectedIsland}
            onChange={(e) => setSelectedIsland(e.target.value)}
            className={`w-full sm:w-[160px] py-2 pl-3 pr-8 rounded-xl border text-xs font-semibold outline-none appearance-none transition-all ${
              theme === "dark" 
                ? "bg-neutral-900 border-white/5 text-gray-200 focus:border-indigo-500" 
                : "bg-transparent border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            }`}
          >
            <option value="All" className="bg-neutral-900 text-white">{isEn ? "All Islands" : "Semua Pulau"}</option>
            <option value="Sumatra" className="bg-neutral-900 text-white">Sumatra</option>
            <option value="Jawa" className="bg-neutral-900 text-white">Jawa</option>
            <option value="Kalimantan" className="bg-neutral-900 text-white">Kalimantan</option>
            <option value="Sulawesi" className="bg-neutral-900 text-white">Sulawesi</option>
            <option value="NusaTenggaraBali" className="bg-neutral-900 text-white">{isEn ? "Bali & Nusa Tenggara" : "Nusa Tenggara & Bali"}</option>
            <option value="Maluku" className="bg-neutral-900 text-white">Maluku</option>
            <option value="Papua" className="bg-neutral-900 text-white">Papua</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <SlidersHorizontal className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Chart Visualization Section */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-white/5 border-white/10 shadow-sm"
      }`}>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 transition-colors text-gray-400">
          {isEn ? "Top Provinces Comparison" : "Perbandingan Provinsi Utama"}
        </h4>
        
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">
            {isEn ? "No data fits filters" : "Tidak ada data yang cocok dengan filter"}
          </div>
        ) : (
          <div className="h-[240px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke={theme === "dark" ? "#525252" : "#94a3b8"} 
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke={theme === "dark" ? "#a3a3a3" : "#475569"} 
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  fontSize={10}
                />
                <Tooltip
                  cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isCurrent = data.id === selectedProvince.id;
                      return (
                        <div className={`p-3 rounded-xl border shadow-xl ${
                          theme === "dark" ? "bg-[#090b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                            {data.name}
                            {isCurrent && (
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md font-mono ml-1 font-normal border border-indigo-500/10">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="font-semibold text-indigo-400">{data.displayVal}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {chartData.map((entry, index) => {
                    const isSelected = entry.id === selectedProvince.id;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isSelected ? entry.color : (theme === "dark" ? "rgba(99, 102, 241, 0.35)" : "rgba(99, 102, 241, 0.6)")}
                        stroke={isSelected ? entry.color : "transparent"}
                        strokeWidth={1}
                        style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(99, 102, 241, 0.4))" : "none" }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Interactive List View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest transition-colors text-gray-400">
            {isEn ? `Province Leaderboard (${sortedAndFilteredData.length})` : `Papan Peringkat Provinsi (${sortedAndFilteredData.length})`}
          </h4>
          
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isEn ? "Search province..." : "Cari provinsi..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none w-[150px] sm:w-[180px] transition-all ${
                theme === "dark" 
                  ? "bg-neutral-900 border-white/5 text-gray-200 focus:border-indigo-500 focus:w-[200px]" 
                  : "bg-transparent border-white/10 text-white focus:border-indigo-500 focus:w-[200px] shadow-sm"
              }`}
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-500/10">
          {sortedAndFilteredData.map((item, idx) => {
            const absoluteRank = absoluteRankMap[item.province.id];
            const isSelected = item.province.id === selectedProvince.id;
            
            return (
              <div
                key={item.province.id}
                onClick={() => onSelectProvince(item.province)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? (theme === "dark" ? "bg-indigo-500/10 border-indigo-500/40 shadow-sm" : "bg-indigo-50/10 border-indigo-200/40 shadow-sm")
                    : (theme === "dark" ? "bg-white/[0.02] hover:bg-white/[0.05] border-white/5" : "bg-white/5 hover:bg-white/10 border-white/5 shadow-sm")
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    absoluteRank === 1 
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" 
                      : absoluteRank === 2 
                      ? "bg-slate-400/20 text-slate-400 border border-slate-400/20" 
                      : absoluteRank === 3 
                      ? "bg-amber-700/20 text-amber-700 border border-amber-700/20" 
                      : "bg-white/5 text-gray-400"
                  }`}>
                    {absoluteRank}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold transition-colors flex items-center gap-1.5 text-white">
                      {item.province.name}
                      {isSelected && (
                        <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.province.color }}></span>
                      )}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider font-semibold transition-colors text-gray-400">
                      {item.province.capital} • {item.province.island}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-indigo-400">
                      {formatValue(item.value, metric)}
                    </div>
                    <div className="text-[9px] transition-colors text-gray-400">
                      {metric === "area" ? (isEn ? "Total Area" : "Luas Total") : metric === "population" ? (isEn ? "Resident Pop." : "Penduduk") : (isEn ? "Density" : "Kepadatan")}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? "text-indigo-500" : "text-gray-400"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

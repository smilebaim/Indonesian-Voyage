import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Province, PROVINCES } from "../data/provinces";
import { getProvinceLatLng, PROVINCE_COORDINATES } from "../data/coordinates";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Globe,
  Map as MapIcon,
  Maximize2,
  Compass,
  Play,
  Pause,
  Square,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  X,
  ArrowRight,
  TrendingUp,
  Leaf,
  Music,
  Utensils,
  Filter,
  Target,
  GitCompare,
  BarChart3,
  Users,
  Tag
} from "lucide-react";
import { PROVINCE_STATS_DATA } from "./ProvinceRanking";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

// Helper to generate a realistic real-time weather widget inside the tooltip
const getProvinceWeatherHTML = (provinceId: string, island: string, color: string, isEn: boolean) => {
  const charSum = provinceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 27 + (charSum % 5); // 27 - 31 C
  const humidity = 75 + (charSum % 15); // 75 - 90 %
  const windSpeed = 8 + (charSum % 10); // 8 - 18 km/h

  let weatherLabel = isEn ? "Partly Cloudy" : "Cerah Berawan";
  let weatherEmoji = "⛅";
  let weatherBg = "from-amber-500/10 to-transparent";

  if (island === "Sumatra" || island === "Kalimantan" || island === "Papua") {
    const seed = charSum % 3;
    if (seed === 0) {
      weatherLabel = isEn ? "Rain Showers" : "Hujan Ringan";
      weatherEmoji = "🌦️";
      weatherBg = "from-blue-500/10 to-transparent";
    } else if (seed === 1) {
      weatherLabel = isEn ? "Overcast" : "Mendung";
      weatherEmoji = "☁️";
      weatherBg = "from-gray-500/10 to-transparent";
    }
  } else if (island === "Jawa" || island === "NusaTenggaraBali") {
    const seed = charSum % 3;
    if (seed === 0) {
      weatherLabel = isEn ? "Clear Sky" : "Cerah";
      weatherEmoji = "☀️";
      weatherBg = "from-orange-500/10 to-transparent";
    }
  }

  return `
    <div class="p-2 rounded-xl border border-white/5 bg-gradient-to-r ${weatherBg} flex items-center justify-between text-[10px] text-gray-300">
      <div class="flex items-center gap-1.5">
        <span class="text-base leading-none">${weatherEmoji}</span>
        <div>
          <span class="block font-bold text-white text-[9px] leading-tight">${weatherLabel}</span>
          <span class="text-[7px] text-gray-400 font-mono">${isEn ? "Real-time Weather" : "Cuaca Real-time"}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 font-mono text-[8px]">
        <div class="text-right">
          <span class="block text-white font-bold">${temp}°C</span>
          <span class="text-[6px] text-gray-500 uppercase">${isEn ? "Temp" : "Suhu"}</span>
        </div>
        <div class="border-l border-white/10 h-4.5"></div>
        <div class="text-right">
          <span class="block text-white font-semibold">${humidity}%</span>
          <span class="text-[6px] text-gray-500 uppercase">${isEn ? "Humid" : "Lembap"}</span>
        </div>
        <div class="border-l border-white/10 h-4.5"></div>
        <div class="text-right">
          <span class="block text-white font-semibold">${windSpeed} km/h</span>
          <span class="text-[6px] text-gray-500 uppercase">${isEn ? "Wind" : "Angin"}</span>
        </div>
      </div>
    </div>
  `;
};

// Helper to generate a compact visual index list inside the tooltip
const getProvinceStatsCompactHTML = (provinceId: string, island: string, isEn: boolean) => {
  const id = provinceId;

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
  if (id === "aceh" || id === "sumbar" || id === "bali" || id === "diy" || island === "Papua") cultural = 96;
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

  // 4. Historical Heritage Metric
  let history = 55;
  if (id === "diy" || id === "jateng" || id === "sumbar" || id === "aceh" || id === "bali") history = 97;
  else if (island === "Jawa") history = 92;
  else if (island === "Sumatra") history = 84;
  else if (island === "Maluku") history = 80; // Spice trade history
  else history = 64 + (id.length % 4) * 5;

  return `
    <div class="space-y-1.5 pt-2 border-t border-white/10 text-[9px]">
      <span class="font-bold text-[8px] text-indigo-400 uppercase tracking-wider block">📊 ${isEn ? "Characteristics Index:" : "Indeks Karakteristik Daerah:"}</span>
      <div class="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[8px]">
        <div>
          <div class="flex justify-between mb-0.5 text-gray-400">
            <span>${isEn ? "Biodiversity" : "Hayati"}</span>
            <span class="text-white font-bold">${biodiversity}%</span>
          </div>
          <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full" style="width: ${biodiversity}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-0.5 text-gray-400">
            <span>${isEn ? "Culture" : "Budaya"}</span>
            <span class="text-white font-bold">${cultural}%</span>
          </div>
          <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div class="bg-amber-500 h-full" style="width: ${cultural}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-0.5 text-gray-400">
            <span>${isEn ? "Geography" : "Geografi"}</span>
            <span class="text-white font-bold">${geographic}%</span>
          </div>
          <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div class="bg-sky-500 h-full" style="width: ${geographic}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-0.5 text-gray-400">
            <span>${isEn ? "Heritage" : "Sejarah"}</span>
            <span class="text-white font-bold">${history}%</span>
          </div>
          <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div class="bg-violet-500 h-full" style="width: ${history}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Helper to generate styled tags
const getBadgesHTML = (items: string[], color: string) => {
  return `<div class="flex flex-wrap gap-1 mt-0.5">
    ${items.map(item => `
      <span class="px-1.5 py-0.5 rounded text-[8px] font-medium border" style="background-color: ${color}15; border-color: ${color}30; color: ${color};">
        ${item}
      </span>
    `).join('')}
  </div>`;
};

interface SatelliteMapProps {
  selectedProvince: Province;
  onSelectProvince: (province: Province) => void;
  filteredProvinces: Province[];
  theme?: "dark" | "light";
  language?: "id" | "en";
  showMarkers?: boolean;
  setShowMarkers?: React.Dispatch<React.SetStateAction<boolean>>;
  showRegionLabels?: boolean;
  setShowRegionLabels?: React.Dispatch<React.SetStateAction<boolean>>;
  showRankingsOverlay?: boolean;
  setShowRankingsOverlay?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SatelliteMap({
  selectedProvince,
  onSelectProvince,
  filteredProvinces,
  theme = "dark",
  language = "id",
  showMarkers = true,
  setShowMarkers,
  showRegionLabels = true,
  setShowRegionLabels,
  showRankingsOverlay = false,
  setShowRankingsOverlay,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const isFirstRender = useRef(true);
  const [mapType, setMapType] = useState<"satellite" | "dark" | "street" | "topo">("satellite");
  const [isPanning, setIsPanning] = useState(false);
  const hasUserSelected = useRef(false);
  const initialProvinceIdRef = useRef(selectedProvince.id);

  // Mark selection as true if the selected province ID changes from the initial one
  if (selectedProvince.id !== initialProvinceIdRef.current) {
    hasUserSelected.current = true;
  }

  // Sync Minimalistic map style with main app theme changes
  useEffect(() => {
    if (mapType === "dark" || mapType === "street") {
      setMapType(theme === "dark" ? "dark" : "street");
    }
  }, [theme]);

  // State for the custom interactive summary infobox
  const [infoboxProvince, setInfoboxProvince] = useState<Province | null>(null);

  // Comparison modal states
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareProvA, setCompareProvA] = useState<Province | null>(null);
  const [compareProvB, setCompareProvB] = useState<Province | null>(null);

  // States for Category Marker Filtering
  const [activeFilter, setActiveFilter] = useState<"all" | "nature" | "culture" | "culinary">("all");
  const [markerFilterMode, setMarkerFilterMode] = useState<"dim" | "hide">("dim");
  const [clusterTrigger, setClusterTrigger] = useState(0);

  // Keep infobox synced with the selected province to ensure beautiful immediate feedback
  useEffect(() => {
    setInfoboxProvince(selectedProvince);
  }, [selectedProvince]);

  const [scanActive, setScanActive] = useState(false);

  // Trigger brief holographic sweep animation on province change to simulate satellite telemetry calibration
  useEffect(() => {
    setScanActive(true);
    const timer = setTimeout(() => {
      setScanActive(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [selectedProvince.id]);

  // Helper to calculate statistics dynamically for any given province
  const getProvinceStats = (p: Province) => {
    const id = p.id;
    const island = p.island;

    let biodiversity = 60;
    if (island === "Papua") biodiversity = 96;
    else if (island === "Kalimantan") biodiversity = 92;
    else if (island === "Sumatra") biodiversity = 88;
    else if (island === "Sulawesi") biodiversity = 84;
    else if (id === "bali" || island === "NusaTenggaraBali") biodiversity = 78;
    else if (island === "Maluku") biodiversity = 82;
    else biodiversity = 65 + (id.length % 5) * 3;

    let cultural = 70;
    if (id === "aceh" || id === "sumbar" || id === "bali" || id === "diy" || island === "Papua") cultural = 96;
    else if (island === "Jawa" || island === "Sumatra") cultural = 88;
    else if (island === "NusaTenggaraBali") cultural = 85;
    else if (island === "Sulawesi") cultural = 82;
    else cultural = 72 + (id.charCodeAt(0) % 6) * 3;

    let geographic = 65;
    if (island === "Maluku" || island === "NusaTenggaraBali" || id === "kepri") geographic = 94;
    else if (island === "Papua" || island === "Sulawesi") geographic = 90;
    else if (island === "Sumatra" || island === "Jawa") geographic = 85;
    else geographic = 72 + (id.length % 7) * 3;

    let history = 55;
    if (id === "diy" || id === "jateng" || id === "sumbar" || id === "aceh" || id === "bali") history = 97;
    else if (island === "Jawa") history = 92;
    else if (island === "Sumatra") history = 84;
    else if (island === "Maluku") history = 80;
    else history = 64 + (id.length % 4) * 5;

    return { biodiversity, cultural, geographic, history };
  };

  const getComparisonRatio = (valA: number, valB: number, labelA: string, labelB: string, isEn: boolean) => {
    if (!valA || !valB) return "";
    if (valA === valB) {
      return isEn ? "Both have the same value" : "Keduanya memiliki nilai yang sama";
    }
    const ratio = valA > valB ? valA / valB : valB / valA;
    const largerName = valA > valB ? labelA : labelB;
    const smallerName = valA > valB ? labelB : labelA;
    const formattedRatio = ratio.toFixed(1);
    
    if (isEn) {
      return `${largerName} is ${formattedRatio}x larger/higher than ${smallerName}`;
    } else {
      return `${largerName} ${formattedRatio}x lebih besar/tinggi dibanding ${smallerName}`;
    }
  };

  // Helper to determine if a province fits the selected category filter
  const isProvinceInFilter = (province: Province, filter: "all" | "nature" | "culture" | "culinary") => {
    if (filter === "all") return true;

    const stats = getProvinceStats(province);

    if (filter === "nature") {
      const hasNatureLandmarks = province.tourism.some(t => 
        /taman nasional|gunung|danau|laut|pulau|pantai|bukit|orangutan|komodo|raja ampat|kawah|hutan|air terjun|cagar alam|sungai|pemandian/i.test(t)
      );
      return stats.biodiversity >= 80 || hasNatureLandmarks;
    }

    if (filter === "culture") {
      const hasCultureSites = province.culture.some(c => 
        /tari|upacara|rumah adat|candi|masjid|istana|benteng|keraton|makam|kain|batik|tenun|tradisi|museum/i.test(c)
      ) || province.tourism.some(t => 
        /candi|masjid|istana|benteng|keraton|makam|museum/i.test(t)
      );
      return stats.cultural >= 80 || stats.history >= 80 || hasCultureSites;
    }

    if (filter === "culinary") {
      return province.culinary.length > 0;
    }

    return true;
  };

  // Interactive Tour States
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(true);
  const [tourProgress, setTourProgress] = useState(0);
  const tourMarkerRef = useRef<L.Marker | null>(null);

  // Tile layers URLs
  const tileLayers = {
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}.png",
    street: "https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png",
    topo: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  };

  const attributions = {
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    dark: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
    street: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    topo: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
  };

  const activeLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered on Indonesia
    const indonesiaCentroid: [number, number] = [-2.5489, 118.0149];
    const map = L.map(mapContainerRef.current, {
      center: indonesiaCentroid,
      zoom: 5,
      zoomControl: false, // Customized position
      attributionControl: false, // Completely remove the attribution control overlay
      minZoom: 4,
      maxZoom: 15,
    });

    mapRef.current = map;

    // Zoom controls are disabled for a cleaner fullscreen experience


    // Initial tile layer
    const baseLayer = L.tileLayer(tileLayers[mapType], {
      attribution: attributions[mapType],
      maxZoom: 18,
    }).addTo(map);

    activeLayerRef.current = baseLayer;

    // Track movement state to display elegant targeting HUD
    const handleMoveStart = () => {
      setIsPanning(true);
    };

    const handleMoveEnd = () => {
      setIsPanning(false);
    };

    const handleZoomOrMove = () => {
      setClusterTrigger(prev => prev + 1);
    };

    map.on("movestart", handleMoveStart);
    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleZoomOrMove);
    map.on("moveend", handleZoomOrMove);

    // Trigger immediate resize recalculation to ensure container sizing is flawless
    const resizeTimeout = setTimeout(() => {
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize();
        } catch (e) {
          console.warn("Failed to invalidate map size safely", e);
        }
      }
    }, 400);

    return () => {
      clearTimeout(resizeTimeout);
      if (mapRef.current) {
        mapRef.current.off("movestart", handleMoveStart);
        mapRef.current.off("moveend", handleMoveEnd);
        mapRef.current.off("zoomend", handleZoomOrMove);
        mapRef.current.off("moveend", handleZoomOrMove);
        try {
          if (tourMarkerRef.current && mapRef.current.hasLayer(tourMarkerRef.current)) {
            mapRef.current.removeLayer(tourMarkerRef.current);
          }
          mapRef.current.remove();
        } catch (e) {
          console.warn("Failed to remove map safely", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapType state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeLayerRef.current) {
      map.removeLayer(activeLayerRef.current);
    }

    const newLayer = L.tileLayer(tileLayers[mapType], {
      attribution: attributions[mapType],
      maxZoom: 18,
    }).addTo(map);

    activeLayerRef.current = newLayer;
  }, [mapType]);

  // Update markers on the map when filteredProvinces, selectedProvince, activeFilter, markerFilterMode, isTourActive, or clusterTrigger changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers safely
    Object.values(markersRef.current).forEach((marker: any) => {
      try {
        if (map.hasLayer(marker)) {
          marker.closeTooltip();
          map.removeLayer(marker);
        }
      } catch (e) {
        console.warn("Failed to remove marker", e);
      }
    });
    markersRef.current = {};

    if (!showMarkers) return;

    // Split filteredProvinces into selectedProvince (which should ALWAYS remain a high-visibility, unclustered individual marker) and others
    const selectedInFiltered = filteredProvinces.find(p => p.id === selectedProvince.id);
    const provincesToCluster = filteredProvinces.filter(p => p.id !== selectedProvince.id);

    // List of nodes to be rendered on the map
    const itemsToRender: (
      | { type: "individual"; province: Province }
      | { type: "cluster"; id: string; lat: number; lng: number; provinces: Province[] }
    )[] = [];

    // Guarantee that the selected active province is rendered individually so the user can always see it
    if (selectedInFiltered) {
      itemsToRender.push({ type: "individual", province: selectedInFiltered });
    }

    // Interactive cluster buckets based on current projected screen-pixel coordinates
    const clusters: { id: string; lat: number; lng: number; provinces: Province[] }[] = [];
    const CLUSTER_RADIUS_PX = 60; // Cluster grouping threshold in pixels

    provincesToCluster.forEach((province) => {
      const coords = getProvinceLatLng(province.id);
      const matchesFilter = isTourActive || isProvinceInFilter(province, activeFilter);

      // Skip rendering if filtered out in "hide" mode
      if (!matchesFilter && markerFilterMode === "hide") {
        return;
      }

      let pt: L.Point | null = null;
      try {
        pt = map.latLngToContainerPoint([coords.lat, coords.lng]);
      } catch (e) {
        // Fallback if container size projection isn't initialized yet
      }

      let addedToCluster = false;
      if (pt) {
        for (const cluster of clusters) {
          try {
            const clusterPt = map.latLngToContainerPoint([cluster.lat, cluster.lng]);
            if (pt.distanceTo(clusterPt) < CLUSTER_RADIUS_PX) {
              cluster.provinces.push(province);
              // Calculate new rolling centroid coordinates
              const len = cluster.provinces.length;
              cluster.lat = (cluster.lat * (len - 1) + coords.lat) / len;
              cluster.lng = (cluster.lng * (len - 1) + coords.lng) / len;
              addedToCluster = true;
              break;
            }
          } catch (e) {
            // Fallback
          }
        }
      }

      if (!addedToCluster) {
        clusters.push({
          id: province.id,
          lat: coords.lat,
          lng: coords.lng,
          provinces: [province],
        });
      }
    });

    // Distribute clusters with multiple items, and promote single-item clusters to standard markers
    clusters.forEach((cluster) => {
      if (cluster.provinces.length > 1) {
        itemsToRender.push({
          type: "cluster",
          id: cluster.id,
          lat: cluster.lat,
          lng: cluster.lng,
          provinces: cluster.provinces,
        });
      } else if (cluster.provinces.length === 1) {
        itemsToRender.push({
          type: "individual",
          province: cluster.provinces[0],
        });
      }
    });

    // Draw all items to the map
    itemsToRender.forEach((item) => {
      if (item.type === "individual") {
        const province = item.province;
        const coords = getProvinceLatLng(province.id);
        const isSelected = province.id === selectedProvince.id;
        const matchesFilter = isTourActive || isProvinceInFilter(province, activeFilter);

        const opacityClass = matchesFilter ? "opacity-100" : "opacity-30 scale-90";
        const hoverEffect = "";

        // Create beautiful premium custom HTML marker with color coding and opacity rules
        const markerHtml = `
          <div class="relative flex items-center justify-center pointer-events-none transition-all duration-300 ${opacityClass}" style="width: 40px; height: 40px;">
            ${
              isSelected && matchesFilter
                ? `
              <div class="absolute inset-0 rounded-full animate-ping opacity-70" style="background-color: ${province.color}; margin: 2px;"></div>
              <div class="absolute inset-2 rounded-full animate-pulse opacity-40" style="background-color: ${province.color};"></div>
              `
                : ""
            }
            <div class="absolute rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              isSelected
                ? "w-5 h-5 bg-white border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,1)]"
                : `w-4 h-4 bg-black/80 border-opacity-80 scale-100 ${hoverEffect}`
            }" style="border-color: ${province.color}">
              <div class="rounded-full ${
                isSelected ? "w-2.5 h-2.5 bg-black" : "w-2 h-2"
              }" style="${!isSelected ? `background-color: ${province.color}` : ""}"></div>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([coords.lat, coords.lng], { 
          icon: customIcon,
          opacity: matchesFilter ? 1.0 : 0.35 
        })
          .addTo(map)
          .on("click", () => {
            hasUserSelected.current = true;
            onSelectProvince(province);
            setInfoboxProvince(province);
          });

        // Bind interactive tooltip with rich additional information from the left panel
        const tooltipContent = `
          <div class="p-3.5 bg-slate-950/98 text-white border border-white/10 rounded-2xl text-[10px] font-sans w-[350px] shadow-2xl space-y-2.5 pointer-events-none animate-fadeIn">
            <!-- Header with name and region -->
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full animate-pulse" style="background-color: ${province.color}; box-shadow: 0 0 8px ${province.color};"></span>
                <span class="font-extrabold text-xs tracking-tight text-white">${province.name}</span>
              </div>
              <span class="text-[8px] uppercase font-mono tracking-widest bg-white/5 border border-white/15 px-1.5 py-0.5 rounded text-gray-300">
                ${province.island === "NusaTenggaraBali" ? "Bali & Nusa Tenggara" : province.island}
              </span>
            </div>

            <!-- Capital and Coords -->
            <div class="text-[9px] text-gray-400 flex items-center justify-between">
              <span>${language === "en" ? "Capital" : "Ibu Kota"}: <strong class="text-white">${province.capital}</strong></span>
              <span class="text-[8px] font-mono text-gray-500">${province.coords.x}° E, ${province.coords.y}° S</span>
            </div>

            <!-- Description -->
            <p class="text-[9.5px] text-gray-300 leading-relaxed italic border-l-2 pl-2" style="border-color: ${province.color}">
              "${province.description}"
            </p>

            <!-- Weather Display -->
            ${getProvinceWeatherHTML(province.id, province.island, province.color, language === "en")}

            <!-- Stats Progress Indicators -->
            ${getProvinceStatsCompactHTML(province.id, province.island, language === "en")}

            <!-- Key Facts & History -->
            <div class="space-y-1 pt-2.5 border-t border-white/10">
              <span class="font-bold text-[8px] text-blue-400 uppercase tracking-wider block">💡 ${language === "en" ? "Key Facts & History:" : "Fakta Menarik & Sejarah:"}</span>
              <ul class="list-disc pl-3 text-[9px] text-gray-300 space-y-0.5">
                ${province.facts.map(fact => `<li>${fact}</li>`).join('')}
              </ul>
            </div>

            <!-- Detailed Recommendations Section -->
            <div class="space-y-2 pt-2.5 border-t border-white/10 text-[9px]">
              <div>
                <span class="font-bold text-emerald-400 uppercase tracking-wider block text-[8px]">📍 ${language === "en" ? "Top Destinations:" : "Destinasi Wisata Utama:"}</span>
                ${getBadgesHTML(province.tourism, "#10b981")}
              </div>
              <div>
                <span class="font-bold text-amber-400 uppercase tracking-wider block text-[8px]">🕌 ${language === "en" ? "Cultural Heritages:" : "Seni Budaya & Warisan:"}</span>
                ${getBadgesHTML(province.culture, "#f59e0b")}
              </div>
              <div>
                <span class="font-bold text-rose-400 uppercase tracking-wider block text-[8px]">🍜 ${language === "en" ? "Culinary Specialties:" : "Kuliner Khas Daerah:"}</span>
                ${getBadgesHTML(province.culinary, "#f43f5e")}
              </div>
            </div>
          </div>
        `;

        // marker.bindTooltip(tooltipContent, {
        //   direction: "right",
        //   offset: [15, 0],
        //   opacity: 0.95,
        //   className: "custom-tooltip-wrapper",
        // });

        markersRef.current[province.id] = marker;
      } else {
        // Render Cluster Marker!
        const cluster = item;
        const dominantColor = cluster.provinces[0].color;
        
        // Custom HTML for Cluster Marker with glassmorphism + dominant glow effects
        const clusterHtml = `
          <div class="relative flex items-center justify-center pointer-events-none transition-all duration-300" style="width: 50px; height: 50px;">
            <!-- Double outer glowing pulsing rings representing area group -->
            <div class="absolute inset-0 rounded-full animate-ping opacity-25" style="background-color: ${dominantColor}; margin: 4px;"></div>
            <div class="absolute inset-2 rounded-full animate-pulse opacity-15" style="background-color: ${dominantColor};"></div>
            
            <!-- Glassmorphic central bubble -->
            <div class="absolute w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10.5px] font-extrabold tracking-tighter shadow-2xl transition-all duration-300" 
                 style="border-color: ${dominantColor}; background: ${theme === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'}; color: ${theme === 'dark' ? '#f8fafc' : '#0f172a'}; box-shadow: 0 0 14px ${dominantColor}40">
              ${cluster.provinces.length}
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "custom-leaflet-cluster-marker",
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        });

        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: clusterIcon,
        })
          .addTo(map)
          .on("click", () => {
            // Smoothly fly to bounds containing all the provinces in this cluster
            const bounds = L.latLngBounds(cluster.provinces.map(p => {
              const c = getProvinceLatLng(p.id);
              return L.latLng(c.lat, c.lng);
            }));
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
          });

        // Rich Tooltip content for Cluster showing containing provinces
        const tooltipContent = `
          <div class="p-3 bg-slate-950/98 text-white border border-white/10 rounded-2xl text-[10px] font-sans w-[240px] shadow-2xl space-y-2 pointer-events-none animate-fadeIn">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" style="box-shadow: 0 0 8px #3b82f6;"></span>
                <span class="font-extrabold text-xs tracking-tight text-white">
                  ${language === "en" ? `${cluster.provinces.length} Provinces` : `${cluster.provinces.length} Provinsi`}
                </span>
              </div>
              <span class="text-[8px] uppercase font-mono tracking-widest bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-400">
                Cluster
              </span>
            </div>
            
            <ul class="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              ${cluster.provinces.map(p => `
                <li class="flex items-center justify-between text-[9px] text-gray-300">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${p.color}"></span>
                    <span class="font-medium">${p.name}</span>
                  </div>
                  <span class="text-[8px] text-gray-500 font-mono">${p.capital}</span>
                </li>
              `).join('')}
            </ul>
            
            <div class="text-[8px] text-blue-400 font-bold border-t border-white/5 pt-1.5 text-center flex items-center justify-center gap-1">
              <span>🔍</span>
              <span>${language === "en" ? "CLICK TO ZOOM IN" : "KLIK UNTUK MEMPERBESAR"}</span>
            </div>
          </div>
        `;

        // marker.bindTooltip(tooltipContent, {
        //   direction: "right",
        //   offset: [15, 0],
        //   opacity: 0.95,
        //   className: "custom-tooltip-wrapper",
        // });

        // Store first province's ID as the key for clean tracking
        markersRef.current[cluster.id] = marker;
      }
    });
  }, [filteredProvinces, selectedProvince.id, language, showMarkers, activeFilter, markerFilterMode, isTourActive, clusterTrigger]);

  // Handle auto-panning / zooming (flyTo) to the selected province with smooth dynamic curves
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const coords = getProvinceLatLng(selectedProvince.id);
    const zoomLevel = selectedProvince.island === "NusaTenggaraBali" || selectedProvince.island === "Maluku" ? 7 : 6;

    // Calculate distance to determine natural pacing
    const currentCenter = map.getCenter();
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dLat = lat2 - lat1;
      const dLng = lng2 - lng1;
      return Math.sqrt(dLat * dLat + dLng * dLng);
    };
    const distance = calculateDistance(currentCenter.lat, currentCenter.lng, coords.lat, coords.lng);

    // Only animate if the coordinates actually differ and the user has made a selection
    if (distance > 0.001 && hasUserSelected.current) {
      // Scale duration between 1.1s (nearby) and 2.4s (across the whole country)
      const duration = Math.min(2.4, Math.max(1.1, 1.1 + (distance / 25) * 1.3));

      map.flyTo([coords.lat, coords.lng], zoomLevel, {
        animate: true,
        duration: duration,
        easeLinearity: 0.18, // Curved easing for a premium fluid swoop
      });
    }

    // Automatically open the tooltip of the selected province safely (except on initial load until a user selection occurs)
    let tooltipTimeout: NodeJS.Timeout | null = null;
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (hasUserSelected.current) {
      const marker = markersRef.current[selectedProvince.id];
      if (marker && showMarkers) {
        tooltipTimeout = setTimeout(() => {
          if (mapRef.current && mapRef.current.hasLayer(marker) && marker.getElement()) {
            try {
              marker.openTooltip();
            } catch (e) {
              console.warn("Failed to open tooltip safely", e);
            }
          }
        }, 1200);
      }
    }

    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [selectedProvince.id, showMarkers]);

  // Helper to generate a contextual description based on spot name
  const getSpotDescription = (name: string, provinceName: string) => {
    const isWater = /pantai|pulau|laut|danau|teluk|sungai|air/i.test(name);
    const isMountain = /gunung|bukit|taman nasional|hutan|kawah|lembah/i.test(name);
    const isHeritage = /masjid|candi|istana|gereja|pura|situs|tugu|benteng|makam/i.test(name);
    const isMuseum = /museum|monumen/i.test(name);

    if (isWater) {
      return `Nikmati keindahan pesona wisata bahari yang eksotis di ${name}. Tempat ini menawarkan panorama perairan yang jernih, pepohonan rindang di pesisir, dan sunset menakjubkan yang menjadi salah satu andalan wisata di Provinsi ${provinceName}.`;
    } else if (isMountain) {
      return `Saksikan kemegahan alam pegunungan yang asri dan udara segar menyejukkan di kawasan ${name}. Surga petualangan luar ruangan ini kaya akan keanekaragaman hayati khas nusantara di Provinsi ${provinceName}.`;
    } else if (isHeritage) {
      return `Kunjungi ${name}, sebuah situs cagar budaya bersejarah yang memancarkan pesona arsitektur klasik bernilai seni tinggi, sarat dengan peninggalan sejarah dan nilai luhur adat istiadat di Provinsi ${provinceName}.`;
    } else if (isMuseum) {
      return `Pelajari koleksi benda bersejarah, artefak berharga, serta kisah perjuangan masa lalu di ${name}. Destinasi edukatif terbaik untuk mengenal akar kebudayaan di Provinsi ${provinceName}.`;
    } else {
      return `Destinasi wisata ikonik ${name} menyuguhkan pesona keindahan alam, budaya lokal yang ramah, serta berbagai spot menarik yang wajib dikunjungi selama menjelajahi Provinsi ${provinceName}.`;
    }
  };

  // Reset tour index and progress when province changes
  useEffect(() => {
    setTourIndex(0);
    setTourProgress(0);
  }, [selectedProvince.id]);

  // Handle auto-play progression for the Tour
  useEffect(() => {
    if (!isTourActive || !isTourPlaying) {
      setTourProgress(0);
      return;
    }

    const intervalTime = 100; // update progress every 100ms
    const totalDuration = 7000; // 7 seconds per spot
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setTourProgress((prev) => {
        if (prev >= 100) {
          // Move to next spot
          const spots = selectedProvince.tourism || [];
          if (spots.length > 0) {
            setTourIndex((currentIndex) => (currentIndex + 1) % spots.length);
          }
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isTourActive, isTourPlaying, tourIndex, selectedProvince.tourism]);

  // Setup Tour location fly-to and leaflet marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isTourActive) {
      // Clean up tour marker when deactivated
      if (tourMarkerRef.current) {
        try {
          if (map && map.hasLayer(tourMarkerRef.current)) {
            map.removeLayer(tourMarkerRef.current);
          }
        } catch (e) {
          console.warn("Failed to remove tour marker", e);
        }
        tourMarkerRef.current = null;
      }
      return;
    }

    const spots = selectedProvince.tourism || [];
    if (spots.length === 0) return;

    const currentSpot = spots[tourIndex];
    const baseCoords = getProvinceLatLng(selectedProvince.id);

    // Calculate slight offsets around the center
    const latOffset = tourIndex === 0 ? 0.08 : tourIndex === 1 ? -0.06 : 0.04;
    const lngOffset = tourIndex === 0 ? -0.12 : tourIndex === 1 ? 0.14 : 0.06;

    const spotCoords = {
      lat: baseCoords.lat + latOffset,
      lng: baseCoords.lng + lngOffset,
    };

    // Close default province tooltips/popups
    map.closePopup();

    // Fly to the active spot at deep zoom
    map.flyTo([spotCoords.lat, spotCoords.lng], 11, {
      animate: true,
      duration: 1.8,
    });

    // Clean up previous tour marker
    if (tourMarkerRef.current) {
      try {
        if (map.hasLayer(tourMarkerRef.current)) {
          map.removeLayer(tourMarkerRef.current);
        }
      } catch (e) {
        console.warn("Failed to remove tour marker", e);
      }
      tourMarkerRef.current = null;
    }

    // Custom pulsing marker for tour
    const tourIconHtml = `
      <div class="relative flex items-center justify-center pointer-events-none" style="width: 50px; height: 50px;">
        <div class="absolute inset-0 rounded-full animate-ping opacity-60 bg-amber-400"></div>
        <div class="absolute inset-3 rounded-full animate-pulse opacity-30 bg-amber-400"></div>
        <div class="absolute w-6 h-6 rounded-full bg-black/90 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-amber-400">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `;

    const tourIcon = L.divIcon({
      html: tourIconHtml,
      className: "custom-tour-leaflet-marker",
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });

    const marker = L.marker([spotCoords.lat, spotCoords.lng], { icon: tourIcon }).addTo(map);
    tourMarkerRef.current = marker;

    const popupContent = `
      <div class="px-3 py-2 bg-black/95 text-white border border-amber-500/30 rounded-xl font-sans max-w-[200px] shadow-2xl">
        <div class="text-[9px] font-bold text-amber-400 tracking-wider uppercase mb-0.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          Destinasi Tur ${tourIndex + 1} dari ${spots.length}
        </div>
        <div class="font-extrabold text-xs text-white mb-0.5 tracking-tight leading-tight">${currentSpot}</div>
        <div class="text-[9px] text-gray-400 leading-normal">Provinsi ${selectedProvince.name}</div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      offset: [0, -10],
      closeButton: false,
      className: "custom-popup-wrapper",
    });

    const popupTimeout = setTimeout(() => {
      if (mapRef.current && mapRef.current.hasLayer(marker)) {
        try {
          marker.openPopup();
        } catch (e) {
          console.warn("Failed to open tour popup safely", e);
        }
      }
    }, 1800);

    return () => {
      clearTimeout(popupTimeout);
    };
  }, [selectedProvince.id, isTourActive, tourIndex]);

  const getProvinceWeather = (provinceId: string, island: string) => {
    const charSum = provinceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const temp = 27 + (charSum % 5); // 27 - 31 C
    const humidity = 75 + (charSum % 15); // 75 - 90 %
    const windSpeed = 8 + (charSum % 10); // 8 - 18 km/h

    let weatherLabel = language === "en" ? "Partly Cloudy" : "Cerah Berawan";
    let weatherEmoji = "⛅";

    if (island === "Sumatra" || island === "Kalimantan" || island === "Papua") {
      const seed = charSum % 3;
      if (seed === 0) {
        weatherLabel = language === "en" ? "Rain Showers" : "Hujan Ringan";
        weatherEmoji = "🌦️";
      } else if (seed === 1) {
        weatherLabel = language === "en" ? "Overcast" : "Mendung";
        weatherEmoji = "☁️";
      }
    } else if (island === "Jawa" || island === "NusaTenggaraBali") {
      const seed = charSum % 3;
      if (seed === 0) {
        weatherLabel = language === "en" ? "Clear Sky" : "Cerah";
        weatherEmoji = "☀️";
      }
    }

    return { temp, humidity, windSpeed, weatherLabel, weatherEmoji };
  };

  const zoomToFitIndonesia = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([-2.5489, 118.0149], 5, {
      animate: true,
      duration: 1.2,
    });
  };

  const focusOnActiveProvince = () => {
    const map = mapRef.current;
    if (!map) return;

    // Mark that the user has actively selected
    hasUserSelected.current = true;

    const coords = getProvinceLatLng(selectedProvince.id);
    const zoomLevel = selectedProvince.island === "NusaTenggaraBali" || selectedProvince.island === "Maluku" ? 7 : 6;

    map.closePopup();

    map.flyTo([coords.lat, coords.lng], zoomLevel, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.18,
    });

    // Also try to open its tooltip after a delay
    const marker = markersRef.current[selectedProvince.id];
    if (marker && showMarkers) {
      setTimeout(() => {
        if (mapRef.current && mapRef.current.hasLayer(marker) && marker.getElement()) {
          try {
            marker.openTooltip();
          } catch (e) {
            console.warn("Failed to open tooltip safely", e);
          }
        }
      }, 1200);
    }
  };

  return (
    <div 
      onMouseDown={() => { hasUserSelected.current = true; }}
      onTouchStart={() => { hasUserSelected.current = true; }}
      className={`relative w-full h-full overflow-hidden shadow-inner group/map-widget transition-all duration-300 ${theme === "dark" ? "bg-[#050608]" : "bg-slate-100"}`}
    >
      
      {/* CAMERA PANNING TELEMETRY RETICLE HUD */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 z-[399] ${
          isPanning ? "opacity-100 scale-100 bg-black/15" : "opacity-0 scale-105 pointer-events-none"
        }`}
      >
        {/* Soft scanline grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-80" />
        
        {/* Futuristic Target Corner Brackets */}
        <div className="absolute inset-8 border border-white/5 rounded-2xl transition-all duration-1000">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/40 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/40 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/40 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/40 rounded-br-lg" />
        </div>
        
        {/* Center Targeting Reticle */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute w-8 h-[1px] bg-blue-500/40" />
          <div className="absolute h-8 w-[1px] bg-blue-500/40" />
          <div className="w-10 h-10 rounded-full border border-blue-400/25 animate-pulse" />
          <div className="absolute w-12 h-12 rounded-full border border-dashed border-blue-500/10 animate-[spin_20s_linear_infinite]" />
        </div>Message

        {/* Floating Telemetry Flight Label */}
        <div className={`hidden sm:flex absolute bottom-16 left-[68px] px-4 py-2 backdrop-blur-3xl rounded-full items-center gap-2.5 text-xs font-medium tracking-wide shadow-2xl animate-bounce border transition-all duration-300 ${theme === "dark" ? "bg-black/65 border-white/25 text-gray-300" : "bg-white/30 border-white/40 text-slate-700 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]"}`}>
          <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Fokus Kamera:</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProvince.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5"
            >
              <span className={`font-bold uppercase transition-colors duration-300 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{selectedProvince.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-blue-500 font-mono text-[10px]">{selectedProvince.capital}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MAP CONTROLLER SWITCHER overlays */}
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 md:left-4 z-[400] flex flex-col items-center gap-1 backdrop-blur-3xl p-1 rounded-xl border transition-all duration-300 ${
        theme === "dark" 
          ? "bg-black/10 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
          : "bg-white/15 border-white/25 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"
      }`}>
        <button
          onClick={() => setMapType("satellite")}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            mapType === "satellite"
              ? "bg-blue-600 text-white"
              : (theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
          }`}
          title={language === "en" ? "Satellite view" : "Tampilan Satelit"}
        >
          <Globe className="w-3.5 h-3.5" />
        </button>
        
        <button
          onClick={() => setMapType("topo")}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            mapType === "topo"
              ? "bg-blue-600 text-white"
              : (theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
          }`}
          title={language === "en" ? "Terrain view" : "Tampilan Terrain"}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>


        <div className={`w-4 h-[1px] my-0.5 transition-colors duration-300 ${theme === "dark" ? "bg-white/10" : "bg-slate-200"}`} />

        <button
          onClick={() => {
            setIsTourActive(prev => !prev);
            setIsTourPlaying(true);
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isTourActive
              ? "bg-amber-500 text-black font-extrabold hover:bg-amber-400 shadow-sm"
              : "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
          }`}
          title={language === "en" ? "Virtual Tour" : "Tur Virtual"}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isTourActive ? "animate-pulse" : ""}`} />
        </button>

        <button
          onClick={zoomToFitIndonesia}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            theme === "dark" 
              ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" 
              : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          }`}
          title={language === "en" ? "Fit Entire Indonesia" : "Fokus Seluruh Indonesia"}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {setShowMarkers && (
          <>
            <div className={`w-4 h-[1px] my-0.5 transition-colors duration-300 ${theme === "dark" ? "bg-white/10" : "bg-slate-200"}`} />
            <button
              onClick={() => setShowMarkers(prev => !prev)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                showMarkers
                  ? theme === "dark"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25"
                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={language === "en" ? (showMarkers ? "Hide Markers" : "Show Markers") : (showMarkers ? "Sembunyikan Pin" : "Tampilkan Pin")}
            >
              <MapPin className={`w-3.5 h-3.5 ${showMarkers ? "animate-pulse" : ""}`} />
            </button>
          </>
        )}
      </div>

      {/* CATEGORY MARKER FILTERS REMOVED */}

      {/* INTERACTIVE TOUR HUD CARD */}
      <AnimatePresence mode="wait">
        {isTourActive && selectedProvince.tourism && selectedProvince.tourism.length > 0 && (
          <motion.div
            key={`tour-hud-${selectedProvince.id}-${tourIndex}`}
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`absolute bottom-16 right-14 z-[400] max-w-[320px] w-[calc(100%-4.5rem)] backdrop-blur-3xl rounded-2xl overflow-hidden p-4 flex flex-col gap-2.5 border transition-all duration-300 ${theme === "dark" ? "bg-black/65 border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)]" : "bg-white/30 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]"}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-2 transition-colors duration-300 ${theme === "dark" ? "border-white/10" : "border-slate-100"}`}>
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />
                <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
                  Tur Virtual {selectedProvince.name}
                </span>
              </div>
              <span className="text-[9px] bg-amber-500/10 text-amber-500 font-mono px-2 py-0.5 rounded-full border border-amber-500/10">
                {tourIndex + 1} / {selectedProvince.tourism.length}
              </span>
            </div>

            {/* Location Info */}
            <div>
              <h3 className={`text-xs font-black flex items-center gap-1.5 mb-1 truncate transition-colors duration-300 ${theme === "dark" ? "text-white" : "text-slate-800"}`} title={selectedProvince.tourism[tourIndex]}>
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {selectedProvince.tourism[tourIndex]}
              </h3>
              <p className={`text-[10px] leading-relaxed font-sans line-clamp-3 transition-colors duration-300 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                {getSpotDescription(selectedProvince.tourism[tourIndex], selectedProvince.name)}
              </p>
            </div>

            {/* Control Bar */}
            <div className={`flex items-center justify-between mt-1 pt-2 border-t transition-colors duration-300 ${theme === "dark" ? "border-white/5" : "border-slate-100"}`}>
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsTourPlaying(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${theme === "dark" ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"}`}
              >
                {isTourPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span>Putar</span>
                  </>
                )}
              </button>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setTourIndex(prev => (prev - 1 + selectedProvince.tourism.length) % selectedProvince.tourism.length);
                    setTourProgress(0);
                  }}
                  className={`p-1 rounded-lg transition-all border ${theme === "dark" ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"}`}
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTourIndex(prev => (prev + 1) % selectedProvince.tourism.length);
                    setTourProgress(0);
                  }}
                  className={`p-1 rounded-lg transition-all border ${theme === "dark" ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"}`}
                  title="Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsTourActive(false);
                  }}
                  className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all"
                  title="Keluar Tur"
                >
                  <Square className="w-3.5 h-3.5 fill-red-500" />
                </button>
              </div>
            </div>

            {/* Countdown progress line */}
            {isTourPlaying && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-100 ease-linear animate-pulse" style={{ width: `${tourProgress}%` }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM INFOBOX FOR SELECTED PROVINCE REMOVED */}

      {/* HOLOGRAPHIC SENSOR SWEEP OVERLAY ON NAVIGATION */}
      <AnimatePresence>
        {scanActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0.45, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
            className="absolute inset-0 z-[398] pointer-events-none overflow-hidden"
          >
            {/* Soft tint of the selected province color */}
            <div 
              className="absolute inset-0 transition-colors duration-500 mix-blend-color" 
              style={{ backgroundColor: `${selectedProvince.color}15` }} 
            />
            {/* Laser scanning line sweeping down */}
            <motion.div
              initial={{ y: "-10%" }}
              animate={{ y: "110%" }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1.5 opacity-80"
              style={{
                background: `linear-gradient(90deg, transparent, ${selectedProvince.color}, transparent)`,
                boxShadow: `0 0 15px ${selectedProvince.color}, 0 0 30px ${selectedProvince.color}`
              }}
            />
            {/* Secondary subtle scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_2px,transparent_2px)] bg-[size:100%_4px] opacity-70 animate-[pulse_0.5s_infinite_alternate]" />
          </motion.div>
        )}
      </AnimatePresence>



      {/* SIDE-BY-SIDE COMPARATIVE MODAL */}
      <AnimatePresence>
        {compareModalOpen && compareProvA && compareProvB && (() => {
          const statsA = getProvinceStats(compareProvA);
          const statsB = getProvinceStats(compareProvB);
          
          const rawStatsA = PROVINCE_STATS_DATA[compareProvA.id] || { area: 1, population: 1 };
          const rawStatsB = PROVINCE_STATS_DATA[compareProvB.id] || { area: 1, population: 1 };
          
          const densA = rawStatsA.population / rawStatsA.area;
          const densB = rawStatsB.population / rawStatsB.area;
          
          const isEn = language === "en";
          
          // Chart Data
          const indexChartData = [
            {
              name: isEn ? "Biodiversity" : "Keanekaragaman Hayati",
              [compareProvA.name]: statsA.biodiversity,
              [compareProvB.name]: statsB.biodiversity,
            },
            {
              name: isEn ? "Culture" : "Kebudayaan",
              [compareProvA.name]: statsA.cultural,
              [compareProvB.name]: statsB.cultural,
            },
            {
              name: isEn ? "Geography" : "Geografis",
              [compareProvA.name]: statsA.geographic,
              [compareProvB.name]: statsB.geographic,
            },
            {
              name: isEn ? "History" : "Sejarah",
              [compareProvA.name]: statsA.history,
              [compareProvB.name]: statsB.history,
            }
          ];

          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-4xl rounded-3xl p-6 border shadow-2xl relative flex flex-col gap-6 my-8 ${
                  theme === "dark"
                    ? "bg-[#090b0f] border-white/10 text-white"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b pb-4 border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <GitCompare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight leading-snug">
                        {isEn ? "Province Comparative Dashboard" : "Dasbor Perbandingan Provinsi"}
                      </h3>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                        {isEn 
                          ? "Analyze and compare demographic, spatial, and characteristic indices." 
                          : "Analisis dan bandingkan demografi, spasial, serta indeks karakteristik wilayah."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCompareModalOpen(false)}
                    className={`p-1.5 rounded-xl border transition-all ${
                      theme === "dark"
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Province Selection Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select A */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-50/50 border-slate-100"
                  }`}>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {isEn ? "First Province" : "Provinsi Pertama"}
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: compareProvA.color }} />
                      <select
                        value={compareProvA.id}
                        onChange={(e) => {
                          const found = PROVINCES.find(p => p.id === e.target.value);
                          if (found) setCompareProvA(found);
                        }}
                        className={`w-full py-2 px-3 rounded-xl border text-sm font-semibold outline-none transition-all ${
                          theme === "dark"
                            ? "bg-neutral-900 border-white/10 text-gray-200 focus:border-indigo-500"
                            : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 shadow-sm"
                        }`}
                      >
                        {PROVINCES.map(p => (
                          <option key={`sel-a-${p.id}`} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select B */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-50/50 border-slate-100"
                  }`}>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {isEn ? "Second Province" : "Provinsi Kedua"}
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: compareProvB.color }} />
                      <select
                        value={compareProvB.id}
                        onChange={(e) => {
                          const found = PROVINCES.find(p => p.id === e.target.value);
                          if (found) setCompareProvB(found);
                        }}
                        className={`w-full py-2 px-3 rounded-xl border text-sm font-semibold outline-none transition-all ${
                          theme === "dark"
                            ? "bg-neutral-900 border-white/10 text-gray-200 focus:border-indigo-500"
                            : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 shadow-sm"
                        }`}
                      >
                        {PROVINCES.map(p => (
                          <option key={`sel-b-${p.id}`} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Comparative Side-by-Side Demographic Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics Province A */}
                  <div className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col gap-3 transition-colors ${
                    theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200/80"
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none" style={{ background: compareProvA.color }} />
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: compareProvA.color }} />
                      <h4 className="text-base font-bold">{compareProvA.name}</h4>
                    </div>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"} line-clamp-2 italic`}>
                      "{compareProvA.description}"
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Area Size" : "Luas Wilayah"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {rawStatsA.area.toLocaleString()} km²
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Population" : "Penduduk"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {(rawStatsA.population / 1000000).toFixed(2)} M
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Density" : "Kepadatan"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {densA.toFixed(1)}/km²
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demographics Province B */}
                  <div className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col gap-3 transition-colors ${
                    theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200/80"
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none" style={{ background: compareProvB.color }} />
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: compareProvB.color }} />
                      <h4 className="text-base font-bold">{compareProvB.name}</h4>
                    </div>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"} line-clamp-2 italic`}>
                      "{compareProvB.description}"
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Area Size" : "Luas Wilayah"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {rawStatsB.area.toLocaleString()} km²
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Population" : "Penduduk"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {(rawStatsB.population / 1000000).toFixed(2)} M
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border transition-colors ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200/60"}`}>
                        <div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {isEn ? "Density" : "Kepadatan"}
                        </div>
                        <div className="text-xs font-bold font-mono text-indigo-400">
                          {densB.toFixed(1)}/km²
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical Ratio Breakdown Row */}
                <div className={`p-4 rounded-2xl border text-xs font-mono flex flex-col gap-2 shadow-inner ${
                  theme === "dark" ? "bg-indigo-950/20 border-indigo-500/10 text-indigo-200" : "bg-indigo-50/50 border-indigo-100 text-indigo-800"
                }`}>
                  <div className="flex items-center gap-1.5 font-sans font-bold uppercase tracking-wider text-[10px] text-indigo-500">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{isEn ? "Comparative Analytics Insights" : "Wawasan Analitis Perbandingan"}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{getComparisonRatio(rawStatsA.area, rawStatsB.area, compareProvA.name, compareProvB.name, isEn)}</li>
                    <li>{getComparisonRatio(rawStatsA.population, rawStatsB.population, compareProvA.name, compareProvB.name, isEn)}</li>
                    <li>{getComparisonRatio(densA, densB, compareProvA.name, compareProvB.name, isEn)}</li>
                  </ul>
                </div>

                {/* Chart Visualization Area: Recharts Grouped Bar Chart */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                  theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-50/50 border-slate-100"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-violet-500" />
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                        {isEn ? "Characteristics Profile Comparison" : "Perbandingan Profil Karakteristik"}
                      </span>
                    </div>
                  </div>

                  <div className="h-[240px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={indexChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          stroke={theme === "dark" ? "#a3a3a3" : "#475569"} 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke={theme === "dark" ? "#a3a3a3" : "#475569"} 
                          fontSize={10} 
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className={`p-3 rounded-xl border shadow-xl flex flex-col gap-1.5 ${
                                  theme === "dark" ? "bg-[#090b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                                }`}>
                                  <span className="font-bold text-xs">{payload[0].payload.name}</span>
                                  {payload.map((entry: any, i: number) => (
                                    <div key={`tip-${i}`} className="flex items-center gap-2 text-xs">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                      <span className="opacity-80">{entry.name}:</span>
                                      <span className="font-bold font-mono" style={{ color: entry.color }}>{entry.value}%</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={32} 
                          iconSize={8}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "10px" }}
                        />
                        <Bar dataKey={compareProvA.name} fill={compareProvA.color} radius={[4, 4, 0, 0]} barSize={16} />
                        <Bar dataKey={compareProvB.name} fill={compareProvB.color} radius={[4, 4, 0, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setCompareModalOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border active:scale-[0.98] ${
                      theme === "dark"
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
                        : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    }`}
                  >
                    {isEn ? "Dismiss" : "Tutup"}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* CORE LEAFLET MAP ELEMENT */}
      <div ref={mapContainerRef} className={`w-full h-full z-10 transition-colors duration-300 ${theme === "dark" ? "bg-black/40" : "bg-slate-200/40"}`} />

      {/* STYLE OVERRIDES TO CLEAN UP LEAFLET POPUPS & TOOLTIPS */}
      <style>{`
        .leaflet-container {
          background: #090b0e !important;
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-bar a {
          background: rgba(0, 0, 0, 0.8) !important;
          color: #9ca3af !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 0.2s;
        }
        .leaflet-bar a:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(0, 0, 0, 0.95) !important;
          margin-bottom: -1px;
        }
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.8) !important;
          color: #4b5563 !important;
          font-size: 8px !important;
          border-top-left-radius: 8px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .leaflet-control-attribution a {
          color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}

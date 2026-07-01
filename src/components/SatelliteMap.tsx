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
  Tag,
  Info
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

// Helper to determine timezone based on island and province id
const getProvinceTimezone = (province: Province) => {
  if (province.island === "Sumatra" || province.island === "Jawa") return "WIB";
  if (province.island === "Kalimantan") {
    if (["kalbar", "kalteng"].includes(province.id)) return "WIB";
    return "WITA";
  }
  if (province.island === "Sulawesi" || province.island === "NusaTenggaraBali") return "WITA";
  if (province.island === "Maluku" || province.island === "Papua") return "WIT";
  return "WIB";
};

const getTimezoneColor = (timezone: string) => {
  switch (timezone) {
    case "WIB": return "#3b82f6"; // Blue
    case "WITA": return "#10b981"; // Emerald
    case "WIT": return "#f59e0b"; // Amber
    default: return "#3b82f6";
  }
};

const getGeojsonStateName = (provinceName: string) => {
  const mapping: Record<string, string> = {
    "DKI Jakarta": "Jakarta Raya",
    "DI Yogyakarta": "Yogyakarta",
    "Bangka Belitung": "Bangka-Belitung"
  };
  return mapping[provinceName] || provinceName;
};

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
  userLocation?: { lat: number, lng: number } | null;
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
  userLocation = null,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const isFirstRender = useRef(true);
  const [mapType, setMapType] = useState<"satellite" | "dark" | "street" | "topo">("satellite");
  const [isPanning, setIsPanning] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
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

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    fetch('/indonesia.geojson')
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Failed to load geojson", err));
  }, []);

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

  // Handle User Location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `<div class="relative flex items-center justify-center w-6 h-6">
                   <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
                   <div class="relative w-3 h-3 bg-blue-600 border-2 border-white rounded-full"></div>
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
          icon: userIcon, 
          zIndexOffset: 1000 
        }).addTo(map);
        
        // Add a tooltip for user location
        userMarkerRef.current.bindTooltip(
          language === "en" ? "You are here" : "Anda di sini",
          {
            permanent: true,
            direction: "top",
            className: "bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white shadow-lg",
            offset: [0, -10]
          }
        );
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    }
  }, [userLocation, language]);

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

    if (geojsonLayerRef.current && map.hasLayer(geojsonLayerRef.current)) {
      map.removeLayer(geojsonLayerRef.current);
    }

    if (!showMarkers) return;

    if (geojsonData) {
      const geojsonLayer = L.geoJSON(geojsonData, {
        style: (feature: any) => {
          const stateName = feature.properties.state.toLowerCase();
          let matchedProv = filteredProvinces.find(p => getGeojsonStateName(p.name).toLowerCase() === stateName);
          
          if (!matchedProv) {
            if (stateName === 'papua') {
              matchedProv = filteredProvinces.find(p => ['papua', 'papteng', 'papsel', 'pappeg'].includes(p.id));
            } else if (stateName === 'papua barat') {
              matchedProv = filteredProvinces.find(p => ['pabar', 'pabarda'].includes(p.id));
            }
          }

          if (!matchedProv) {
            return {
              color: '#ffffff',
              weight: 1,
              opacity: 0.1,
              fillOpacity: 0.05
            };
          }

          const isSelected = matchedProv.id === selectedProvince.id || 
            (selectedProvince.id.startsWith('pap') && (
              (stateName === 'papua' && ['papua', 'papteng', 'papsel', 'pappeg'].includes(selectedProvince.id)) || 
              (stateName === 'papua barat' && ['pabar', 'pabarda'].includes(selectedProvince.id))
            ));

          const matchesFilter = isTourActive || isProvinceInFilter(matchedProv, activeFilter);
          
          if (!matchesFilter && markerFilterMode === "hide") {
            return { opacity: 0, fillOpacity: 0 };
          }

          const timezone = getProvinceTimezone(matchedProv);
          const markerColor = getTimezoneColor(timezone);

          return {
            color: isSelected ? '#ffffff' : markerColor,
            weight: isSelected ? 3 : 1.5,
            opacity: matchesFilter ? (isSelected ? 1 : 0.8) : 0.2,
            fillColor: markerColor,
            fillOpacity: matchesFilter ? (isSelected ? 0.4 : 0.15) : 0.05,
            className: 'transition-all duration-300 outline-none cursor-pointer'
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            const stateName = feature.properties.state.toLowerCase();
            let matchedProv = filteredProvinces.find(p => getGeojsonStateName(p.name).toLowerCase() === stateName);
            
            if (!matchedProv) {
              if (stateName === 'papua') {
                matchedProv = filteredProvinces.find(p => p.id === 'papua');
              } else if (stateName === 'papua barat') {
                matchedProv = filteredProvinces.find(p => p.id === 'pabar');
              }
            }

            if (matchedProv) {
              hasUserSelected.current = true;
              onSelectProvince(matchedProv);
              setInfoboxProvince(matchedProv);
            }
          });

          layer.on('mouseover', (e: any) => {
            const l = e.target;
            l.setStyle({ fillOpacity: 0.6 });
          });

          layer.on('mouseout', (e: any) => {
            geojsonLayer.resetStyle(e.target);
          });
        }
      });

      geojsonLayer.addTo(map);
      geojsonLayerRef.current = geojsonLayer;
    }

  }, [filteredProvinces, selectedProvince.id, language, showMarkers, activeFilter, markerFilterMode, isTourActive, geojsonData]);

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

      let targetBounds: L.LatLngBounds | null = null;
      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.eachLayer((layer: any) => {
          if (layer.feature && layer.feature.properties && layer.feature.properties.state) {
            const stateName = layer.feature.properties.state.toLowerCase();
            
            let matchedProv = filteredProvinces.find(p => getGeojsonStateName(p.name).toLowerCase() === stateName);
            
            if (!matchedProv) {
              if (stateName === 'papua') {
                matchedProv = filteredProvinces.find(p => ['papua', 'papteng', 'papsel', 'pappeg'].includes(p.id));
              } else if (stateName === 'papua barat') {
                matchedProv = filteredProvinces.find(p => ['pabar', 'pabarda'].includes(p.id));
              }
            }
  
            if (matchedProv && matchedProv.id === selectedProvince.id) {
               targetBounds = layer.getBounds();
            } else if (
               selectedProvince.id.startsWith('pap') && (
                 (stateName === 'papua' && ['papua', 'papteng', 'papsel', 'pappeg'].includes(selectedProvince.id)) || 
                 (stateName === 'papua barat' && ['pabar', 'pabarda'].includes(selectedProvince.id))
               )
            ) {
               targetBounds = layer.getBounds();
            }
          }
        });
      }

      if (targetBounds) {
        map.flyToBounds(targetBounds, {
          padding: [50, 50],
          maxZoom: 8,
          animate: true,
          duration: duration,
          easeLinearity: 0.18
        });
      } else {
        map.flyTo([coords.lat, coords.lng], zoomLevel, {
          animate: true,
          duration: duration,
          easeLinearity: 0.18, // Curved easing for a premium fluid swoop
        });
      }
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

    let targetBounds: L.LatLngBounds | null = null;
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature && layer.feature.properties && layer.feature.properties.state) {
          const stateName = layer.feature.properties.state.toLowerCase();
          
          let matchedProv = filteredProvinces.find(p => getGeojsonStateName(p.name).toLowerCase() === stateName);
          
          if (!matchedProv) {
            if (stateName === 'papua') {
              matchedProv = filteredProvinces.find(p => ['papua', 'papteng', 'papsel', 'pappeg'].includes(p.id));
            } else if (stateName === 'papua barat') {
              matchedProv = filteredProvinces.find(p => ['pabar', 'pabarda'].includes(p.id));
            }
          }

          if (matchedProv && matchedProv.id === selectedProvince.id) {
             targetBounds = layer.getBounds();
          } else if (
             selectedProvince.id.startsWith('pap') && (
               (stateName === 'papua' && ['papua', 'papteng', 'papsel', 'pappeg'].includes(selectedProvince.id)) || 
               (stateName === 'papua barat' && ['pabar', 'pabarda'].includes(selectedProvince.id))
             )
          ) {
             targetBounds = layer.getBounds();
          }
        }
      });
    }

    if (targetBounds) {
      map.flyToBounds(targetBounds, {
        padding: [50, 50],
        maxZoom: 8,
        animate: true,
        duration: 1.5,
        easeLinearity: 0.18
      });
    } else {
      map.flyTo([coords.lat, coords.lng], zoomLevel, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.18,
      });
    }

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

      {/* MAP CONTROLLER SWITCHER overlays (collapsible into Info icon) */}
      <div className={`absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-[400] flex flex-col-reverse items-start gap-2`}>
        <button
          onClick={() => setIsInfoMenuOpen(prev => !prev)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-xl border ${
            isInfoMenuOpen
              ? "bg-blue-600/80 text-white border-blue-400/50 hover:bg-blue-600/90"
              : theme === "dark" 
                ? "bg-white/10 border-white/20 text-gray-200 hover:text-white hover:bg-white/20" 
                : "bg-white/40 border-white/50 text-slate-800 hover:text-slate-900 hover:bg-white/60"
          }`}
          title={language === "en" ? "Map Info & Tools" : "Info & Alat Peta"}
        >
          <Info className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <AnimatePresence>
          {isInfoMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col items-center gap-1 backdrop-blur-xl p-1.5 rounded-xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
                  : "bg-white/40 border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"
              }`}
            >
              <button
                onClick={() => setMapType("satellite")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  mapType === "satellite"
                    ? "bg-blue-600 text-white"
                    : (theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-slate-900 hover:bg-white/60")
                }`}
                title={language === "en" ? "Satellite view" : "Tampilan Satelit"}
              >
                <Globe className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setMapType("topo")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  mapType === "topo"
                    ? "bg-blue-600 text-white"
                    : (theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-slate-900 hover:bg-white/60")
                }`}
                title={language === "en" ? "Terrain view" : "Tampilan Terrain"}
              >
                <Compass className="w-4 h-4" />
              </button>

              <div className={`w-5 h-[1px] my-1 transition-colors duration-300 ${theme === "dark" ? "bg-white/20" : "bg-slate-300/50"}`} />

              <button
                onClick={() => {
                  setIsTourActive(prev => !prev);
                  setIsTourPlaying(true);
                  setIsInfoMenuOpen(false);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isTourActive
                    ? "bg-amber-500 text-black font-extrabold hover:bg-amber-400 shadow-sm"
                    : "text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
                }`}
                title={language === "en" ? "Virtual Tour" : "Tur Virtual"}
              >
                <Sparkles className={`w-4 h-4 ${isTourActive ? "animate-pulse" : ""}`} />
              </button>

              <button
                onClick={() => {
                  zoomToFitIndonesia();
                  setIsInfoMenuOpen(false);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  theme === "dark" 
                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/20" 
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                }`}
                title={language === "en" ? "Fit Entire Indonesia" : "Fokus Seluruh Indonesia"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {setShowMarkers && (
                <>
                  <div className={`w-5 h-[1px] my-1 transition-colors duration-300 ${theme === "dark" ? "bg-white/20" : "bg-slate-300/50"}`} />
                  <button
                    onClick={() => setShowMarkers(prev => !prev)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      showMarkers
                        ? theme === "dark"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                          : "bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-200"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-white/10"
                          : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                    }`}
                    title={language === "en" ? (showMarkers ? "Hide Markers" : "Show Markers") : (showMarkers ? "Sembunyikan Pin" : "Tampilkan Pin")}
                  >
                    <MapPin className={`w-4 h-4 ${showMarkers ? "animate-pulse" : ""}`} />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

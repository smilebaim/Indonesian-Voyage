import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Compass, 
  Info, 
  Music, 
  Utensils, 
  Palmtree, 
  Send, 
  Volume2, 
  Clock, 
  Layers, 
  Tag,
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  HelpCircle,
  X,
  BookOpen,
  Zap,
  ZapOff,
  Share2,
  Copy,
  Check,
  Sun,
  Moon,
  ListTodo,
  History,
  TrendingUp
} from "lucide-react";
import { PROVINCES, ISLAND_GROUPS, Province } from "./data/provinces";
import SatelliteMap from "./components/SatelliteMap";
import WeatherWidget from "./components/WeatherWidget";
import ProvinceStats from "./components/ProvinceStats";
import ProvinceHistory from "./components/ProvinceHistory";
import ProvinceRanking from "./components/ProvinceRanking";
import LocationPrompt from "./components/LocationPrompt";
import { motion, AnimatePresence } from "motion/react";
import { getProvinceLatLng } from "./data/coordinates";

const tabContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const cascadeItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function App() {
  // State management
  const [selectedProvince, setSelectedProvince] = useState<Province>(
    PROVINCES.find(p => p.id === "jakarta") || PROVINCES[0]
  );
  const [hasClickedMarker, setHasClickedMarker] = useState<boolean>(false);
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("nusantara_effects_enabled");
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Share States
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Save effects preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nusantara_effects_enabled", String(effectsEnabled));
    } catch (e) {
      console.warn("Failed to save performance setting", e);
    }
  }, [effectsEnabled]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showMarkers, setShowMarkers] = useState(true);
  const [showRegionLabels, setShowRegionLabels] = useState(true);
  const [showRankingsOverlay, setShowRankingsOverlay] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "culture" | "tourism" | "culinary" | "ai" | "itinerary" | "checklist" | "ranking">("overview");
  
  // AI Chat states
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<Record<string, Record<string, string>>>({});
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Itinerary Generator States
  const [itineraryDays, setItineraryDays] = useState<number>(3);
  const [itineraryPref, setItineraryPref] = useState<"alam" | "budaya" | "kuliner" | "campuran">("campuran");
  const [itineraryResponse, setItineraryResponse] = useState<string>("");
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryHistory, setItineraryHistory] = useState<Record<string, Record<string, string>>>({});

  // Checklist Generator States
  const [checklistActivities, setChecklistActivities] = useState<string[]>(["nature", "culture"]);
  const [customActivity, setCustomActivity] = useState<string>("");
  const [checklistResponse, setChecklistResponse] = useState<string>("");
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistHistory, setChecklistHistory] = useState<Record<string, Record<string, string>>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Time state for Indonesian Timezones (WIB, WITA, WIT)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Location Prompt state
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return localStorage.getItem("locationPromptDismissed") !== "true";
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleAllowLocation = () => {
    localStorage.setItem("locationPromptDismissed", "true");
    setShowLocationPrompt(false);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Find nearest province
          let nearestProv = PROVINCES[0];
          let minDistance = Infinity;

          PROVINCES.forEach(prov => {
            const coords = getProvinceLatLng(prov.id);
            const dLat = coords.lat - latitude;
            const dLng = coords.lng - longitude;
            const distance = Math.sqrt(dLat * dLat + dLng * dLng);
            if (distance < minDistance) {
              minDistance = distance;
              nearestProv = prov;
            }
          });

          // Focus map on this province
          setSelectedProvince(nearestProv);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleDenyLocation = () => {
    localStorage.setItem("locationPromptDismissed", "true");
    setShowLocationPrompt(false);
  };

  // Refs for navigation scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Keep track of previous province to reset custom AI questions
  const prevProvinceIdRef = useRef(selectedProvince.id);
  useEffect(() => {
    if (prevProvinceIdRef.current !== selectedProvince.id) {
      setAiQuestion("");
      prevProvinceIdRef.current = selectedProvince.id;
    }
  }, [selectedProvince]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial province from URL query parameter (?province=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const provParam = params.get("province");
      if (provParam) {
        const found = PROVINCES.find(p => p.id === provParam.toLowerCase());
        if (found) {
          setSelectedProvince(found);
        }
      }
    } catch (e) {
      console.error("Failed to parse URL province parameter", e);
    }
  }, []);

  // Update URL search query parameters when selected province changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("province", selectedProvince.id);
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      console.warn("Failed to update history state", e);
    }
  }, [selectedProvince]);

  // Update suggested questions based on selected province & language
  useEffect(() => {
    if (language === "en") {
      setSuggestedQuestions([
        `Recommend the best 3-day travel itinerary in ${selectedProvince.name}`,
        `What is the history behind the traditional art of ${selectedProvince.culture[0] || "local culture"}?`,
        `What is the unique story or origin of ${selectedProvince.culinary[0] || "special food"}?`,
        `Give a hidden gem that is rarely known by tourists about ${selectedProvince.name}`
      ]);
    } else {
      setSuggestedQuestions([
        `Rekomendasikan itinerary wisata 3 hari terbaik di ${selectedProvince.name}`,
        `Bagaimana sejarah di balik kesenian tradisional ${selectedProvince.culture[0] || "budaya lokal"}?`,
        `Apa cerita unik atau asal usul kuliner ${selectedProvince.culinary[0] || "makanan khas"}?`,
        `Berikan fakta tersembunyi (hidden gem) yang jarang diketahui wisatawan tentang ${selectedProvince.name}`
      ]);
    }

    // Auto-fetch/load for AI tab
    if (activeTab === "ai") {
      if (aiQuestion && aiQuestion.trim()) {
        const key = `q_${aiQuestion.trim()}_${language}`;
        const provinceHist = aiHistory[selectedProvince.id];
        if (provinceHist && provinceHist[key]) {
          setAiResponse(provinceHist[key]);
        } else {
          askGemini("general", aiQuestion.trim(), language);
        }
      } else {
        const key = `general_${language}`;
        const provinceHist = aiHistory[selectedProvince.id];
        if (provinceHist && provinceHist[key]) {
          setAiResponse(provinceHist[key]);
        } else {
          askGemini("general", undefined, language);
        }
      }
    } else {
      setAiResponse("");
    }

    // Auto-fetch/load for Itinerary tab
    if (activeTab === "itinerary") {
      const itinKey = `${itineraryDays}_${itineraryPref}_${language}`;
      const itinHist = itineraryHistory[selectedProvince.id]?.[itinKey];
      if (itinHist) {
        setItineraryResponse(itinHist);
      } else {
        generateItinerary(itineraryDays, itineraryPref, language);
      }
    } else {
      setItineraryResponse("");
    }

    // Auto-fetch/load for Checklist tab
    if (activeTab === "checklist") {
      const sortedActs = [...checklistActivities].sort();
      const checkKey = sortedActs.join(",") + `_${customActivity.trim()}_${language}`;
      const checkHist = checklistHistory[selectedProvince.id]?.[checkKey];
      if (checkHist) {
        setChecklistResponse(checkHist);
      } else {
        generateChecklist(checklistActivities, customActivity, language);
      }
    } else {
      setChecklistResponse("");
    }
  }, [selectedProvince, language, activeTab, checklistActivities, aiQuestion]);

  // Handle live timezone calculations
  const getTimeString = (offsetHours: number) => {
    // Offset standard UTC
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const targetDate = new Date(utc + 3600000 * offsetHours);
    return targetDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  // Filter provinces based on search and island group
  const filteredProvinces = useMemo(() => {
    return PROVINCES.filter(province => {
      const matchesSearch = province.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            province.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            province.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIsland = selectedIsland === "All" || province.island === selectedIsland;
      return matchesSearch && matchesIsland;
    });
  }, [searchQuery, selectedIsland]);

  // Request Gemini API to fetch in-depth info or answer custom questions
  const askGemini = async (category: string, questionText?: string, targetLang: "id" | "en" = language) => {
    setAiLoading(true);
    setAiResponse("");
    const key = questionText ? `q_${questionText}_${targetLang}` : `${category}_${targetLang}`;

    // Check history cache first to save tokens and load instantly
    if (aiHistory[selectedProvince.id]?.[key]) {
      setAiResponse(aiHistory[selectedProvince.id][key]);
      setAiLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/province-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: selectedProvince.name,
          category: questionText ? undefined : category,
          question: questionText,
          lang: targetLang
        })
      });

      const data = await response.json();
      const generatedText = data.text || (targetLang === "en" ? "No response received from AI." : "Tidak ada respon yang diterima dari AI.");
      
      setAiResponse(generatedText);
      // Save to cache history
      setAiHistory(prev => ({
        ...prev,
        [selectedProvince.id]: {
          ...(prev[selectedProvince.id] || {}),
          [key]: generatedText
        }
      }));
    } catch (error) {
      console.error("Failed to query Gemini API:", error);
      setAiResponse(targetLang === "en" ? "Connection failed or limit reached. Please try again in a moment." : "Koneksi gagal atau limit tercapai. Silakan coba kembali sesaat lagi.");
    } finally {
      setAiLoading(false);
    }
  };

  // Request Gemini API to generate itinerary
  const generateItinerary = async (days: number, pref: string, targetLang: "id" | "en" = language) => {
    setItineraryLoading(true);
    setItineraryResponse("");
    const key = `${days}_${pref}_${targetLang}`;

    // Check history cache first
    if (itineraryHistory[selectedProvince.id]?.[key]) {
      setItineraryResponse(itineraryHistory[selectedProvince.id][key]);
      setItineraryLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: selectedProvince.name,
          duration: days,
          preference: pref,
          lang: targetLang
        })
      });

      const data = await response.json();
      const text = data.text || (targetLang === "en" ? "No itinerary could be generated." : "Tidak ada rencana perjalanan yang berhasil dibuat.");
      setItineraryResponse(text);

      // Save to cache history
      setItineraryHistory(prev => ({
        ...prev,
        [selectedProvince.id]: {
          ...(prev[selectedProvince.id] || {}),
          [key]: text
        }
      }));
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      setItineraryResponse(targetLang === "en" ? "Connection failed or limit reached. Please try again in a moment." : "Koneksi gagal atau limit tercapai. Silakan coba kembali sesaat lagi.");
    } finally {
      setItineraryLoading(false);
    }
  };

  // Request Gemini API to generate dynamic packing checklist
  const generateChecklist = async (activities: string[], custom: string, targetLang: "id" | "en" = language) => {
    setChecklistLoading(true);
    setChecklistResponse("");
    const sortedActs = [...activities].sort();
    const key = sortedActs.join(",") + `_${custom.trim()}_${targetLang}`;

    // Check history cache first
    if (checklistHistory[selectedProvince.id]?.[key]) {
      setChecklistResponse(checklistHistory[selectedProvince.id][key]);
      setChecklistLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: selectedProvince.name,
          activities: sortedActs,
          customActivity: custom.trim(),
          lang: targetLang
        })
      });

      const data = await response.json();
      const text = data.text || (targetLang === "en" ? "No checklist could be generated." : "Tidak ada checklist yang berhasil dibuat.");
      setChecklistResponse(text);

      // Save to cache history
      setChecklistHistory(prev => ({
        ...prev,
        [selectedProvince.id]: {
          ...(prev[selectedProvince.id] || {}),
          [key]: text
        }
      }));
    } catch (error) {
      console.error("Failed to generate checklist:", error);
      setChecklistResponse(targetLang === "en" ? "Connection failed or limit reached. Please try again in a moment." : "Koneksi gagal atau limit tercapai. Silakan coba kembali sesaat lagi.");
    } finally {
      setChecklistLoading(false);
    }
  };

  // Custom function to trigger AI query when tabs are clicked (for rich enrichment)
  const handleTabChange = (tab: "overview" | "history" | "culture" | "tourism" | "culinary" | "ai" | "itinerary" | "checklist" | "ranking") => {
    setActiveTab(tab);
  };

  // Custom function to handle click on live highlight badge in footer
  const handleHighlightClick = (provinceId: string) => {
    let question = "";
    if (provinceId === "jakarta") {
      question = language === "en" 
        ? "Tell me in detail about Jakarta's history and its current/transitioning status as the National Capital City of Indonesia."
        : "Jelaskan secara detail sejarah Jakarta dan statusnya saat ini/masa transisi sebagai Ibu Kota Negara Republik Indonesia.";
    } else if (provinceId === "yogyakarta") {
      question = language === "en"
        ? "Tell me about the Yogyakarta Cultural Festival and the famous Sekaten tradition."
        : "Jelaskan mengenai Festival Budaya Yogyakarta dan tradisi Sekaten yang terkenal di Yogyakarta.";
    } else if (provinceId === "bali") {
      question = language === "en"
        ? "Tell me about Bali hosting the G20 Summit and other major international/global summits."
        : "Jelaskan mengenai Bali sebagai tuan rumah KTT G20 dan berbagai pertemuan/KTT tingkat tinggi global lainnya.";
    } else if (provinceId === "kaltim") {
      question = language === "en"
        ? "Explain in detail about the IKN Nusantara mega project in East Kalimantan as the new capital of Indonesia."
        : "Jelaskan secara mendalam tentang proyek megah IKN Nusantara di Kalimantan Timur sebagai ibu kota baru Indonesia.";
    }

    if (question) {
      setAiQuestion(question);
      setActiveTab("ai");
      
      // We also scroll to the info explorer section smoothly so the user can see the AI loading
      setTimeout(() => {
        const infoExplorer = document.getElementById("info-explorer");
        if (infoExplorer) {
          infoExplorer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Scroll bottom list
  const scrollList = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const handleShareProvince = async () => {
    const shareData = {
      title: `${selectedProvince?.name || "Indonesia"} - Indonesian Explorer`,
      text: selectedProvince 
        ? (language === "en" 
          ? `Explore ${selectedProvince.name}, ${selectedProvince.description.toLowerCase()} Highlights include ${selectedProvince.tourism.slice(0, 3).join(", ")}!` 
          : `Jelajahi ${selectedProvince.name}, ${selectedProvince.description.toLowerCase()} Destinasi unggulan: ${selectedProvince.tourism.slice(0, 3).join(", ")}!`)
        : "Indonesian Explorer",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback
      handleCopyLink();
    }
  };

  return (
    <motion.div 
      className="min-h-screen font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
      animate={{ 
        backgroundColor: theme === "dark" ? "#050608" : "#f8fafc", 
        color: theme === "dark" ? "#f3f4f6" : "#1e293b" 
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      
      <AnimatePresence>
        {showLocationPrompt && (
          <LocationPrompt 
            onAllow={handleAllowLocation}
            onDeny={handleDenyLocation}
            language={language}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* BACKGROUND ATMOSPHERIC GLOWS */}
      {effectsEnabled && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Glowing orb matching selected province theme color */}
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-1000"
            animate={{ 
              backgroundColor: selectedProvince.color || "#3b82f6",
              opacity: theme === "dark" ? 0.25 : 0.15 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              top: `${selectedProvince.coords.y}%`,
              left: `${selectedProvince.coords.x}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
          {/* Additional default nodes */}
          <motion.div 
            className="absolute top-[20%] left-[10%] w-[450px] h-[450px] rounded-full blur-[130px]"
            animate={{ 
              backgroundColor: theme === "dark" ? "rgba(30, 58, 138, 0.2)" : "rgba(191, 219, 254, 0.5)",
              opacity: theme === "dark" ? 1 : 0.6
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] rounded-full blur-[160px]"
            animate={{ 
              backgroundColor: theme === "dark" ? "rgba(2, 44, 34, 0.2)" : "rgba(167, 243, 208, 0.5)",
              opacity: theme === "dark" ? 1 : 0.6
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Cyber Dots Grid Overlay with slow panning animation */}
          <motion.div 
            className="absolute inset-0 animate-grid-pan"
            animate={{
              opacity: theme === "dark" ? 0.15 : 0.08,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundImage: theme === "dark" ? "radial-gradient(#ffffff 0.5px, transparent 0.5px)" : "radial-gradient(#000000 0.5px, transparent 0.5px)",
              backgroundSize: "32px 32px"
            }}
          />
        </motion.div>
      )}



      {/* CORE HERO SECTION & MAP PERSPECTIVE CANVAS */}
      <main className="w-full h-screen relative z-10 overflow-hidden">
        
        <div className="w-full h-full relative">
          
          {/* INFORMATION HUB OVERLAYING MAP (Facts & Explorer Portal in front of Map) */}
          {hasClickedMarker && (
            <section 
              id="info-panel" 
              className="absolute inset-0 z-[402] overflow-y-auto p-4 sm:p-6 md:py-12 md:px-8 animate-fadeIn bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <div className={`w-full h-full max-w-3xl backdrop-blur-xl border rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${theme === "dark" ? "bg-slate-950/40 border-white/15 shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]" : "bg-white/40 border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"}`}>
          
                {/* Selected Province Hero Details */}
                <div className={`p-4 sm:p-5 md:p-6 shrink-0 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 border-b ${theme === "dark" ? "border-white/10" : "border-slate-200/80"}`}>
            
            
            {/* Background Accent Initials */}
            <div className={`absolute right-[-10px] top-[-5px] sm:right-[-20px] sm:top-[-10px] text-[30px] sm:text-[60px] font-black select-none uppercase pointer-events-none font-mono transition-colors ${theme === "dark" ? "text-white/[0.02]" : "text-slate-900/[0.02]"}`}>
              {selectedProvince.name.substring(0, 2)}
            </div>

            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase font-semibold border transition-all ${theme === "dark" ? "text-white/80 bg-white/10 border-white/5" : "text-slate-600 bg-slate-100 border-slate-200"}`}>
                      {selectedProvince.island === "NusaTenggaraBali" ? "Bali & Nusa Tenggara" : selectedProvince.island}
                    </span>
                    <span className="flex h-2 w-2 relative">
                      {effectsEnabled && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: selectedProvince.color }}></span>
                      )}
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: selectedProvince.color }}></span>
                    </span>
                  </div>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none transition-colors ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {selectedProvince.name}
                  </h1>
                  <p className={`text-xs font-mono tracking-wide mt-1 transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                    Ibu Kota: <span className={`font-semibold transition-colors ${theme === "dark" ? "text-gray-200" : "text-slate-800"}`}>{selectedProvince.capital}</span>
                  </p>
                </div>
                
                {/* Action Buttons & Visual Circle Progress / Stats Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleShareProvince}
                    className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${theme === "dark" ? "bg-white/10 text-white hover:bg-white/20 border-white/15" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm"} hover:scale-105 active:scale-95`}
                    title={language === "en" ? "Share Province" : "Bagikan Provinsi"}
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => setHasClickedMarker(false)}
                    className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer bg-gradient-to-r from-rose-500 to-red-600 text-white border-transparent hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25"
                    title={language === "en" ? "Close Details" : "Tutup Detail"}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </button>
                  <div 
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border shrink-0 transition-all ${theme === "dark" ? "border-white/10 bg-white/5" : "border-white/20 bg-transparent"}`}
                    style={{ borderColor: `${selectedProvince.color}40` }}
                  >
                    <Compass className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 text-blue-500 ${effectsEnabled ? "animate-spin-slow" : ""}`} />
                    <span className={`text-[7px] sm:text-[8px] font-bold uppercase font-mono transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {selectedProvince.coords.x}° E
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Interactive Information & AI Explorer Portal */}
          <div id="info-explorer" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Inner Tabs for exploring details */}
            <div className={`relative w-full flex justify-between items-center shrink-0 border-b transition-all duration-300 ${theme === "dark" ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10"}`}>
              {/* Modern Glassmorphism Left Scroll button with fading gradient */}
              <div className={`absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-start pl-2.5 pointer-events-none bg-gradient-to-r ${
                theme === "dark" ? "from-slate-950/90 via-slate-950/40 to-transparent" : "from-white/90 via-white/40 to-transparent"
              }`}>
                <button
                  onClick={() => scrollTabs("left")}
                  className={`pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_2px_10px_-1px_rgba(0,0,0,0.15)] ${
                    theme === "dark" 
                      ? "bg-white/10 border-white/15 text-gray-300 hover:bg-white/20 hover:text-white hover:border-white/30" 
                      : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800 hover:border-slate-300 shadow-slate-100"
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div 
                ref={tabsContainerRef}
                className="flex-1 flex p-1 sm:p-1.5 px-11 gap-1 overflow-x-auto scrollbar-none scroll-smooth w-full justify-between"
              >
                <button
                  onClick={() => handleTabChange("overview")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                    activeTab === "overview" 
                      ? (theme === "dark" ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800 shadow-sm") 
                      : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <Info className="w-3.5 h-3.5 animate-[spin_10s_linear_infinite]" />
                  {language === "en" ? "Info" : "Info"}
                </button>
                <button
                  onClick={() => handleTabChange("history")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                    activeTab === "history" 
                      ? (theme === "dark" ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800 shadow-sm") 
                      : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  {language === "en" ? "History" : "Sejarah"}
                </button>
                <button
                  onClick={() => handleTabChange("culture")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                    activeTab === "culture" 
                      ? (theme === "dark" ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800 shadow-sm") 
                      : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-amber-500" />
                  {language === "en" ? "Culture" : "Budaya"}
                </button>
                <button
                  onClick={() => handleTabChange("tourism")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                    activeTab === "tourism" 
                      ? (theme === "dark" ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800 shadow-sm") 
                      : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <Palmtree className="w-3.5 h-3.5 text-emerald-500" />
                  {language === "en" ? "Tourism" : "Wisata"}
                </button>
                <button
                  onClick={() => handleTabChange("culinary")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                    activeTab === "culinary" 
                      ? (theme === "dark" ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800 shadow-sm") 
                      : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-rose-500" />
                  {language === "en" ? "Culinary" : "Kuliner"}
                </button>
                <button
                  onClick={() => handleTabChange("ai")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap border bg-gradient-to-r ${
                    activeTab === "ai" 
                      ? (theme === "dark" ? "from-blue-600/30 to-indigo-600/30 text-white border-blue-500" : "from-blue-100 to-indigo-100 text-blue-800 border-blue-400 shadow-sm") 
                      : (theme === "dark" ? "from-blue-900/40 to-indigo-900/40 text-blue-300 border-blue-500/20 hover:from-blue-800/50 hover:to-indigo-800/50" : "bg-blue-50/50 text-blue-600 border-blue-200 hover:bg-blue-50")
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 text-blue-500 ${effectsEnabled ? "animate-pulse" : ""}`} />
                  {language === "en" ? "Ask AI" : "Tanya AI"}
                </button>
                <button
                  onClick={() => handleTabChange("itinerary")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap border bg-gradient-to-r ${
                    activeTab === "itinerary" 
                      ? (theme === "dark" ? "from-emerald-600/30 to-teal-600/30 text-white border-emerald-500" : "from-emerald-100 to-teal-100 text-emerald-800 border-emerald-400 shadow-sm") 
                      : (theme === "dark" ? "from-emerald-900/40 to-teal-900/40 text-emerald-300 border-emerald-500/20 hover:from-emerald-800/50 hover:to-indigo-800/50" : "bg-emerald-50/50 text-emerald-600 border-emerald-200 hover:bg-emerald-50")
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 text-emerald-500 ${effectsEnabled ? "animate-pulse" : ""}`} />
                  {language === "en" ? "AI Plan" : "Rencana AI"}
                </button>
                <button
                  onClick={() => handleTabChange("checklist")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap border bg-gradient-to-r ${
                    activeTab === "checklist" 
                      ? (theme === "dark" ? "from-indigo-600/30 to-violet-600/30 text-white border-indigo-500" : "from-indigo-100 to-violet-100 text-indigo-800 border-indigo-400 shadow-sm") 
                      : (theme === "dark" ? "from-indigo-900/40 to-violet-900/40 text-indigo-300 border-indigo-500/20 hover:from-indigo-800/50 hover:to-indigo-800/50" : "bg-indigo-50/50 text-indigo-600 border-indigo-200 hover:bg-indigo-50")
                  }`}
                >
                  <ListTodo className={`w-3.5 h-3.5 text-indigo-500 ${effectsEnabled ? "animate-pulse" : ""}`} />
                  {language === "en" ? "Checklist" : "Persiapan"}
                </button>
                <button
                  onClick={() => handleTabChange("ranking")}
                  className={`flex-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap border bg-gradient-to-r ${
                    activeTab === "ranking" 
                      ? (theme === "dark" ? "from-violet-600/30 to-purple-600/30 text-white border-violet-500" : "from-violet-100 to-purple-100 text-violet-800 border-violet-400 shadow-sm") 
                      : (theme === "dark" ? "from-violet-900/40 to-purple-900/40 text-violet-300 border-violet-500/20 hover:from-violet-800/50 hover:to-indigo-800/50" : "bg-violet-50/50 text-violet-600 border-violet-200 hover:bg-violet-50")
                  }`}
                >
                  <TrendingUp className={`w-3.5 h-3.5 text-violet-500 ${effectsEnabled ? "animate-pulse" : ""}`} />
                  {language === "en" ? "Rankings" : "Peringkat"}
                </button>
              </div>

              {/* Modern Glassmorphism Right Scroll button with fading gradient */}
              <div className={`absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-end pr-2.5 pointer-events-none bg-gradient-to-l ${
                theme === "dark" ? "from-slate-950/90 via-slate-950/40 to-transparent" : "from-white/90 via-white/40 to-transparent"
              }`}>
                <button
                  onClick={() => scrollTabs("right")}
                  className={`pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_2px_10px_-1px_rgba(0,0,0,0.15)] ${
                    theme === "dark" 
                      ? "bg-white/10 border-white/15 text-gray-300 hover:bg-white/20 hover:text-white hover:border-white/30" 
                      : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800 hover:border-slate-300 shadow-slate-100"
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Dynamic Content Display */}
            <div className="pt-3 px-3.5 pb-4 sm:pt-4 sm:px-5 sm:pb-5 flex-1 flex flex-col justify-start overflow-y-auto modern-scroll">
              
              {/* Tab: General Facts / Overview */}
              {activeTab === "overview" && (
                <motion.div 
                  key={`overview-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5"
                >
                  {/* General Description */}
                  <motion.p variants={cascadeItemVariants} className={`text-xs sm:text-sm leading-relaxed font-light text-justify transition-colors ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>
                    {selectedProvince.description}
                  </motion.p>

                  {/* Real-time Weather Display */}
                  <motion.div variants={cascadeItemVariants}>
                    <WeatherWidget province={selectedProvince} language={language} theme={theme} />
                  </motion.div>

                  {/* Micro Quick Statistics Grid */}
                  <motion.div variants={cascadeItemVariants} className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className={`backdrop-blur-md border p-2.5 sm:p-3 rounded-2xl transition-all duration-300 ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20 shadow-[0_4px_12px_rgba(31,38,135,0.02)]"}`}>
                      <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block mb-0.5 ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                        {language === "en" ? "Top Destinations" : "Destinasi Utama"}
                      </span>
                      <span className={`text-[11px] sm:text-xs font-medium line-clamp-1 transition-colors ${theme === "dark" ? "text-gray-200" : "text-slate-800"}`}>
                        {selectedProvince.tourism[0]} & {selectedProvince.tourism[1]}
                      </span>
                    </div>
                    <div className={`backdrop-blur-md border p-2.5 sm:p-3 rounded-2xl transition-all duration-300 ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20 shadow-[0_4px_12px_rgba(31,38,135,0.02)]"}`}>
                      <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block mb-0.5 ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                        {language === "en" ? "Popular Culture" : "Budaya Populer"}
                      </span>
                      <span className={`text-[11px] sm:text-xs font-medium line-clamp-1 transition-colors ${theme === "dark" ? "text-gray-200" : "text-slate-800"}`}>
                        {selectedProvince.culture[0]}
                      </span>
                    </div>
                  </motion.div>

                  {/* Divider */}
                  <motion.div variants={cascadeItemVariants} className={`border-t my-1 ${theme === "dark" ? "border-white/10" : "border-slate-200/80"}`} />

                  <motion.div variants={cascadeItemVariants} className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                        {language === "en" ? "Key Facts & Brief History" : "Fakta Kunci & Sejarah Singkat"}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {selectedProvince.facts.map((fact, index) => (
                        <li key={index} className={`flex gap-3 text-sm p-3 rounded-2xl relative overflow-hidden border transition-all ${theme === "dark" ? "text-gray-300 bg-white/[0.02] border-white/5" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                          <span className="text-xs font-mono font-bold text-blue-500">0{index+1}</span>
                          <span className="leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Demographic & Geographic Index Visualization */}
                    <ProvinceStats province={selectedProvince} language={language} theme={theme} />
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: History Stepper */}
              {activeTab === "history" && (
                <motion.div
                  key={`history-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={cascadeItemVariants}>
                    <ProvinceHistory
                      provinceId={selectedProvince.id}
                      island={selectedProvince.island}
                      provinceName={selectedProvince.name}
                      language={language}
                      theme={theme}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: Culture Details */}
              {activeTab === "culture" && (
                <motion.div 
                  key={`culture-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <motion.div variants={cascadeItemVariants} className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-amber-500" />
                    <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {language === "en" ? "Cultural Arts & Noble Heritage" : "Seni Budaya & Warisan Luhur"}
                    </h3>
                  </motion.div>
                  <motion.div variants={cascadeItemVariants} className="grid grid-cols-2 gap-3">                     {selectedProvince.culture.map((item, index) => (
                      <div key={index} className={`border p-3.5 rounded-2xl text-center flex flex-col items-center justify-center transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/60 hover:bg-white/80 border-slate-200/60 shadow-[0_2px_8px_rgba(31,38,135,0.02)]"}`}>
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                          <Music className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-semibold block mb-1 transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {language === "en" ? (
                            index === 0 ? "Main Art" : index === 1 ? "Traditional Attire" : "Regional Specialty"
                          ) : (
                            index === 0 ? "Kesenian Utama" : index === 1 ? "Pakaian Adat" : "Khas Daerah"
                          )}
                        </span>
                        <span className={`text-sm font-semibold text-center line-clamp-2 transition-colors ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{item}</span>
                      </div>
                    ))}
                  </motion.div>
                  <motion.div variants={cascadeItemVariants} className={`p-4 rounded-2xl transition-all border ${theme === "dark" ? "bg-amber-950/10 border-amber-500/15" : "bg-amber-500/10 border-amber-500/20"}`}>
                    <p className={`text-xs leading-relaxed flex gap-2 transition-all ${theme === "dark" ? "text-amber-300/90" : "text-amber-800"}`}>
                      <Volume2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {language === "en" ? (
                          "Traditional dance and music are passed down through generations as a form of gratitude and preservation of noble heritage values."
                        ) : (
                          "Seni tarian dan musik tradisional diwariskan dari generasi ke generasi sebagai bentuk rasa syukur kepada Tuhan dan pelestarian nilai luhur Pancasila."
                        )}
                      </span>
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: Tourism Attractions */}
              {activeTab === "tourism" && (
                <motion.div 
                  key={`tourism-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <motion.div variants={cascadeItemVariants} className="flex items-center gap-2 mb-1">
                    <Palmtree className="w-4 h-4 text-emerald-500" />
                    <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {language === "en" ? "Recommended Best Destinations" : "Rekomendasi Destinasi Terbaik"}
                    </h3>
                  </motion.div>
                  <motion.div variants={cascadeItemVariants} className="space-y-2.5">
                    {selectedProvince.tourism.map((destination, index) => (
                      <div key={index} className={`flex items-center justify-between border p-3.5 rounded-2xl transition-all duration-300 ${theme === "dark" ? "bg-white/[0.02] hover:bg-white/[0.05] border-white/5" : "bg-white/60 hover:bg-white/80 border-slate-200/60 shadow-sm"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-mono font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className={`text-sm font-semibold transition-colors ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{destination}</h4>
                            <span className={`text-[10px] uppercase transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                              {language === "en" ? "Premier Tourist Destination" : "Destinasi Wisata Unggulan"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono tracking-widest flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${theme === "dark" ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/10" : "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"}`}>
                          Visit
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: Culinary Adventures */}
              {activeTab === "culinary" && (
                <motion.div 
                  key={`culinary-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <motion.div variants={cascadeItemVariants} className="flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4 text-rose-500" />
                    <h3 className={`text-xs font-bold uppercase tracking-widest transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                      {language === "en" ? "Flavorful Traditional Culinary" : "Kuliner Tradisional Kaya Rasa"}
                    </h3>
                  </motion.div>
                  <motion.div variants={cascadeItemVariants} className="grid grid-cols-2 gap-3">
                    {selectedProvince.culinary.map((food, index) => (
                      <div key={index} className={`border p-3.5 rounded-2xl flex flex-col justify-between transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/60 hover:bg-white/80 border-slate-200/60 shadow-[0_2px_8px_rgba(31,38,135,0.02)]"}`}>
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                          <Utensils className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <span className={`text-[9px] uppercase font-mono block mb-1 transition-colors ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                            {language === "en" ? `Culinary #0${index+1}` : `Kuliner #0${index+1}`}
                          </span>
                          <span className={`text-sm font-bold leading-tight transition-colors ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{food}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                  <motion.div variants={cascadeItemVariants} className={`p-4 rounded-2xl transition-all border ${theme === "dark" ? "bg-rose-950/10 border-rose-500/15" : "bg-rose-500/10 border-rose-500/20"}`}>
                    <p className={`text-xs leading-relaxed transition-all ${theme === "dark" ? "text-rose-300/90" : "text-rose-800"}`}>
                      {language === "en" ? (
                        "Nusantara's signature spices produce rich and authentic culinary flavors, combining age-old traditions in every single bite."
                      ) : (
                        "Rempah khas Nusantara menghasilkan rasa kuliner yang kaya dan otentik, memadukan tradisi turun-temurun di setiap suapan."
                      )}
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: Gemini AI Smart Chat Integration */}
              {activeTab === "ai" && (
                <motion.div 
                  key={`ai-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 flex flex-col"
                >
                  <motion.div variants={cascadeItemVariants}>
                    {/* Header */}
                    <div className={`p-3.5 rounded-2xl mb-4 border transition-colors ${theme === "dark" ? "bg-blue-950/20 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Sparkles className={`w-4 h-4 ${effectsEnabled ? "animate-spin-slow" : ""}`} />
                        <span>{language === "en" ? "Gemini Smart Tour Guide" : "Pemandu Wisata Cerdas Gemini"}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                        {language === "en" ? (
                          <>
                            Ask anything about arts, history, traditional culinary secrets, or request a custom travel plan in{" "}
                            <span className="font-semibold text-blue-600">{selectedProvince.name}</span>.
                          </>
                        ) : (
                          <>
                            Tanyakan apa saja tentang seni, sejarah, rahasia resep makanan tradisional, atau mintalah rencana perjalanan kustom di{" "}
                            <span className="font-semibold text-blue-600">{selectedProvince.name}</span>.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Quick Suggestions Cards */}
                    {!aiResponse && !aiLoading && (
                      <div className="space-y-2">
                        <span className={`text-[10px] uppercase tracking-widest font-bold block mb-1 ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                          {language === "en" ? "Recommended Questions:" : "Rekomendasi Pertanyaan:"}
                        </span>
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setAiQuestion(q);
                              askGemini("general", q);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all duration-300 flex items-center justify-between gap-2 group border ${theme === "dark" ? "bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-gray-300 hover:text-white hover:border-blue-500/30" : "bg-white/60 hover:bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-blue-400 shadow-sm"}`}
                          >
                            <span className="line-clamp-2">{q}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI Processing State */}
                    {aiLoading && (
                      <div className="flex flex-col items-center justify-center py-10 space-y-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                          <Sparkles className={`w-5 h-5 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${effectsEnabled ? "animate-pulse" : ""}`} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-blue-500 font-medium">
                            {language === "en" ? "Gemini AI is thinking..." : "Gemini AI sedang berpikir..."}
                          </p>
                          <span className={`text-[10px] ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                            {language === "en" ? "Connecting Nusantara network" : "Menghubungkan jaringan Nusantara"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Text Output Display */}
                    {aiResponse && !aiLoading && (
                      <div className={`p-4 rounded-2xl max-h-[240px] overflow-y-auto text-sm space-y-3 custom-scrollbar border transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5 text-gray-300" : "bg-white/70 border-slate-200/80 text-slate-800 shadow-inner"}`}>
                        <div className={theme === "dark" ? "prose prose-invert prose-sm" : "prose prose-slate prose-sm text-slate-800"}>
                          {aiResponse.split("\n").map((line, i) => {
                            if (line.startsWith("### ")) {
                              return <h3 key={i} className={`text-base font-bold mt-3 mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{line.replace("### ", "")}</h3>;
                            } else if (line.startsWith("- ") || line.startsWith("* ")) {
                              return <li key={i} className={`ml-4 list-disc my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.substring(2)}</li>;
                            } else if (line.match(/^\d+\./)) {
                              return <li key={i} className={`ml-4 list-decimal my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.replace(/^\d+\.\s*/, "")}</li>;
                            } else if (line.trim() === "") {
                              return <div key={i} className="h-2" />;
                            }
                            return <p key={i} className={`leading-relaxed mb-2 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Custom AI Query Form Input */}
                  <motion.div variants={cascadeItemVariants} className={`mt-4 pt-3 border-t flex gap-2 ${theme === "dark" ? "border-white/5" : "border-slate-100"}`}>
                    <input
                      type="text"
                      placeholder={
                        language === "en"
                          ? `Ask about ${selectedProvince.name}...`
                          : `Tanya tentang ${selectedProvince.name}...`
                      }
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiQuestion.trim() && !aiLoading) {
                          askGemini("general", aiQuestion);
                        }
                      }}
                      className={`flex-1 rounded-xl px-4 py-2 text-xs transition-colors border focus:outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"}`}
                      disabled={aiLoading}
                    />
                    <button
                      onClick={() => {
                        if (aiQuestion.trim() && !aiLoading) {
                          askGemini("general", aiQuestion);
                        }
                      }}
                      disabled={!aiQuestion.trim() || aiLoading}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-500 p-2 rounded-xl transition-all duration-300 text-white shadow-md hover:scale-105 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    {aiResponse && (
                      <button
                        onClick={() => {
                          setAiResponse("");
                          setAiQuestion("");
                        }}
                        className={`border p-2 rounded-xl transition-colors shrink-0 ${theme === "dark" ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"}`}
                        title={language === "en" ? "Reset Conversation" : "Reset Percakapan"}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Tab: Itinerary AI Generator */}
              {activeTab === "itinerary" && (
                <motion.div 
                  key={`itinerary-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 flex flex-col"
                >
                  <motion.div variants={cascadeItemVariants}>
                    {/* Header */}
                    <div className={`p-3.5 rounded-2xl mb-4 border transition-colors ${theme === "dark" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Compass className={`w-4 h-4 ${effectsEnabled ? "animate-spin-slow" : ""}`} />
                        <span>{language === "en" ? "AI Itinerary Planner" : "Rencana Perjalanan AI"}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                        {language === "en" ? (
                          <>
                            Design your perfect holiday in <span className="font-semibold text-emerald-600">{selectedProvince.name}</span> in rich detail powered by AI.
                          </>
                        ) : (
                          <>
                            Rancang rencana liburan sempurna di <span className="font-semibold text-emerald-600">{selectedProvince.name}</span> secara detail berbasis kecerdasan buatan.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Selector Form Controls */}
                    <div className={`grid grid-cols-2 gap-3 mb-4 p-3 rounded-2xl border transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/50 border-slate-200/60"}`}>
                      <div>
                        <label className={`text-[10px] uppercase tracking-widest font-bold block mb-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {language === "en" ? "Trip Duration:" : "Durasi Wisata:"}
                        </label>
                        <select
                          value={itineraryDays}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setItineraryDays(val);
                            generateItinerary(val, itineraryPref);
                          }}
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs transition-colors border focus:outline-none ${theme === "dark" ? "bg-[#050608] border-white/10 text-white focus:border-emerald-500" : "bg-white border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"}`}
                        >
                          <option value="1" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "1 Day (One Day)" : "1 Hari (One Day)"}
                          </option>
                          <option value="2" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "2 Days (Weekend)" : "2 Hari (Weekend)"}
                          </option>
                          <option value="3" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "3 Days (Recommended)" : "3 Hari (Disarankan)"}
                          </option>
                          <option value="4" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "4 Days (Complete)" : "4 Hari (Lengkap)"}
                          </option>
                          <option value="5" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "5 Days (Full)" : "5 Hari (Puas)"}
                          </option>
                          <option value="7" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "7 Days (Exclusive)" : "7 Hari (Eksklusif)"}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-[10px] uppercase tracking-widest font-bold block mb-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {language === "en" ? "Travel Style:" : "Gaya Wisata:"}
                        </label>
                        <select
                          value={itineraryPref}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setItineraryPref(val);
                            generateItinerary(itineraryDays, val);
                          }}
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs transition-colors border focus:outline-none ${theme === "dark" ? "bg-[#050608] border-white/10 text-white focus:border-emerald-500" : "bg-white border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"}`}
                        >
                          <option value="campuran" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "Mixed (All-in-one)" : "Campuran (All-in-one)"}
                          </option>
                          <option value="alam" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "🌴 Nature" : "🌴 Wisata Alam"}
                          </option>
                          <option value="budaya" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "🕌 Culture" : "🕌 Wisata Budaya"}
                          </option>
                          <option value="kuliner" className={theme === "dark" ? "bg-[#050608] text-white" : "bg-white text-slate-800"}>
                            {language === "en" ? "🍜 Culinary" : "🍜 Wisata Kuliner"}
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* AI Processing State */}
                    {itineraryLoading && (
                      <div className="flex flex-col items-center justify-center py-10 space-y-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                          <Compass className={`w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${effectsEnabled ? "animate-pulse" : ""}`} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-emerald-500 font-medium">
                            {language === "en" ? "Gemini AI is crafting the best plan..." : "Gemini AI merancang rencana terbaik..."}
                          </p>
                          <span className={`text-[10px] ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                            {language === "en" ? "Connecting iconic destinations" : "Menghubungkan destinasi ikonik"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Itinerary Output Display */}
                    {itineraryResponse && !itineraryLoading && (
                      <div className={`p-4 rounded-2xl max-h-[280px] overflow-y-auto text-sm space-y-3 custom-scrollbar border transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5 text-gray-300" : "bg-white/70 border-slate-200/80 text-slate-800 shadow-inner"}`}>
                        <div className={theme === "dark" ? "prose prose-invert prose-sm" : "prose prose-slate prose-sm text-slate-800"}>
                          {itineraryResponse.split("\n").map((line, i) => {
                            if (line.startsWith("### ")) {
                              return <h3 key={i} className={`text-base font-bold mt-4 mb-1 border-b pb-1 ${theme === "dark" ? "text-white border-white/5" : "text-slate-900 border-slate-100"}`}>{line.replace("### ", "")}</h3>;
                            } else if (line.startsWith("#### ")) {
                              return <h4 key={i} className="text-sm font-bold text-emerald-600 mt-3 mb-1 flex items-center gap-1.5">{line.replace("#### ", "")}</h4>;
                            } else if (line.startsWith("- ") || line.startsWith("* ")) {
                              return <li key={i} className={`ml-4 list-disc my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.substring(2)}</li>;
                            } else if (line.match(/^\d+\./)) {
                              return <li key={i} className={`ml-4 list-decimal my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.replace(/^\d+\.\s*/, "")}</li>;
                            } else if (line.trim() === "") {
                              return <div key={i} className="h-2" />;
                            }
                            return <p key={i} className={`leading-relaxed mb-2 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Manual trigger / regenerate button */}
                  {!itineraryLoading && (
                    <motion.button
                      variants={cascadeItemVariants}
                      onClick={() => generateItinerary(itineraryDays, itineraryPref)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {language === "en" ? "Regenerate Travel Plan" : "Rancang Ulang Rencana Perjalanan"}
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Tab: Packing & Preparation Checklist AI */}
              {activeTab === "checklist" && (
                <motion.div 
                  key={`checklist-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 flex flex-col"
                >
                  <motion.div variants={cascadeItemVariants}>
                    {/* Header Banner */}
                    <div className={`p-3.5 rounded-2xl mb-4 border transition-colors ${theme === "dark" ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-800"}`}>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
                        <ListTodo className={`w-4 h-4 ${effectsEnabled ? "animate-spin-slow" : ""}`} />
                        <span>{language === "en" ? "AI Packing & Prep Checklist" : "Checklist Persiapan & Packing AI"}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
                        {language === "en" ? (
                          <>
                            Generate a customized prep list for <span className="font-semibold text-indigo-600">{selectedProvince.name}</span> based on local climate, culture, and planned activities.
                          </>
                        ) : (
                          <>
                            Buat daftar persiapan kustom ke <span className="font-semibold text-indigo-600">{selectedProvince.name}</span> berdasarkan kondisi iklim, adat budaya lokal, dan rencana aktivitas Anda.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Selector / Preset Tags Form */}
                    <div className={`space-y-3 mb-4 p-3.5 rounded-2xl border transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/50 border-slate-200/60"}`}>
                      <div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold block mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {language === "en" ? "Planned Activities:" : "Rencana Aktivitas:"}
                        </span>
                        
                        {/* Preset Tags Grid */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: "nature", labelEn: "🌴 Nature Exploration", labelId: "🌴 Wisata Alam" },
                            { id: "culture", labelEn: "🕌 Culture Tour", labelId: "🕌 Wisata Budaya" },
                            { id: "beach", labelEn: "🌊 Beach & Snorkeling", labelId: "🌊 Pantai & Selam" },
                            { id: "hiking", labelEn: "🥾 Hiking & Camping", labelId: "🥾 Mendaki Gunung" },
                            { id: "culinary", labelEn: "🍜 Culinary Trip", labelId: "🍜 Wisata Kuliner" },
                          ].map(act => {
                            const isSelected = checklistActivities.includes(act.id);
                            return (
                              <button
                                key={act.id}
                                onClick={() => {
                                  let newActivities;
                                  if (isSelected) {
                                    newActivities = checklistActivities.filter(a => a !== act.id);
                                  } else {
                                    newActivities = [...checklistActivities, act.id];
                                  }
                                  setChecklistActivities(newActivities);
                                  generateChecklist(newActivities, customActivity);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all border duration-200 cursor-pointer ${
                                  isSelected 
                                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" 
                                    : (theme === "dark" ? "bg-white/5 border-white/10 text-gray-400 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800")
                                  }`}
                              >
                                {language === "en" ? act.labelEn : act.labelId}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Input Field */}
                      <div>
                        <label className={`text-[10px] uppercase tracking-widest font-bold block mb-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {language === "en" ? "Custom Planned Activities (Optional):" : "Aktivitas Tambahan Lainnya (Opsional):"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={language === "en" ? "e.g., boat tour, attending temple ceremony..." : "misal: keliling naik perahu, menghadiri upacara adat..."}
                            value={customActivity}
                            onChange={(e) => setCustomActivity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !checklistLoading) {
                                generateChecklist(checklistActivities, customActivity);
                              }
                            }}
                            className={`flex-1 rounded-xl px-3 py-1.5 text-xs transition-colors border focus:outline-none ${theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"}`}
                            disabled={checklistLoading}
                          />
                          <button
                            onClick={() => generateChecklist(checklistActivities, customActivity)}
                            disabled={checklistLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-white cursor-pointer hover:scale-105 shrink-0"
                          >
                            {language === "en" ? "Generate" : "Rancang"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI Processing / Loading State */}
                    {checklistLoading && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                          <ListTodo className={`w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${effectsEnabled ? "animate-pulse" : ""}`} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-indigo-500 font-medium">
                            {language === "en" ? "Gemini AI is crafting your checklist..." : "Gemini AI merancang checklist bawaan..."}
                          </p>
                          <span className={`text-[10px] ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                            {language === "en" ? "Analyzing climate and cultural etiquettes" : "Menganalisis iklim & kesopanan daerah"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Checklist Output Parser & Display */}
                    {checklistResponse && !checklistLoading && (
                      <div className="space-y-3">
                        {/* Dynamic Progress Tracker bar */}
                        {(() => {
                          const lines = checklistResponse.split("\n");
                          const checkboxLines = lines.filter(line => line.match(/^-\s*\[([ xX])\]\s*(.*)/));
                          const totalCheckboxes = checkboxLines.length;
                          const checkedCount = checkboxLines.filter(line => {
                            const match = line.match(/^-\s*\[([ xX])\]\s*(.*)/);
                            if (match) {
                              const content = match[2];
                              const itemKey = `${selectedProvince.id}_${content}`;
                              const isCheckedDefault = match[1].toLowerCase() === "x";
                              return checkedItems[itemKey] !== undefined ? checkedItems[itemKey] : isCheckedDefault;
                            }
                            return false;
                          }).length;
                          const progressPercent = totalCheckboxes > 0 ? Math.round((checkedCount / totalCheckboxes) * 100) : 0;

                          if (totalCheckboxes === 0) return null;

                          return (
                            <div className={`p-3 rounded-2xl flex flex-col gap-1.5 animate-fadeIn border ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white/60 border-slate-200/60 shadow-sm"}`}>
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className={`font-semibold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>{language === "en" ? "Packing Completion:" : "Kesiapan Barang Bawaan:"}</span>
                                <span className={`${progressPercent === 100 ? "text-emerald-500 font-bold animate-bounce" : (theme === "dark" ? "text-gray-400" : "text-slate-500")}`}>
                                  {checkedCount} / {totalCheckboxes} {language === "en" ? "items packed" : "barang siap"} ({progressPercent}%)
                                </span>
                              </div>
                              <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-slate-100"}`}>
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Interactive Checklist list container */}
                        <div className={`p-4 rounded-2xl max-h-[250px] overflow-y-auto text-sm space-y-2.5 custom-scrollbar border transition-colors ${theme === "dark" ? "bg-white/[0.02] border-white/5 text-gray-300" : "bg-white/70 border-slate-200/80 text-slate-800 shadow-inner"}`}>
                          <div className={theme === "dark" ? "prose prose-invert prose-sm" : "prose prose-slate prose-sm text-slate-800"}>
                            {checklistResponse.split("\n").map((line, i) => {
                              const chkMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)/);
                              if (chkMatch) {
                                const isCheckedDefault = chkMatch[1].toLowerCase() === "x";
                                const content = chkMatch[2];
                                const itemKey = `${selectedProvince.id}_${content}`;
                                const isChecked = checkedItems[itemKey] !== undefined ? checkedItems[itemKey] : isCheckedDefault;
                                return (
                                  <div key={i} className={`flex items-start gap-2.5 my-1.5 py-1 px-1.5 rounded-lg transition-colors duration-200 ${theme === "dark" ? "hover:bg-white/[0.02]" : "hover:bg-slate-100"}`}>
                                    <input
                                      type="checkbox"
                                      id={`chk-${i}`}
                                      checked={isChecked}
                                      onChange={() => {
                                        setCheckedItems(prev => ({
                                          ...prev,
                                          [itemKey]: !isChecked
                                        }));
                                      }}
                                      className={`mt-1 h-3.5 w-3.5 rounded border focus:ring-indigo-500 cursor-pointer ${theme === "dark" ? "border-white/10 bg-black/40 accent-indigo-500" : "border-slate-300 bg-white text-indigo-600 accent-indigo-600"}`}
                                    />
                                    <label htmlFor={`chk-${i}`} className={`text-xs cursor-pointer select-none leading-relaxed transition-all ${isChecked ? "line-through text-gray-500 italic" : (theme === "dark" ? "text-gray-300" : "text-slate-700")}`}>
                                      {(() => {
                                        const boldMatch = content.match(/^\*\*(.*?)\*\*:(.*)/) || content.match(/^\*\*(.*?)\*\*(.*)/);
                                        if (boldMatch) {
                                          return (
                                            <>
                                              <strong className={isChecked ? "text-gray-500 font-semibold" : (theme === "dark" ? "text-white font-semibold" : "text-slate-950 font-bold")}>{boldMatch[1]}</strong>
                                              {boldMatch[2]}
                                            </>
                                          );
                                        }
                                        return content;
                                      })()}
                                    </label>
                                  </div>
                                );
                              }

                              if (line.startsWith("### ")) {
                                return <h3 key={i} className={`text-sm font-bold mt-4 mb-1 border-b pb-1 flex items-center gap-1.5 ${theme === "dark" ? "text-white border-white/5" : "text-slate-900 border-slate-100"}`}>{line.replace("### ", "")}</h3>;
                              } else if (line.startsWith("#### ")) {
                                return <h4 key={i} className="text-xs font-bold text-indigo-500 mt-3 mb-1 flex items-center gap-1.5">{line.replace("#### ", "")}</h4>;
                              } else if (line.startsWith("- ") || line.startsWith("* ")) {
                                return <li key={i} className={`ml-4 list-disc my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.substring(2)}</li>;
                              } else if (line.match(/^\d+\./)) {
                                return <li key={i} className={`ml-4 list-decimal my-0.5 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line.replace(/^\d+\.\s*/, "")}</li>;
                              } else if (line.trim() === "") {
                                return <div key={i} className="h-1.5" />;
                              }
                              return <p key={i} className={`leading-relaxed mb-1.5 text-xs ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{line}</p>;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Manual trigger / reset button */}
                  {checklistResponse && !checklistLoading && (
                    <motion.button
                      variants={cascadeItemVariants}
                      onClick={() => generateChecklist(checklistActivities, customActivity)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {language === "en" ? "Regenerate Checklist" : "Rancang Ulang Checklist"}
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Tab: Province Rankings & Metrics */}
              {activeTab === "ranking" && (
                <motion.div
                  key={`ranking-${selectedProvince.id}`}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={cascadeItemVariants}>
                    <ProvinceRanking
                      selectedProvince={selectedProvince}
                      onSelectProvince={(prov) => {
                        setSelectedProvince(prov);
                      }}
                      language={language}
                      theme={theme}
                    />
                  </motion.div>
                </motion.div>
              )}

            </div>
          </div>
          </div>
          </section>
          )}

          {/* CENTER / FULL INTERACTIVE DIGITAL MAP (FULL-WIDTH) */}
          <section className="w-full h-full order-1">
            
            {/* Main Map Box */}
            <div className={`relative overflow-hidden flex flex-col w-full h-full transition-all duration-300 ${theme === "dark" ? "bg-black" : "bg-white"}`}>

            {/* Interactive Leaflet Satellite Map Container */}
            <div className="relative z-10 w-full h-full flex-1">
              {/* HEADER / TOP FLOATING MENU (Floating on Upper Map) */}
              <nav id="top-nav" className="absolute bottom-3 right-3 z-[401] transition-all duration-300">
                <div className={`inline-flex backdrop-blur-3xl border rounded-full px-3 md:px-4.5 py-1.5 md:py-2 flex-row items-center justify-between gap-2.5 transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-black/10 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
                    : "bg-white/15 border-white/25 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"
                }`}>
                  {/* Logo Brand */}
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedProvince(PROVINCES.find(p => p.id === "jakarta")!)}>
                    <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-sm tracking-wider">
                      I
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs md:text-sm font-bold tracking-widest uppercase flex items-center gap-1 transition-colors ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        INDONESIAN<span className="text-blue-500 font-light">EXPLORER</span>
                      </span>
                      <span className={`text-[7px] md:text-[8px] uppercase tracking-widest font-mono transition-colors ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>{language === "en" ? "INTERACTIVE MAP OF INDONESIA" : "PETA INTERAKTIF INDONESIA"}</span>
                    </div>
                  </div>


                </div>
              </nav>
              <SatelliteMap
                selectedProvince={selectedProvince}
                onSelectProvince={(province) => {
                  setSelectedProvince(province);
                  setHasClickedMarker(true);
                  // Scroll to info-panel smoothly so it is immediately visible
                  setTimeout(() => {
                    const el = document.getElementById("info-panel");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 120);
                  // Preload AI response when a province is clicked on the map
                  if (activeTab === "ai") {
                    setTimeout(() => {
                      askGemini("general");
                    }, 100);
                  }
                }}
                filteredProvinces={filteredProvinces}
                theme={theme}
                language={language}
                showMarkers={showMarkers}
                setShowMarkers={setShowMarkers}
                showRegionLabels={showRegionLabels}
                setShowRegionLabels={setShowRegionLabels}
                showRankingsOverlay={showRankingsOverlay}
                setShowRankingsOverlay={setShowRankingsOverlay}
                userLocation={userLocation}
              />
            </div>

            {/* Bottom Stats Banner (Floating Overlay) */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-[400] transition-colors duration-300 pointer-events-none">
              {/* Live Indonesian Time Zones Indicators */}
              <div className={`flex items-center gap-2.5 text-[10px] sm:text-xs font-mono py-1.5 px-3 md:px-3.5 rounded-full transition-colors border backdrop-blur-3xl shadow-2xl pointer-events-auto ${theme === "dark" ? "bg-black/65 border-white/10 text-gray-300" : "bg-white/15 border-white/25 text-slate-700 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]"}`}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="text-gray-400 uppercase text-[9px] hidden lg:inline">Time Zones:</span>
                </div>
                <div className="flex gap-2 text-[10px] sm:text-xs">
                  <span className={`transition-colors ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>WIB: <span className="text-blue-500 font-semibold">{getTimeString(7)}</span></span>
                  <span className="text-gray-500">|</span>
                  <span className={`transition-colors ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>WITA: <span className="text-emerald-500 font-semibold">{getTimeString(8)}</span></span>
                  <span className="text-gray-500">|</span>
                  <span className={`transition-colors ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>WIT: <span className="text-amber-500 font-semibold">{getTimeString(9)}</span></span>
                </div>
              </div>
            </div>

            {/* Floating Rankings Panel Overlay on Map */}
            <AnimatePresence>
              {showRankingsOverlay && (
                <motion.div 
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`absolute top-[72px] left-6 bottom-[84px] z-30 w-[calc(100%-3rem)] max-w-[360px] overflow-hidden rounded-2xl p-5 border shadow-2xl flex flex-col transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-black/65 backdrop-blur-3xl border-white/20 shadow-black/80 text-white"
                      : "bg-white/30 backdrop-blur-3xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] text-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4 pb-2 border-b transition-colors border-slate-200/50 dark:border-white/5 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-indigo-400">
                      <TrendingUp className="w-4 h-4 animate-pulse" />
                      <span>{language === "en" ? "Leaderboard" : "Papan Peringkat"}</span>
                    </div>
                    <button 
                      onClick={() => setShowRankingsOverlay(false)}
                      className={`p-1 rounded-lg transition-colors border ${
                        theme === "dark" 
                          ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                    <ProvinceRanking
                      selectedProvince={selectedProvince}
                      onSelectProvince={(prov) => {
                        setSelectedProvince(prov);
                      }}
                      language={language}
                      theme={theme}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



          </div>

          </section>

        </div>

      </main>



    </motion.div>
  );
}

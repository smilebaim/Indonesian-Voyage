import React, { useEffect, useState } from "react";
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  CloudDrizzle, 
  CloudSnow, 
  Wind, 
  Droplets,
  Thermometer,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { Province } from "../data/provinces";
import { getProvinceLatLng } from "../data/coordinates";

interface WeatherWidgetProps {
  province: Province;
  language: "id" | "en";
  theme?: "dark" | "light";
}

interface WeatherState {
  temp: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  loading: boolean;
  error: boolean;
}

const getWeatherInfo = (code: number, isDay: boolean) => {
  const iconColor = "w-7 h-7 text-amber-400";
  const rainColor = "w-7 h-7 text-blue-400";
  const cloudColor = "w-7 h-7 text-gray-300";
  const snowColor = "w-7 h-7 text-sky-200";
  const thunderColor = "w-7 h-7 text-purple-400 animate-pulse";

  switch (code) {
    case 0:
      return {
        labelId: "Cerah",
        labelEn: "Clear Sky",
        icon: isDay ? <Sun className={`${iconColor} animate-[spin_20s_linear_infinite]`} /> : <Cloud className={cloudColor} />
      };
    case 1:
      return {
        labelId: "Sebagian Besar Cerah",
        labelEn: "Mainly Clear",
        icon: isDay ? <CloudSun className={iconColor} /> : <Cloud className={cloudColor} />
      };
    case 2:
      return {
        labelId: "Berawan Sebagian",
        labelEn: "Partly Cloudy",
        icon: <CloudSun className={iconColor} />
      };
    case 3:
      return {
        labelId: "Mendung",
        labelEn: "Overcast",
        icon: <Cloud className={cloudColor} />
      };
    case 45:
    case 48:
      return {
        labelId: "Kabut",
        labelEn: "Foggy",
        icon: <Cloud className="w-7 h-7 text-gray-400/80" />
      };
    case 51:
    case 53:
    case 55:
      return {
        labelId: "Gerimis",
        labelEn: "Drizzle",
        icon: <CloudDrizzle className={rainColor} />
      };
    case 61:
    case 63:
    case 65:
      return {
        labelId: "Hujan",
        labelEn: "Rainy",
        icon: <CloudRain className={rainColor} />
      };
    case 71:
    case 73:
    case 75:
      return {
        labelId: "Berbuih Salju",
        labelEn: "Snowy",
        icon: <CloudSnow className={snowColor} />
      };
    case 80:
    case 81:
    case 82:
      return {
        labelId: "Hujan Deras",
        labelEn: "Rain Showers",
        icon: <CloudRain className={rainColor} />
      };
    case 95:
    case 96:
    case 99:
      return {
        labelId: "Badai Petir",
        labelEn: "Thunderstorm",
        icon: <CloudLightning className={thunderColor} />
      };
    default:
      return {
        labelId: "Cerah Berawan",
        labelEn: "Partly Cloudy",
        icon: <CloudSun className={iconColor} />
      };
  }
};

export default function WeatherWidget({ province, language, theme = "dark" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherState>({
    temp: 0,
    humidity: 0,
    weatherCode: 0,
    windSpeed: 0,
    isDay: true,
    loading: true,
    error: false
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const { lat, lng } = getProvinceLatLng(province.id);

    setWeather(prev => ({ ...prev, loading: true, error: false }));

    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather request failed");
        
        const data = await res.json();
        
        if (active && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            humidity: Math.round(data.current.relative_humidity_2m),
            weatherCode: data.current.weather_code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            isDay: data.current.is_day === 1,
            loading: false,
            error: false
          });
        }
      } catch (err) {
        console.error("Weather load error", err);
        if (active) {
          setWeather(prev => ({ ...prev, loading: false, error: true }));
        }
      }
    };

    fetchWeather();

    return () => {
      active = false;
    };
  }, [province.id, refreshTrigger]);

  const info = getWeatherInfo(weather.weatherCode, weather.isDay);
  const conditionLabel = language === "en" ? info.labelEn : info.labelId;

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`border rounded-2xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${theme === "dark" ? "bg-white/[0.02] hover:bg-white/[0.04] border-white/5" : "bg-white/50 hover:bg-white/70 border-slate-200/80 shadow-[0_4px_12px_rgba(31,38,135,0.02)]"}`}
    >
      {/* Upper info section */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-gray-400">
            {language === "en" ? `Weather in ${province.capital}` : `Cuaca di ${province.capital}`}
          </span>
          
          {weather.loading ? (
            <div className={`h-6 w-32 animate-pulse rounded mt-1 ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`} />
          ) : weather.error ? (
            <span className="text-xs font-medium text-red-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {language === "en" ? "Failed to load" : "Gagal memuat"}
            </span>
          ) : (
            <span className="text-sm font-semibold tracking-tight flex items-baseline gap-1 mt-0.5 text-white">
              <span>{conditionLabel}</span>
              <span className="text-xs font-normal text-gray-400">({weather.isDay ? (language === "en" ? "Day" : "Siang") : (language === "en" ? "Night" : "Malam")})</span>
            </span>
          )}
        </div>

        {/* Condition Icon */}
        <div className="flex items-center gap-2">
          {weather.loading ? (
            <div className={`w-8 h-8 rounded-full animate-pulse ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`} />
          ) : weather.error ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`}>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all bg-white/5 border-white/10">
              {info.icon}
            </div>
          )}

          {/* Refresh Action */}
          <button 
            onClick={handleRefresh}
            className="p-1.5 rounded-lg transition-all border hover:bg-white/5 border-transparent hover:border-white/10 text-gray-400 hover:text-white"
            title={language === "en" ? "Refresh weather" : "Perbarui cuaca"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${weather.loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Weather metrics row */}
      <div className={`grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t ${theme === "dark" ? "border-white/5" : "border-slate-200"}`}>
        {/* Temp */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1 transition-colors text-gray-400">
            <Thermometer className="w-3 h-3 text-red-400/80" />
            Suhu
          </span>
          {weather.loading ? (
            <div className={`h-4 w-12 animate-pulse rounded ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`} />
          ) : weather.error ? (
            <span className="text-xs font-semibold text-gray-400">--</span>
          ) : (
            <span className="text-xs font-bold font-mono transition-colors text-white">
              {weather.temp}°C
            </span>
          )}
        </div>

        {/* Humidity */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1 transition-colors text-gray-400">
            <Droplets className="w-3 h-3 text-blue-400/80" />
            {language === "en" ? "Humid" : "Lembab"}
          </span>
          {weather.loading ? (
            <div className={`h-4 w-12 animate-pulse rounded ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`} />
          ) : weather.error ? (
            <span className="text-xs font-semibold text-gray-400">--</span>
          ) : (
            <span className="text-xs font-bold font-mono transition-colors text-white">
              {weather.humidity}%
            </span>
          )}
        </div>

        {/* Wind */}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 mb-1 transition-colors text-gray-400">
            <Wind className="w-3 h-3 text-teal-400/80" />
            {language === "en" ? "Wind" : "Angin"}
          </span>
          {weather.loading ? (
            <div className={`h-4 w-12 animate-pulse rounded ${theme === "dark" ? "bg-white/5" : "bg-slate-200"}`} />
          ) : weather.error ? (
            <span className="text-xs font-semibold text-gray-400">--</span>
          ) : (
            <span className="text-xs font-bold font-mono transition-colors text-white">
              {weather.windSpeed} km/h
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

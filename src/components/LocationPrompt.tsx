import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, X } from "lucide-react";

interface LocationPromptProps {
  onAllow: () => void;
  onDeny: () => void;
  language?: "id" | "en";
  theme?: "dark" | "light";
}

export default function LocationPrompt({ onAllow, onDeny, language = "id", theme = "dark" }: LocationPromptProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDeny}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
            theme === "dark" 
              ? "bg-slate-900 border-white/10" 
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
            }`}>
              <MapPin className={`w-8 h-8 ${theme === "dark" ? "text-blue-400" : "text-blue-600"} animate-bounce`} />
            </div>
            
            <h2 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              {language === "en" ? "Enable Location" : "Izinkan Akses Lokasi"}
            </h2>
            
            <p className={`text-sm mb-6 leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
              {language === "en" 
                ? "Allow this app to access your location so we can automatically display the map according to where you are." 
                : "Aplikasi ini membutuhkan akses lokasi untuk menampilkan posisi Anda di peta secara otomatis di awal."}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={onAllow}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Navigation className="w-4 h-4" />
                {language === "en" ? "Allow Location" : "Izinkan Lokasi"}
              </button>
              
              <button
                onClick={onDeny}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  theme === "dark" 
                    ? "bg-white/5 hover:bg-white/10 text-gray-300" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {language === "en" ? "Not Now" : "Nanti Saja"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}

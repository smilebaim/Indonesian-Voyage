import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getProvinceTimeline, TimelineEvent } from "../data/history";
import { History, Calendar, Award, Compass, ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface ProvinceHistoryProps {
  provinceId: string;
  island: string;
  provinceName: string;
  language?: "id" | "en";
  theme?: "dark" | "light";
}

export default function ProvinceHistory({
  provinceId,
  island,
  provinceName,
  language = "id",
  theme = "dark",
}: ProvinceHistoryProps) {
  const isDark = theme === "dark";
  const isEn = language === "en";

  const timeline = getProvinceTimeline(provinceId, island, provinceName);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Reset active step when province changes
  useEffect(() => {
    setActiveStep(0);
  }, [provinceId]);

  const activeEvent = timeline[activeStep] || timeline[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
      {/* Sidebar: Interactive Chronological Stepper */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-amber-500 animate-[spin_8s_linear_infinite]" />
          <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-300" : "text-slate-800"}`}>
            {isEn ? "Historical Milestones" : "Tonggak Sejarah Wilayah"}
          </h4>
        </div>

        {/* Stepper Steps List */}
        <div className="relative pl-4 flex flex-col gap-5 border-l-2 ml-3 transition-colors duration-300 border-dashed"
             style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" }}>
          {timeline.map((event, index) => {
            const isActive = index === activeStep;
            const isPassed = index < activeStep;

            return (
              <button
                key={`step-${index}`}
                onClick={() => setActiveStep(index)}
                className="group relative flex flex-col items-start text-left focus:outline-none w-full"
              >
                {/* Stepper Bullet Node */}
                <div className="absolute -left-[27px] top-1 flex items-center justify-center">
                  <div
                    className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-amber-500 border-amber-500 scale-125 shadow-lg shadow-amber-500/25"
                        : isPassed
                        ? "bg-blue-500/20 border-blue-500 scale-100"
                        : isDark
                        ? "bg-zinc-900 border-zinc-700 hover:border-gray-500"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : isPassed ? (
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                    ) : null}
                  </div>
                </div>

                {/* Event summary content */}
                <div className="pl-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`font-mono text-xs font-bold transition-colors ${
                        isActive
                          ? "text-amber-500"
                          : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    >
                      {event.year}
                    </span>
                    {event.tag && (
                      <span
                        className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded transition-all ${
                          isActive
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {isEn ? event.tag.en : event.tag.id}
                      </span>
                    )}
                  </div>
                  <h5
                    className={`text-[12px] font-bold transition-all ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {isEn ? event.title.en : event.title.id}
                  </h5>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spotlight Era Detail Card */}
      <div className="xl:w-[280px] lg:w-[240px] flex-none flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={`spotlight-${provinceId}-${activeStep}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={`flex-1 p-4.5 rounded-2xl border flex flex-col justify-between relative overflow-hidden shadow-lg ${
              isDark
                ? "bg-white/[0.02] border-white/5 shadow-black/40"
                : "bg-white/70 border-slate-200/80 shadow-[0_4px_16px_rgba(31,38,135,0.04)]"
            }`}
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none rounded-bl-3xl" />

            <div className="flex flex-col gap-3">
              {/* Top Meta info */}
              <div className="flex items-center justify-between">
                <span className="border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border">
                  {activeEvent.year}
                </span>
                <span className="text-[9px] font-semibold text-gray-400 font-mono">
                  {isEn ? "ERA DETAILS" : "RINCIAAN ERA"}
                </span>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1.5">
                <h4 className="text-[13px] font-extrabold leading-snug text-white">
                  {isEn ? activeEvent.title.en : activeEvent.title.id}
                </h4>
                <p className="text-[11px] leading-relaxed transition-colors text-gray-300">
                  {isEn ? activeEvent.description.en : activeEvent.description.id}
                </p>
              </div>
            </div>

            {/* Quick Trivia / AI Spark Fact */}
            <div className="mt-4 pt-3.5 border-t flex flex-col gap-1.5 border-white/5">
              <span className="flex items-center gap-1.5 text-[9px] font-extrabold text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                {isEn ? "Historical Fact" : "Fakta Menarik"}
              </span>
              <p className="text-[10px] leading-normal italic text-gray-400">
                {isEn 
                  ? `This era represents a key chapter of ${provinceName}'s legacy, shaping its present cultural identity.`
                  : `Era ini merupakan babak penting dari warisan ${provinceName}, yang membentuk identitas budayanya saat ini.`}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

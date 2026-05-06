"use client";

import { ChevronRight } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShouldDo() {
  const { suggestions, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const suggestion = suggestions.length > 0 ? suggestions[0] : null;

  if (isLoading && !suggestion) {
    return (
      <div className="flex items-center justify-between h-full animate-pulse">
        <div className="flex flex-col w-full gap-2">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-3 bg-gray-200 rounded mt-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-full">
      <AnimatePresence mode="wait">
        <motion.div 
          key={suggestion?.id || "empty"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col"
        >
          <div className="text-sm font-bold flex items-center gap-1 mb-1">
            {suggestion ? "Should Do!" : "All caught up!"} <span className="text-lg">{suggestion?.icon || "🎉"}</span>
          </div>
          <div className="font-bold text-lg text-[var(--color-text-main)] leading-tight">
            {suggestion?.title || "Great job!"}
          </div>
          {suggestion && (
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-1 font-medium">
              <span className="text-red-400">❤️</span> {(suggestion.likes / 1000).toFixed(1)}k love this
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {suggestion && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <ChevronRight size={16} />
        </motion.button>
      )}
    </div>
  );
}

"use client";

import { useDashboardStore } from "@/lib/store";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function PersonalStreak() {
  const { habits, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Find the highest streak among all habits, or default to 0
  const highestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.current_streak || 0))
    : 0;

  // Let's pretend the max goal is 30 for the progress bar
  const maxGoal = 30;
  const progress = Math.min((highestStreak / maxGoal) * 100, 100);

  if (isLoading && habits.length === 0) {
    return (
      <div className="flex flex-col h-full justify-between gap-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <div className="w-24 h-3 bg-gray-200 rounded"></div>
            <div className="w-10 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🔥
        </motion.div>
        <div>
          <div className="text-xs font-semibold text-[var(--color-text-muted)]">Personal Streak</div>
          <motion.div 
            className="font-bold text-[var(--color-text-main)] text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {highestStreak}-Day Streak!
          </motion.div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-[var(--color-text-muted)]">Current Streak: {highestStreak} Days</span>
          <motion.span 
            className="text-[var(--color-text-main)] font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
        <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--color-primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
}

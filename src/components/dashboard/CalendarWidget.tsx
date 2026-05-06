"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore, useTodoStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarWidget() {
  const { growth, isLoading } = useDashboardStore();
  const { selectedDate, setSelectedDate } = useTodoStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  // Calculate padding days to start on correct day of week (0 = Sunday)
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">{format(currentDate, "MMMM, yyyy")}</h3>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevMonth} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextMonth} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 bg-orange-100/50"
          >
            <ChevronRight size={20} className="text-orange-500" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-xs font-semibold text-gray-400">
            {day.charAt(0)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-3 gap-x-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {daysInMonth.map(day => {
          const isCurrentDay = isToday(day);
          // Mock some active days for visual effect
          const isActive = day.getDate() % 5 === 0 && !isCurrentDay;
          
          return (
            <div key={day.toString()} className="flex justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all relative group",
                  format(day, 'yyyy-MM-dd') === selectedDate
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-orange-200" 
                    : "hover:bg-gray-100 text-gray-700",
                )}
              >
                {format(day, "d")}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-orange-300 rounded-full group-hover:bg-orange-400" />
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
      
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-6 flex items-center gap-2 text-sm font-medium w-fit px-3 py-1 rounded-full",
            growth >= 0 
              ? "text-[var(--color-success)] bg-green-50" 
              : "text-red-600 bg-red-50"
          )}
        >
          <motion.span 
            animate={growth >= 0 ? { y: [0, -2, 0] } : { y: [0, 2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-full text-[10px]",
              growth >= 0 ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
            )}
          >
            {growth >= 0 ? "↑" : "↓"}
          </motion.span>
          {growth >= 0 ? "+" : ""}{growth}% from last month
        </motion.div>
      )}
    </div>
  );
}

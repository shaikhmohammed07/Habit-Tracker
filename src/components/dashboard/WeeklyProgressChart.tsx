"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { format, subDays, startOfWeek, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BarChart3, Activity } from "lucide-react";
import { getTodos } from "@/lib/api";
import { useTodoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function WeeklyProgressChart() {
  const [historicalData, setHistoricalData] = useState<{dateStr: string, count: number, total: number}[]>([]);
  const { todos } = useTodoStore();
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // We need to fetch historical data once, then merge with live today data.
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allTodos = await getTodos();
        const sunday = startOfWeek(new Date(), { weekStartsOn: 0 });
        
        const hist = [];
        for (let i = 0; i < 7; i++) {
          const d = addDays(sunday, i);
          if (isSameDay(d, new Date())) continue;
          
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayTodos = allTodos.filter(t => t.date === dateStr);
          const completedCount = dayTodos.filter(t => t.is_completed).length;
          hist.push({ dateStr, count: completedCount, total: dayTodos.length });
        }
        setHistoricalData(hist);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    if (loading) return [];
    
    const sunday = startOfWeek(new Date(), { weekStartsOn: 0 });
    const today = new Date();
    
    const todayCompleted = todos.filter(t => t.is_completed).length;
    const totalToday = todos.length;

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(sunday, i);
      const isToday = isSameDay(d, today);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      let count = 0;
      let total = 0;

      if (isToday) {
        count = todayCompleted;
        total = totalToday;
      } else {
        const histDay = historicalData.find(h => h.dateStr === dateStr);
        if (histDay) {
          count = histDay.count;
          total = histDay.total;
        }
      }

      // Percentage calculation
      let percentage = 0;
      if (total > 0) {
        percentage = Math.round((count / total) * 100);
      }

      return {
        name: format(d, 'EEE'),
        fullDate: format(d, 'MMM dd'),
        completed: percentage,
        percentageLabel: `${percentage}%`,
        isToday,
        count,
        total
      };
    });

    return weekDays;
  }, [historicalData, todos, loading]);

  const totalWeeklyTasks = chartData.reduce((acc, day) => acc + day.total, 0);
  const completedWeeklyTasks = chartData.reduce((acc, day) => acc + day.count, 0);
  const weeklyAverage = totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold">Weekly Progress</h3>
            <p className="text-[10px] text-gray-400 font-medium">Your activity overview</p>
          </div>
        </div>
        {!showDetails && (
          <button 
            onClick={() => setShowDetails(true)}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
          >
            <Activity size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {showDetails ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors"
                >
                  <ChevronLeft size={14} /> Back to chart
                </button>
                <div className="bg-pink-50 px-2 py-1 rounded-md">
                  <span className="text-[10px] font-bold text-pink-600">{weeklyAverage}% Avg.</span>
                </div>
              </div>
              
              <div className="space-y-2 overflow-y-auto pr-1 max-h-[170px] custom-scrollbar">
                {chartData.map((day) => (
                  <div key={day.name} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-1 h-8 rounded-full transition-all",
                        day.isToday ? "bg-[var(--color-primary)] shadow-[0_0_8px_rgba(255,122,0,0.3)]" : "bg-gray-200 group-hover:bg-pink-200"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--color-text-main)]">
                          {day.name}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{day.fullDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-[var(--color-text-main)]">{day.count}/{day.total}</span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${day.completed}%` }}
                            className="h-full bg-pink-400"
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right">
                        <span className="text-[11px] font-black text-pink-500">{day.completed}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight">{completedWeeklyTasks}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Done this week</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-100" />
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-pink-500">{weeklyAverage}%</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</span>
                </div>
              </div>

              <div className="flex-1 min-h-[140px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="animate-pulse flex gap-4 items-end h-[100px]">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="w-7 bg-gray-200 rounded-t-lg" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFB29A" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FF7A00" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                          <stop offset="100%" stopColor="#FF4D00" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }} 
                        dy={10}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }}
                        itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                        labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                      />
                      <Bar 
                        dataKey="completed" 
                        radius={[6, 6, 6, 6]} 
                        barSize={28}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isToday ? 'url(#todayGradient)' : 'url(#barGradient)'}
                            fillOpacity={entry.isToday ? 1 : 0.4}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

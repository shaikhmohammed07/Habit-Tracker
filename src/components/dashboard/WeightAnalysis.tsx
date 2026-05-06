"use client";

import { useEffect, useState } from "react";
import { getWeights, addWeight, deleteWeight } from "@/lib/api";
import { format, subDays, startOfToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Plus, ChevronRight, Trash2, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WeightAnalysis() {
  const [weights, setWeights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    setIsLoading(true);
    const data = await getWeights();
    setWeights(data);
    setIsLoading(false);
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    const weightNum = parseFloat(newWeight);
    const today = format(startOfToday(), 'yyyy-MM-dd');
    
    const result = await addWeight(weightNum, today);
    if (result) {
      setWeights([...weights, result]);
      setNewWeight("");
      setShowInput(false);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    const success = await deleteWeight(id);
    if (success) {
      setWeights(weights.filter(w => w.id !== id));
    }
  };

  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const previousWeight = weights.length > 1 ? weights[weights.length - 2].weight : latestWeight;
  const diff = latestWeight - previousWeight;
  const isDown = diff < 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[var(--color-primary)]">
            <Scale size={18} />
          </div>
          <h3 className="text-[15px] font-bold">Weight Analysis</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setShowHistory(!showHistory);
              setShowInput(false);
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              showHistory ? "bg-orange-100 text-[var(--color-primary)]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            )}
          >
            <History size={16} />
          </button>
          <button 
            onClick={() => {
              setShowInput(!showInput);
              setShowHistory(false);
            }}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
          >
            <Plus size={16} className={cn("transition-transform", showInput && "rotate-45")} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showInput ? (
          <motion.form
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddWeight}
            className="flex-1 flex flex-col justify-center gap-4 bg-orange-50/50 rounded-2xl p-4 border border-orange-100"
          >
            <div className="text-center">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Log Today's Weight</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-24 text-3xl font-bold bg-transparent border-b-2 border-orange-200 text-center outline-none focus:border-orange-500 transition-colors"
                  placeholder="0.0"
                  autoFocus
                />
                <span className="text-xl font-bold text-orange-300">kg</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"
            >
              Update Log
            </button>
          </motion.form>
        ) : showHistory ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 max-h-[160px]"
          >
            {[...weights].reverse().map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group/item">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-600">{w.weight} kg</span>
                  <span className="text-[9px] text-gray-400 font-medium">{format(new Date(w.date), 'dd MMM yyyy')}</span>
                </div>
                <button
                  onClick={() => handleDeleteWeight(w.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {weights.length === 0 && (
              <div className="text-center py-8 text-[10px] font-bold text-gray-300 uppercase">No History</div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black tracking-tight">{latestWeight || "--"}</span>
              <span className="text-lg font-bold text-gray-400">kg</span>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                isDown ? "bg-green-100 text-green-600" : diff > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
              )}>
                {isDown ? <TrendingDown size={12} /> : diff > 0 ? <TrendingUp size={12} /> : null}
                {Math.abs(diff).toFixed(1)} kg {isDown ? "less" : diff > 0 ? "more" : "no change"}
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">vs last log</span>
            </div>

            <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {weights.slice(-5).map((w) => {
                  const max = Math.max(...weights.slice(-5).map(x => x.weight)) || 1;
                  const min = Math.min(...weights.slice(-5).map(x => x.weight)) || 0;
                  const height = weights.length > 1 
                    ? ((w.weight - min) / (max - min || 1)) * 60 + 20 
                    : 50;
                  
                  return (
                    <div key={w.id} className="flex flex-col items-center gap-2 group/bar">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-3 bg-orange-200 rounded-full group-hover/bar:bg-[var(--color-primary)] transition-colors relative"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {w.weight}
                        </div>
                      </motion.div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase">{format(new Date(w.date), 'EEE')}</span>
                    </div>
                  );
                })}
                {weights.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    No data yet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weight Journey</span>
        <button 
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:gap-2 transition-all"
        >
          View Detailed <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

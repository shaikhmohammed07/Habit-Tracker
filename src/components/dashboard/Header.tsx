"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, Compass } from "lucide-react";
import { useTodoStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { setShowAddForm } = useTodoStore();

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-4xl font-bold flex items-center gap-2 mb-2 text-[var(--color-text-main)]">
          Happy {format(now, "EEEE")} <motion.span 
            className="text-3xl inline-block"
            animate={{ rotate: [0, 20, 0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >👋</motion.span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-medium">
          {format(now, "dd MMM yyyy, hh:mm a")}
        </p>
      </motion.div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAddForm(true)}
        className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-100 transition-all mt-2 text-center flex items-center justify-center gap-2 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Habit
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-transparent border-2 border-gray-100 hover:border-gray-200 text-[var(--color-text-main)] font-bold py-3.5 px-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2"
      >
        <Compass size={18} /> Browse Popular
      </motion.button>

      <button
        onClick={() => supabase.auth.signOut()}
        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors mt-2 text-center"
      >
        Sign Out Account
      </button>
    </div>
  );
}

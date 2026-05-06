"use client";

import { motion, Variants } from "framer-motion";
import Header from "@/components/dashboard/Header";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import PersonalStreak from "@/components/dashboard/PersonalStreak";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import ShouldDo from "@/components/dashboard/ShouldDo";
import WeightAnalysis from "@/components/dashboard/WeightAnalysis";
import TodoList from "@/components/dashboard/TodoList";
import DailyQuoteCard from "@/components/dashboard/DailyQuoteCard";
import WeeklyProgressChart from "@/components/dashboard/WeeklyProgressChart";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/auth/AuthForm";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-app-bg)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-app-bg)] p-4 relative overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]" />
        
        <AuthForm />
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-screen">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          <motion.section variants={itemVariants} className="min-h-[150px]">
            <Header />
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[300px]">
            <CalendarWidget />
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[120px] flex-1">
            <PersonalStreak />
          </motion.section>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          <motion.section variants={itemVariants} className="bg-gradient-to-br from-[#93C5FD] to-[#3B82F6] rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] min-h-[220px] relative overflow-hidden">
            <WeatherWidget />
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-3xl px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[100px]">
            <ShouldDo />
          </motion.section>
          
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[180px] flex-1">
            <WeightAnalysis />
          </motion.section>
        </div>

        {/* Column 3 & 4 Container (Span 2) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Top Row: Todos & Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto xl:h-[350px]">
            <motion.section variants={itemVariants} className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <TodoList />
            </motion.section>
            
            <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <DailyQuoteCard />
            </motion.section>
          </div>

          {/* Bottom Row: Weekly Progress */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[250px] flex-1">
            <WeeklyProgressChart />
          </motion.section>
          
        </div>

      </motion.div>
    </main>
  );
}

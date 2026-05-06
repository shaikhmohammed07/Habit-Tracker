"use client";

import { useEffect, useState } from "react";
import { Quote as QuoteType } from "@/types";
import { getRandomQuote } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyQuoteCard() {
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await getRandomQuote();
        setQuote(data);
      } catch (error) {
        console.error("Failed to fetch quote", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, []);

  return (
    <div className="flex flex-col h-full items-center text-center px-2 py-4 justify-between">
      <div className="relative mb-6">
        {/* Heart Icon */}
        <motion.div 
          className="text-[60px] leading-none transform rotate-[-10deg] drop-shadow-sm filter"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [-10, -5, -10]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width="70" height="70" viewBox="0 0 24 24" fill="#FF8383" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>
        {/* Sparkles */}
        <motion.div 
          className="absolute top-0 right-0 text-[#F9C74F] text-xl"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >✨</motion.div>
        <motion.div 
          className="absolute bottom-2 -left-2 text-[#F9C74F] text-sm"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >✨</motion.div>
      </div>
      
      <h3 className="font-bold text-lg mb-3">Daily Quote</h3>
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="animate-pulse flex flex-col gap-2 items-center w-full"
          >
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </motion.div>
        ) : quote ? (
          <motion.div 
            key={quote.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full justify-between w-full"
          >
            <p className="text-[13px] text-[var(--color-text-muted)] font-medium leading-relaxed mb-4">
              &quot;{quote.quote_text}&quot;
            </p>
            <p className="text-[13px] font-bold text-[var(--color-text-main)] mt-auto">
              - {quote.author || 'Unknown'}
            </p>
          </motion.div>
        ) : (
          <motion.p 
            key="empty"
            className="text-[13px] text-gray-500"
          >
            No quotes available right now.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { CloudRainWind, Sun, Cloud, Snowflake, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; desc: string; wind: number; pressure: number; humidity: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async (lat?: number, lon?: number) => {
    console.log("Fetching weather...", { lat, lon });
    try {
      setLoading(true);
      const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
      let url = `https://api.openweathermap.org/data/2.5/weather?q=Surat&units=metric&appid=${API_KEY}`;
      
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      }

      console.log("Fetching from URL:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("Weather raw data:", data);

      if (data.main) {
        setWeather({
          temp: Math.round(data.main.temp),
          desc: data.weather[0].main,
          wind: Math.round(data.wind.speed * 3.6),
          pressure: data.main.pressure,
          humidity: data.main.humidity
        });
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const getWeatherIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes("rain") || d.includes("drizzle")) return <CloudRainWind size={32} className="text-blue-100" />;
    if (d.includes("snow")) return <Snowflake size={32} className="text-blue-50" />;
    if (d.includes("clear") || d.includes("sun")) return <Sun size={32} className="text-yellow-200" />;
    return <Cloud size={32} className="text-gray-100" />;
  };

  return (
    <div className="relative h-full flex flex-col z-10 p-2 border-2 border-white/20 rounded-2xl bg-white/5">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-2 z-30 relative"
          >
            <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Loading...</span>
          </motion.div>
        ) : weather ? (
          <motion.div 
            key="weather"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full z-30 relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl font-bold text-white drop-shadow-sm">{weather.temp}°C</div>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {getWeatherIcon(weather.desc)}
              </motion.div>
            </div>

            <div className="flex flex-col gap-1 text-[10px] font-bold text-white/90 mt-auto z-10 uppercase tracking-wider">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span>Wind</span>
                <span>{weather.wind} km/h</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 py-1">
                <span>Pressure</span>
                <span>{weather.pressure}m</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Humidity</span>
                <span>{weather.humidity}%</span>
              </div>

              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleGeoLocation}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 text-[9px]"
                  title="Update location"
                >
                  <Navigation size={10} /> Sync
                </button>
                <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-[9px]">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-sm text-white text-center gap-2 z-30 relative"
          >
            <span className="text-2xl">⚠️</span>
            <div className="font-bold">Weather Unavailable</div>
            <div className="text-[10px] opacity-70 px-4">Check your API key or connection</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative umbrella and leaves */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-visible">
        {/* Umbrella top */}
        <motion.div 
          className="absolute top-[10%] -right-4 w-[140%] h-[50%] bg-[#FFC53D] rounded-t-full origin-bottom rotate-12 drop-shadow-lg z-10 overflow-hidden"
          animate={{ 
            rotate: [12, 15, 12],
            y: [0, -2, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Umbrella ribs */}
          <div className="absolute top-0 left-1/3 w-[2px] h-full bg-[#E5A814] origin-bottom -rotate-12"></div>
          <div className="absolute top-0 right-1/3 w-[2px] h-full bg-[#E5A814] origin-bottom rotate-12"></div>
        </motion.div>

        {/* Umbrella handle */}
        <motion.div 
          className="absolute top-[55%] right-8 w-1 h-16 bg-[#8B5E3C] rotate-12 z-0"
          animate={{ rotate: [12, 15, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute top-[calc(55%+3.5rem)] right-7 w-6 h-6 border-[3px] border-t-0 border-l-0 border-[#8B5E3C] rounded-br-full rotate-12 z-0"
          animate={{ rotate: [12, 15, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>

        {/* Leaves */}
        <motion.div 
          className="absolute bottom-4 right-0 w-16 h-16 bg-green-500 rounded-tl-full rounded-br-full -rotate-45 opacity-80 z-20 mix-blend-multiply"
          animate={{ rotate: [-45, -40, -45], x: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 right-8 w-20 h-10 bg-green-600 rounded-t-full opacity-70 z-20 mix-blend-multiply"
          animate={{ scaleX: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-8 -right-4 w-12 h-12 bg-green-400 rounded-tr-full rounded-bl-full rotate-12 opacity-80 z-20 mix-blend-multiply"
          animate={{ rotate: [12, 18, 12], y: [0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>
    </div>
  );
}

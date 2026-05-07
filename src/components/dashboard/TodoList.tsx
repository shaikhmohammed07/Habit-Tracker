"use client";

import { useEffect, useState } from "react";
import { useTodoStore } from "@/lib/store";
import { Check, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isAfter, setHours, setMinutes, startOfToday, addDays, subDays, parseISO, isSameDay, startOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function TodoList() {
  const { 
    todos, 
    isLoading, 
    selectedDate, 
    setSelectedDate, 
    fetchTodos, 
    toggleTodo, 
    addTodo, 
    removeTodo,
    showAddForm,
    setShowAddForm
  } = useTodoStore();
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState<string | null>(selectedDate);
  const [recurringDay, setRecurringDay] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos(selectedDate);
  }, [fetchTodos, selectedDate]);

  useEffect(() => {
    if (showAddForm) {
      setNewDate(selectedDate);
      setRecurringDay(null);
    }
  }, [showAddForm, selectedDate]);

  // Filtering tasks based on "reset after 12:00 pm" requirement
  // If it's after 12:00 PM, we only show tasks created after 12:00 PM?
  // Or we just fetch and if the user wants them "reset", we can filter them out.
  const displayTodos = todos.filter(todo => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate !== todayStr) return true; // Don't filter for other days

    const now = new Date();
    const noon = setMinutes(setHours(startOfToday(), 12), 0);

    if (isAfter(now, noon)) {
      // If it's after 12:00 PM today, only show tasks created after noon or incomplete ones
      const taskDate = new Date(todo.created_at);
      return isAfter(taskDate, noon) || !todo.is_completed;
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    await addTodo({
      title: newTitle,
      location: newLocation,
      time: newTime,
      date: recurringDay ? null : newDate,
      recurring_day: recurringDay,
      icon: "List"
    });

    setNewTitle("");
    setNewLocation("");
    setNewTime("");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full relative p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl sm:text-lg font-bold">
            {isSameDay(parseISO(selectedDate), new Date()) ? "Today's" : format(parseISO(selectedDate), "MMM dd's")} Todos
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
              className="p-2 sm:p-1 hover:bg-gray-100 rounded text-gray-400"
            >
              <span className="text-xs sm:text-[10px]">❮</span>
            </button>
            <span className="text-xs sm:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              {format(parseISO(selectedDate), "EEEE")}
            </span>
            <button 
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
              className="p-2 sm:p-1 hover:bg-gray-100 rounded text-gray-400"
            >
              <span className="text-xs sm:text-[10px]">❯</span>
            </button>
          </div>
        </div>
        <button 
          onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
          className={cn(
            "text-xs sm:text-[10px] font-bold px-3 py-1.5 sm:px-2 sm:py-1 rounded transition-colors",
            isSameDay(parseISO(selectedDate), new Date()) 
              ? "bg-orange-100 text-[var(--color-primary)]" 
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          Today
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-20">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full"></div>
          </div>
        ) : displayTodos.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">No todos for this session.</div>
        ) : (
          <motion.div 
            layout
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="popLayout">
              {displayTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start gap-4 group relative pr-8"
                >
                  <button
                    onClick={() => toggleTodo(todo.id, todo.recurring_day ? todo.last_completed_date === selectedDate : todo.is_completed)}
                    className={cn(
                      "mt-0.5 w-6 h-6 sm:w-[22px] sm:h-[22px] rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                      (todo.recurring_day ? todo.last_completed_date === selectedDate : todo.is_completed)
                        ? "bg-[var(--color-success)] border-[var(--color-success)] text-white"
                        : "bg-transparent border-gray-300 text-transparent hover:border-gray-400"
                    )}
                  >
                    <Check size={14} className={(todo.recurring_day ? todo.last_completed_date === selectedDate : todo.is_completed) ? "opacity-100" : "opacity-0"} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-bold text-base sm:text-[15px] truncate text-[var(--color-text-main)]", (todo.recurring_day ? todo.last_completed_date === selectedDate : todo.is_completed) && "text-gray-400 line-through")}>
                      {todo.title}
                    </h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 sm:mt-0.5">
                      {todo.time && (
                        <div className="text-[11px] sm:text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <Clock size={11} className="sm:w-2.5 sm:h-2.5" /> {todo.time}
                        </div>
                      )}
                      {todo.location && (
                        <div className="text-[11px] sm:text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <MapPin size={11} className="sm:w-2.5 sm:h-2.5" /> {todo.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="absolute right-0 top-1 text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 sm:p-1"
                    title="Delete task"
                  >
                    <Trash2 size={18} className="sm:w-4 sm:h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {showAddForm ? (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 sm:hidden" onClick={() => setShowAddForm(false)} />
      ) : null}

      {showAddForm ? (
        <form 
          onSubmit={handleAddSubmit} 
          className="absolute bottom-0 left-0 right-0 bg-white p-6 sm:p-4 rounded-t-3xl sm:rounded-b-3xl border-t border-gray-100 flex flex-col gap-4 sm:gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] sm:shadow-2xl z-30"
        >
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2 sm:hidden" />
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="w-full text-base sm:text-sm border border-gray-200 rounded-xl sm:rounded-lg px-4 sm:px-3 py-3 sm:py-2 outline-none focus:border-[var(--color-primary)] transition-all"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              autoFocus
            />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Day / Date</label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                  const dayOfWeek = day;
                  const isSelected = recurringDay === dayOfWeek;
                  
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setRecurringDay(dayOfWeek);
                        setNewDate(null);
                      }}
                      className={cn(
                        "flex-1 py-2.5 sm:py-2 text-xs sm:text-[10px] font-bold rounded-xl sm:rounded-lg border transition-all",
                        isSelected 
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm" 
                          : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="relative mt-1 flex gap-2">
                <input
                  type="date"
                  className={cn(
                    "flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[var(--color-primary)] transition-all",
                    !recurringDay ? "bg-white" : "bg-gray-50 text-gray-400"
                  )}
                  value={newDate || ""}
                  onChange={e => {
                    setNewDate(e.target.value);
                    setRecurringDay(null);
                  }}
                  required={!recurringDay}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (recurringDay === "Everyday") {
                      setRecurringDay(null);
                      setNewDate(selectedDate);
                    } else {
                      setRecurringDay("Everyday");
                      setNewDate(null);
                    }
                  }}
                  className={cn(
                    "px-4 sm:px-3 text-xs sm:text-[10px] font-bold rounded-xl sm:rounded-lg border transition-all whitespace-nowrap",
                    recurringDay === "Everyday"
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm" 
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  Everyday
                </button>
              </div>
              {recurringDay && (
                <div className="text-[9px] text-[var(--color-primary)] font-bold mt-1 px-1">
                  This task will repeat {recurringDay === "Everyday" ? "every day" : `every ${recurringDay}`}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Clock className="absolute left-3 top-3 sm:top-2.5 text-gray-400 sm:w-3.5 sm:h-3.5" size={16} />
              <input
                type="time"
                placeholder="Time"
                className="w-full text-sm sm:text-xs border border-gray-200 rounded-xl sm:rounded-lg pl-10 sm:pl-9 pr-3 py-2.5 sm:py-2 outline-none focus:border-[var(--color-primary)]"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 sm:top-2.5 text-gray-400 sm:w-3.5 sm:h-3.5" size={16} />
              <input
                type="text"
                placeholder="Location/Details"
                className="w-full text-sm sm:text-xs border border-gray-200 rounded-xl sm:rounded-lg pl-10 sm:pl-9 pr-3 py-2.5 sm:py-2 outline-none focus:border-[var(--color-primary)]"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 sm:mt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-sm sm:text-xs font-semibold px-4 py-2 sm:px-3 sm:py-1.5 text-gray-500 hover:bg-gray-100 rounded-xl sm:rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm sm:text-xs font-semibold px-6 py-2 sm:px-4 sm:py-1.5 bg-[var(--color-text-main)] text-white rounded-xl sm:rounded-lg hover:shadow-lg transition-all active:scale-95"
            >
              Add Task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="absolute bottom-4 left-4 right-4 bg-[var(--color-primary)] hover:bg-orange-600 text-white shadow-lg shadow-orange-200 rounded-2xl py-3.5 sm:py-2.5 flex items-center justify-center transition-all active:scale-95 z-10"
        >
          <Plus size={20} className="mr-2" />
          <span className="text-base sm:text-sm font-bold">Add New Task</span>
        </button>
      )}
    </div>
  );
}

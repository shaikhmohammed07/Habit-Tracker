import { create } from 'zustand';
import { Todo, Habit, Activity, Suggestion } from '../types';
import { getTodos, createTodo, updateTodo, deleteTodo, getHabits, getActivities, getSuggestions, getGrowthStats } from './api';
import { format } from 'date-fns';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  selectedDate: string;
  showAddForm: boolean;
  setSelectedDate: (date: string) => void;
  setShowAddForm: (show: boolean) => void;
  fetchTodos: (dateStr?: string) => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  toggleTodo: (id: string, currentStatus: boolean) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  showAddForm: false,
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchTodos(date);
  },
  setShowAddForm: (show: boolean) => set({ showAddForm: show }),
  fetchTodos: async (dateStr?: string) => {
    set({ isLoading: true });
    const targetDate = dateStr || get().selectedDate;
    const todos = await getTodos(targetDate);
    set({ todos, isLoading: false });
  },
  addTodo: async (todo: Partial<Todo>) => {
    const newTodo = await createTodo({
      ...todo,
      date: todo.date || format(new Date(), 'yyyy-MM-dd'),
      is_completed: false
    });
    if (newTodo) {
      set((state) => ({ todos: [newTodo, ...state.todos] }));
    }
  },
  toggleTodo: async (id: string, currentStatus: boolean) => {
    const targetDate = get().selectedDate;
    const newStatus = !currentStatus;
    
    // Optimistic update
    set((state) => ({
      todos: state.todos.map(t => t.id === id ? { 
        ...t, 
        is_completed: newStatus,
        last_completed_date: newStatus ? targetDate : null 
      } : t)
    }));
    
    const updated = await updateTodo(id, { 
      is_completed: newStatus,
      last_completed_date: newStatus ? targetDate : null
    });
    
    if (!updated) {
      // Revert if failed
      set((state) => ({
        todos: state.todos.map(t => t.id === id ? { 
          ...t, 
          is_completed: currentStatus,
          last_completed_date: currentStatus ? targetDate : null 
        } : t)
      }));
    }
  },
  removeTodo: async (id: string) => {
    // Optimistic update
    const previousTodos = get().todos;
    set((state) => ({
      todos: state.todos.filter(t => t.id !== id)
    }));
    const success = await deleteTodo(id);
    if (!success) {
      // Revert if failed
      set({ todos: previousTodos });
    }
  }
}));

interface DashboardState {
  habits: Habit[];
  activities: Activity[];
  suggestions: Suggestion[];
  growth: number;
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  habits: [],
  activities: [],
  suggestions: [],
  growth: 0,
  isLoading: false,
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [habits, activities, suggestions, growth] = await Promise.all([
        getHabits(),
        getActivities(),
        getSuggestions(),
        getGrowthStats()
      ]);
      set({ habits, activities, suggestions, growth, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      set({ isLoading: false });
    }
  }
}));

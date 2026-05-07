import { supabase } from './supabase';
import { Habit, Todo, Quote, Activity, Suggestion } from '../types';

const sanitizeInput = <T extends object>(obj: T): T => {
  const sanitized = { ...obj };
  (Object.keys(sanitized) as Array<keyof T>).forEach((key) => {
    if ((sanitized[key] as unknown) === '') {
      (sanitized[key] as unknown) = null;
    }
  });
  return sanitized;
};

export const getHabits = async () => {
  const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
  return data as Habit[];
};

export const getTodos = async (dateStr?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  let query = supabase.from('todos').select('*');
  
  if (dateStr) {
    const { format, parseISO } = await import('date-fns');
    const dayOfWeek = format(parseISO(dateStr), 'EEE');
    query = query.or(`date.eq.${dateStr},recurring_day.eq.${dayOfWeek},recurring_day.eq.Everyday`);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
  return data as Todo[];
};

export const createTodo = async (todo: Partial<Todo>) => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('todos')
    .insert([{ ...todo, user_id: session?.user?.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating todo:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }
  return (Array.isArray(data) ? data[0] : data) as Todo;
};

export const updateTodo = async (id: string, updates: Partial<Todo>) => {
  const sanitizedUpdates = sanitizeInput(updates);
  const { data, error } = await supabase.from('todos').update(sanitizedUpdates).eq('id', id).select();
  if (error) {
    console.error('Error updating todo:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }
  return data[0] as Todo;
};

export const deleteTodo = async (id: string) => {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
  return true;
};

export const getRandomQuote = async () => {
  // A simple way to get a random quote: fetch all and pick one
  // Alternatively, could use a Postgres function for better performance
  const { data, error } = await supabase.from('quotes').select('*');
  if (error || !data || data.length === 0) {
    console.error('Error fetching quotes:', error);
    return null;
  }
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex] as Quote;
};

export const getActivities = async () => {
  const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: true }).limit(5);
  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
  return data as Activity[];
};

export const getSuggestions = async () => {
  const { data, error } = await supabase.from('suggestions').select('*').order('likes', { ascending: false }).limit(3);
  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
  return data as Suggestion[];
};

export const getGrowthStats = async () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const { count: currentCount, error: currentError } = await supabase
    .from('habit_completions')
    .select('*', { count: 'exact', head: true })
    .gte('completed_date', startOfCurrentMonth);

  const { count: lastCount, error: lastError } = await supabase
    .from('habit_completions')
    .select('*', { count: 'exact', head: true })
    .gte('completed_date', startOfLastMonth)
    .lte('completed_date', endOfLastMonth);

  if (currentError || lastError) {
    console.error('Error fetching growth stats:', currentError || lastError);
    return 0;
  }

  const current = currentCount || 0;
  const last = lastCount || 0;

  if (last === 0) return current > 0 ? 100 : 0;
  
  const growth = ((current - last) / last) * 100;
  return parseFloat(growth.toFixed(1));
};

export const getWeights = async () => {
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching weights:', error);
    return [];
  }
  return data;
};

export const addWeight = async (weight: number, date: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('weights')
    .insert([{ weight, date, user_id: session?.user?.id }])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding weight:', error);
    return null;
  }
  return data;
};

export const deleteWeight = async (id: string) => {
  const { error } = await supabase
    .from('weights')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting weight:', error);
    return false;
  }
  return true;
};

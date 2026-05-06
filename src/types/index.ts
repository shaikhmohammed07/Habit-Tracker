export type Habit = {
  id: string;
  user_id: string | null;
  title: string;
  icon: string | null;
  color: string | null;
  current_streak: number;
  created_at: string;
};

export type Todo = {
  id: string;
  user_id: string | null;
  title: string;
  time: string | null;
  location: string | null;
  icon: string | null;
  is_completed: boolean;
  date: string | null;
  recurring_day: string | null;
  last_completed_date: string | null;
  created_at: string;
};

export type Quote = {
  id: string;
  quote_text: string;
  author: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  title: string;
  date: string;
  time: string;
  distance: string;
  type: string;
};

export type Suggestion = {
  id: string;
  title: string;
  subtitle: string;
  likes: number;
  icon: string;
};

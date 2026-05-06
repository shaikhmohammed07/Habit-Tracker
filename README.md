# Habit Tracker Dashboard

A premium, interactive Habit Tracker application built with Next.js, Supabase, and Framer Motion. This dashboard provides a comprehensive view of your daily habits, progress analytics, and personal health metrics.

## 🚀 Features

-   **Interactive Dashboard**: A beautiful, glassmorphic UI with dynamic animations.
-   **Habit Tracking**: Manage your daily tasks with a real-time Todo list synced to Supabase.
-   **Analytics & Insights**:
    -   **Weekly Progress Chart**: Visual representation of your task completion rates.
    -   **Weight Analysis**: Track your weight over time with interactive charts and historical data.
    -   **Personal Streaks**: Stay motivated with streak tracking for consistent habit formation.
-   **Smart Widgets**:
    -   **Weather Integration**: Real-time weather updates based on your location.
    -   **Daily Quotes**: Get inspired with a fresh quote every day.
    -   **Calendar View**: Stay on top of your schedule.
    -   **"Should Do" Suggestions**: AI-style suggestions for your next tasks.
-   **Authentication**: Secure user login and data persistence via Supabase.

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Database & Auth**: Supabase
-   **State Management**: Zustand
-   **Charts**: Recharts

## 🏁 Getting Started

### Prerequisites

-   Node.js (Latest LTS)
-   npm / yarn / pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/shaikhmohammed07/Habit-Tracker.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 📄 License

This project is open-source and available under the MIT License.


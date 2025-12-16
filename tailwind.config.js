/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Task type colors
        'task-sync': '#3b82f6',      // blue-500
        'task-timer': '#f97316',     // orange-500
        'task-microtask': '#a855f7', // purple-500
        'task-promise': '#9333ea',   // purple-600
        'task-fetch': '#22c55e',     // green-500
        'task-event': '#ec4899',     // pink-500
        'task-raf': '#eab308',       // yellow-500
        
        // Task state colors
        'state-created': '#9ca3af',    // gray-400
        'state-waiting': '#4b5563',    // gray-600
        'state-queued': '#60a5fa',     // blue-400
        'state-running': '#4ade80',    // green-400
        'state-completed': '#d1d5db',  // gray-300
        
        // Region backgrounds
        'region-callstack': '#1e293b',   // slate-800
        'region-webapis': '#312e81',     // indigo-900
        'region-queues': '#334155',      // slate-700
        'region-render': '#064e3b',      // emerald-900
        'region-console': '#18181b',     // zinc-900
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};

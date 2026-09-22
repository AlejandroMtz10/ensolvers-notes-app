"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "reicon-react";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`
          w-10 h-10
          rounded-xl
          border border-zinc-200
          dark:border-zinc-800
          bg-white
          dark:bg-zinc-900
          shadow-sm
          ${className}
        `}
      />
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        flex items-center
        transition-all duration-300
        group z-50
        cursor-pointer

        ${
          showLabel
            ? `
              w-full
              gap-3
              p-3
              rounded-xl
              hover:bg-zinc-100
              dark:hover:bg-zinc-800
              text-zinc-600
              dark:text-zinc-400
            `
            : `
              w-10
              h-10
              justify-center
              rounded-xl
              bg-white
              dark:bg-zinc-900
              border
              border-zinc-200
              dark:border-zinc-800
              shadow-sm
              hover:bg-zinc-100
              dark:hover:bg-zinc-800
            `
        }

        ${className}
      `}
    >
      <div className="relative h-5 w-5 flex items-center justify-center shrink-0">
        {isDark ? (
          <Moon
            size={20}
            className="text-blue-400"
          />
        ) : (
          <Sun
            size={20}
            className="text-amber-500"
          />
        )}
      </div>

      {showLabel && (
        <span className="font-medium text-sm whitespace-nowrap">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
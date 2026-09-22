"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/UI/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission and API call
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast.success("Login successful!");
        router.push("/notes");
      } else {
        const errorMessage = await response.text();
        toast.error(errorMessage || "Invalid username or password");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="
    min-h-screen
    flex
    flex-col
    justify-between
    p-6
    bg-zinc-50
    dark:bg-zinc-950
    transition-colors
    duration-200
  "
    >
      {" "}
      {/* Top Bar with Brand and Theme Toggle */}
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-mono">
            N
          </div>
          NotesApp
        </div>
        <ThemeToggle />
      </div>
      {/* Main Login Card Container */}
      <div className="flex items-center justify-center my-auto py-12">
        <div
          className="
    w-full
    max-w-md
    p-8
    bg-white
    dark:bg-zinc-900
    border
    border-zinc-200
    dark:border-zinc-800
    rounded-2xl
    shadow-sm
    space-y-6
  "
        >
          {" "}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Login
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Hi, Welcome back 👋
            </p>
          </div>
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-12 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                Remember Me
              </label>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>
          {/* Sign Up Redirect Link */}
          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Not registered yet?{" "}
            <Link
              href="/signup"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              Create an account ↗
            </Link>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-zinc-400">
        Ensolvers Full-Stack Challenge
      </div>
    </main>
  );
}

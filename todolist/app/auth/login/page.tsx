"use client";

import { useState } from "react";
import Link from "next/link";
import { login, ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      await login(trimmedEmail, trimmedPassword);

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
  

<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-100 via-white to-neutral-200 px-4">

  {/* Animated Card */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-8 sm:p-10"
  >
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
        Welcome back
      </h1>
      <p className="text-sm text-neutral-500 mt-2">
        Sign in to access your dashboard
      </p>
    </div>

    <form onSubmit={handleLogin} className="space-y-5" noValidate>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 text-sm  text-black rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>

    {/* Footer */}
    <p className="mt-8 text-center text-sm text-neutral-600">
      Don’t have an account?{" "}
      <Link
        href="/auth/register"
        className="font-medium text-neutral-900 hover:underline"
      >
        Create one
      </Link>
    </p>
  </motion.div>
</div>

  );
}

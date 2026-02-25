"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { logout, updateProfile } from "../../lib/api";
import { ProfileLoader } from "@/components/Loading";
import { AnimatePresence, motion } from "framer-motion";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // console.log("user obj",user);

  const [editField, setEditField] = useState<
    "name" | "email" | "password" | null
  >(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditor = (field: "name" | "email" | "password") => {
    if (!user) return; // hard guard

    setError(null);
    setEditField(field);

    if (field === "name") setValue(user.name);
    if (field === "email") setValue(user.email);
    if (field === "password") setValue("");
  };

  const handleSave = async () => {
    if (!editField) return;

    if (!value.trim()) {
      setError("Field cannot be empty.");
      return;
    }

    const updates: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    updates[editField] = value;

    try {
      setSaving(true);
      await updateProfile(updates);
      setEditField(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Update failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  //  Redirect ONLY after loading finishes
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {

    await logout();
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <div className="pt-50">
        <ProfileLoader />
      </div>
    );
  }

  if (!user) {
    return null; // redirect in progress
  }
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-100 via-white to-neutral-200">
      <Navbar />
      <main className="min-h-screen flex justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl max-h-160 md:max-h-100 bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-5 sm:p-6 overflow-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg font-semibold">
                {avatarLetter}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
                  Account Overview
                </h2>
                <p className="text-sm text-neutral-500">You can change your details here.</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div
              onClick={() => openEditor("name")}
              className="cursor-pointer bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-neutral-500" />
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Name
                </p>
              </div>
              <p className="text-base font-medium text-neutral-900">
                {user.name}
              </p>
            </div>

            {/* Email */}
            <div
              onClick={() => openEditor("email")}
              className="cursor-pointer bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-neutral-500" />
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Email
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-700 break-all">
                {user.email}
              </p>
            </div>

            {/* Password */}
            <div
              onClick={() => openEditor("password")}
              className="cursor-pointer bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:bg-neutral-50 transition"
            >
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                Password
              </p>
              <p className="text-sm font-medium text-neutral-600">••••••••</p>
            </div>

            
            {/* Member Since */}
            <div className="cursor-not-allowed bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:bg-neutral-50 transition">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Member Since
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <AnimatePresence>
              {editField && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setEditField(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 40 }}
                    transition={{ duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
                  >
                    <h3 className="text-lg font-semibold mb-4 capitalize">
                      Edit {editField}
                    </h3>

                    <input
                      type={editField === "password" ? "password" : "text"}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
                    />

                    {error && (
                      <p className="text-red-500 text-sm mb-2">{error}</p>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditField(null)}
                        className="px-4 py-2 text-sm rounded-lg border"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm rounded-lg bg-neutral-900 text-white disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </main>
    </div>
  );
}

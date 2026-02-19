"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../lib/api";
import { ProfileLoader } from "@/components/Loading";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar"



export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // console.log("user obj",user);

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
    <Navbar/>
      <main className="min-h-screen flex justify-center pt-16 px-4">
       <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl max-h-135 bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-5 sm:p-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg font-semibold">
            {avatarLetter}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
              {user.name}
            </h2>
            <p className="text-sm text-neutral-500">
              Account overview
            </p>
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
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
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
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
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

        {/* Member Since */}
        <div className="sm:col-span-2 bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
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

      </div>
    </motion.div>

      </main>
   
  </div>

  );
}

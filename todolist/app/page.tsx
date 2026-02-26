"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ReadOnlyTaskCard from "@/components/StaticTasks";
import { useTasks } from "../hooks/useTasks";
import { DotsLoader } from "@/components/Loading";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { tasks, loading } = useTasks();

  const router = useRouter();
  const { user, loading: authloading } = useAuth();
  // console.log("user obj",user);

  //  Redirect ONLY after loading finishes
  useEffect(() => {
    if (!authloading && !user) {
      router.replace("/auth/login");
    }
  }, [authloading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
        <DotsLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-neutral-700" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                Dashboard
              </h1>
            </div>

            <p className="text-neutral-500 mt-2 text-sm sm:text-base tracking-tight">
              Manage and track your tasks efficiently.
            </p>
            {/* Status Legend */}
<div className="flex items-center tracking-tight gap-6 mt-4">
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded-full bg-green-500"></span>
    <span className="text-sm text-neutral-600">Completed</span>
  </div>

  <div className="flex items-center gap-2">   
    <span className="w-3 h-3 rounded-full bg-red-500"></span>
    <span className="text-sm text-neutral-600">Pending</span>
  </div>
</div>
          </div>
        </motion.div>
        

        {/* Tasks Grid */}
        {tasks.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Number Badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center shadow-md">
                  {index + 1}
                </div>

                <ReadOnlyTaskCard task={task} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 text-center"
          >
            <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-10 shadow-sm max-w-md mx-auto">
              <ClipboardList className="w-10 h-10 mx-auto text-neutral-400 mb-4" />
              <h2 className="text-lg font-medium text-neutral-800">
                No Tasks Yet
              </h2>
              <p className="text-neutral-500 mt-2 text-sm">
                Start by creating your first task to stay productive.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTasks } from "../../hooks/useTasks";
import TaskForm from "../../components/TaskForm";
import TaskCard from "../../components/TaskCard";
import { DotsLoader } from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { tasks, loading, createTask, deleteTask, updateTask } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  /* ---------------- AUTH REDIRECT ---------------- */

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  /* ---------------- HANDLERS ---------------- */

  function handleEdit(task: Task): void {
    setEditingTask(task);
    setEditedTitle(task.title);
    setError("");
  }

  async function handleSaveEdit(): Promise<void> {
    if (!editingTask) return;

    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle) {
      setError("Title cannot be empty.");
      return;
    }

    if (trimmedTitle === editingTask.title) {
      setEditingTask(null);
      return;
    }

    try {
      await updateTask(editingTask._id, { title: trimmedTitle });
      setEditingTask(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update task");
      }
    }
  }

  async function handleToggleComplete(
    id: string,
    completed: boolean
  ): Promise<void> {
    try {
      await updateTask(id, { completed });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Failed to update task status");
      }
    }
  }

  /* ---------------- LOADING ---------------- */

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-60">
        <DotsLoader />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-100 via-white to-neutral-200">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-10 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl p-8 mx-4 md:mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-6 h-6 text-neutral-700" />
            <h1 className="text-2xl font-semibold text-neutral-900">
              Manage Tasks
            </h1>
          </div>

          <TaskForm onAdd={createTask} />
        </motion.div>

        {/* Task List */}
        {tasks.length > 0 && (
          <motion.div layout className="space-y-4 mx-4 md:mx-auto">
            {tasks.map((task: Task, index: number) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                layout
              >
                <TaskCard
                  task={task}
                  onDelete={deleteTask}
                  onEdit={handleEdit}
                  onToggleComplete={handleToggleComplete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center bg-white border border-dashed border-neutral-300 rounded-2xl p-10 shadow-sm"
          >
            <ClipboardList className="w-10 h-10 mx-auto text-neutral-400 mb-4" />
            <h2 className="text-lg font-medium text-neutral-800">
              No tasks yet
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Add your first task to get started.
            </p>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl border border-neutral-200 shadow-2xl p-8"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-5">
                Edit Task
              </h2>

              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                autoFocus
              />

              {error && (
                <p className="text-sm text-red-500 mt-3">{error}</p>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition active:scale-[0.98]"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

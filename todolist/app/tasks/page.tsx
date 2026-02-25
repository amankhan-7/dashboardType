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
    completed: boolean,
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

      <div className="w-full max-w-lg mx-auto px-4 md:px-0 py-12 space-y-8">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-neutral-100">
                <ClipboardList className="w-4 h-4 text-neutral-700" />
              </div>

              <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
                Manage Tasks
              </h1>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-6 py-6">
            <TaskForm onAdd={createTask} />
          </div>
        </motion.div>

        {/* Task List */}
        {tasks.length > 0 && (
          <motion.div layout className="space-y-8">
            {tasks.map((task: Task, index: number) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
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
            className="text-center border border-neutral-200 rounded-2xl p-12"
          >
            <div className="mx-auto mb-5 w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-100">
              <ClipboardList className="w-6 h-6 text-neutral-400" />
            </div>

            <h2 className="text-base font-semibold text-neutral-900">
              No tasks yet
            </h2>

            <p className="text-sm text-neutral-500 mt-2 max-w-xs mx-auto">
              Create your first task to start organizing your workflow.
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

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

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

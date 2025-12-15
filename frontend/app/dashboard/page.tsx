"use client";

import Navbar from "../components/Navbar";
import ReadOnlyTaskCard from "../components/StaticTasks";
import { useTasks } from "../hooks/useTasks";
import Loader from "../components/Loader";

export default function DashboardPage() {
  const { tasks, loading } = useTasks();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-neutral-600 mt-2">Here’s your tasks for today.</p>
        </div>

        {/* Loaded State */}
        {!loading && tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <ReadOnlyTaskCard key={task._id} task={task} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <p className="text-neutral-500 mt-10 text-center">
            No tasks yet. Add one above!
          </p>
        )}
      </main>
    </div>
  );
}

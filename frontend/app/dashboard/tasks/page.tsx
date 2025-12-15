"use client";

import { useTasks } from "../../hooks/useTasks";
import TaskForm from "../../components/TaskForm";
import TaskCard from "../../components/TaskCard";
import Loader from "../../components/Loader";

export default function TasksPage() {
  const { tasks, loading, createTask, deleteTask, updateTask } = useTasks();

  async function handleEdit(task) {
    const newTitle = prompt("Edit task", task.title);
    if (!newTitle || newTitle === task.title) return;

    try {
      await updateTask(task._id, { title: newTitle });
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  }

  async function handleToggleComplete(id, completed) {
    try {
      await updateTask(id, { completed });
    } catch (err) {
      alert(err.message || "Failed to update task status");
    }
  }

  
    if (loading) {
      return <Loader />;
    }
  

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <TaskForm onAdd={createTask} />


      {/* Tasks */}
      {!loading && tasks.length > 0 && (
        <div className="mt-6 space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={deleteTask}
              onEdit={handleEdit}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <p className="mt-10 text-center text-neutral-500">
          No tasks yet. Add one above.
        </p>
      )}
    </div>
  );
}

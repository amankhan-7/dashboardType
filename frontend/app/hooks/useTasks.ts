"use client";

import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  updateTask as apiUpdateTask,
} from "@/app/lib/api";

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        setLoading(true);
        const data = await fetchTasks();
        if (isMounted) {
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // CREATE
  async function handleCreateTask(title: string) {
    const newTask = await apiCreateTask(title);
    setTasks((prev) => [...prev, newTask]);
  }

  // DELETE
  async function handleDeleteTask(id: string) {
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }

  // UPDATE / EDIT
  async function handleUpdateTask(
    id: string,
    updates: { title?: string; completed?: boolean }
  ) {
    const updatedTask = await apiUpdateTask(id, updates);

    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updatedTask : task))
    );
  }

  return {
    tasks,
    loading,
    createTask: handleCreateTask,
    deleteTask: handleDeleteTask,
    updateTask: handleUpdateTask,
  };
}

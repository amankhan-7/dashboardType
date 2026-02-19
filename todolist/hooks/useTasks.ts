"use client";

import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  updateTask as apiUpdateTask,
  Task,
} from "@/lib/api";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load tasks on mount
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        setLoading(true);
        const data: Task[] = await fetchTasks();
        if (isMounted) setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // CREATE
  async function handleCreateTask(title: string): Promise<void> {
    try {
      const newTask: Task = await apiCreateTask(title);
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  }

  // DELETE
  async function handleDeleteTask(id: string): Promise<void> {
    try {
      await apiDeleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }

  // UPDATE
  async function handleUpdateTask(
    id: string,
    updates: Partial<Pick<Task, "title" | "completed">>
  ): Promise<void> {
    try {
      const updatedTask: Task = await apiUpdateTask(id, updates);
      setTasks((prev) => prev.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  }

  return {
    tasks,
    loading,
    createTask: handleCreateTask,
    deleteTask: handleDeleteTask,
    updateTask: handleUpdateTask,
  };
}

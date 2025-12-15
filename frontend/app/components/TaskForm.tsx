"use client";

import { useState } from "react";

export default function TaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 bg-white p-4 rounded-xl shadow-md mb-6 max-w-md mx-auto mt-10"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 placeholder-gray-500 rounded-lg border text-gray-500 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
      >
        Add
      </button>
    </form>
  );
}

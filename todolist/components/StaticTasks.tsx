"use client";

export default function ReadOnlyTaskCard({
  task,
}: {
  task: { title: string; completed: boolean };
}) {
  return (
    <div
      className={`bg-white w-full rounded-t-xl shadow-md mb-4 mx-auto hover:shadow-lg transition
        border-t-4 ${task.completed ? "border-green-500" : "border-red-500"}`}
    >
      <div className="p-4">
        <h3
          className={`text-neutral-900 font-semibold text-lg ${
            task.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </h3>
      </div>
    </div>
  );
}

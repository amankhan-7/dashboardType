import { memo } from "react";

export default memo(function TaskCard({
  task,
  onDelete,
  onEdit,
  onToggleComplete,
}: {
  task: { _id: string; title: string; completed?: boolean; };
  onDelete: (id: string) => void;
  onEdit: (task: { _id: string; title: string }) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4 max-w-md mx-auto hover:shadow-lg transition">
      <div className="flex items-center space-x-3">
        {/* Tick/checkbox */}
        <button
          onClick={() => onToggleComplete(task._id, !task.completed)}
          className={`w-6 h-6 flex items-center justify-center border-2 rounded-full transition ${
            task.completed ? "bg-green-500 border-green-500" : "border-gray-300"
          }`}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <span className="text-white text-sm">✔</span>}
        </button>

        <span className={`text-neutral-800 ${task.completed ? "line-through text-gray-400" : ""}`}>
          {task.title}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="text-yellow-500 hover:bg-yellow-100 px-2 py-1 rounded-lg transition text-lg"
          title="Edit Task"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(task._id)}
          className="text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition text-lg"
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

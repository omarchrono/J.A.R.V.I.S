"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  title: string;
  priority: string;
  due: string;
  done: boolean;
  createdAt: string;
}

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch("/api/jarvis/tasks");
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    await fetch("/api/jarvis/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, priority }),
    });
    setNewTask("");
    await fetchTasks();
    setLoading(false);
  };

  const toggleTask = async (task: Task) => {
    await fetch("/api/jarvis/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    });
    await fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch("/api/jarvis/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchTasks();
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const priorityConfig: Record<string, { color: string; label: string }> = {
    high: { color: "#ff3355", label: "HIGH" },
    medium: { color: "#ffd700", label: "MED" },
    low: { color: "#00ff88", label: "LOW" },
  };

  return (
    <div className="jarvis-panel rounded-lg flex flex-col h-full" style={{ minHeight: 0 }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <div className="text-xs tracking-widest font-bold" style={{ color: "#00d4ff" }}>
          TASK MANAGER
        </div>
        <div className="flex gap-3 text-xs opacity-50">
          <span style={{ color: "#00ff88" }}>{pending.length} PENDING</span>
          <span>|</span>
          <span>{done.length} DONE</span>
        </div>
      </div>

      {/* Add task */}
      <div className="px-4 py-3 border-b flex gap-2" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="New mission directive..."
          className="jarvis-input flex-1 px-3 py-2 rounded text-xs"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="jarvis-input px-2 py-2 rounded text-xs"
          style={{ background: "rgba(0,20,40,0.9)" }}
        >
          <option value="high">HIGH</option>
          <option value="medium">MED</option>
          <option value="low">LOW</option>
        </select>
        <button
          onClick={addTask}
          disabled={loading}
          className="jarvis-btn px-3 py-2 rounded text-xs tracking-widest"
        >
          + ADD
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
        <AnimatePresence>
          {pending.map((task) => {
            const pc = priorityConfig[task.priority] || priorityConfig.medium;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="flex items-center gap-3 px-3 py-2 rounded group"
                style={{
                  background: "rgba(0,20,40,0.6)",
                  border: "1px solid rgba(0,212,255,0.1)",
                }}
              >
                <button
                  onClick={() => toggleTask(task)}
                  className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
                  style={{ borderColor: pc.color }}
                >
                  <div
                    className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: pc.color }}
                  />
                </button>
                <span className="flex-1 text-xs" style={{ color: "#a0d8ef" }}>
                  {task.title}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: `${pc.color}18`,
                    border: `1px solid ${pc.color}44`,
                    color: pc.color,
                    fontSize: "0.6rem",
                  }}
                >
                  {pc.label}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1"
                  style={{ color: "#ff3355" }}
                >
                  ×
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {pending.length === 0 && (
          <div className="text-center text-xs opacity-30 py-6 tracking-widest">
            ALL OBJECTIVES COMPLETE
          </div>
        )}

        {done.length > 0 && (
          <div className="mt-4">
            <div className="text-xs opacity-30 tracking-widest mb-2 px-1">COMPLETED</div>
            <AnimatePresence>
              {done.slice(-3).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded mb-1 opacity-40"
                  style={{ background: "rgba(0,20,40,0.3)", border: "1px solid rgba(0,212,255,0.05)" }}
                >
                  <span className="text-xs" style={{ color: "#00ff88" }}>✓</span>
                  <span className="flex-1 text-xs line-through" style={{ color: "#a0d8ef" }}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs px-1"
                    style={{ color: "#ff335566" }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

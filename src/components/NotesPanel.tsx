"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  createdAt: string;
}

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchNotes = async () => {
    const res = await fetch("/api/jarvis/notes");
    const data = await res.json();
    setNotes(data.notes || []);
  };

  useEffect(() => { fetchNotes(); }, []);

  const addNote = async () => {
    if (!title.trim()) return;
    await fetch("/api/jarvis/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags }),
    });
    setTitle(""); setContent(""); setTags(""); setAdding(false);
    await fetchNotes();
  };

  const deleteNote = async (id: number) => {
    await fetch("/api/jarvis/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchNotes();
  };

  return (
    <div className="jarvis-panel rounded-lg flex flex-col h-full" style={{ minHeight: 0 }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <div className="text-xs tracking-widest font-bold" style={{ color: "#ffd700" }}>
          INTEL NOTES
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="jarvis-btn text-xs px-3 py-1 rounded tracking-widest"
        >
          {adding ? "CANCEL" : "+ NEW"}
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 border-b space-y-2"
            style={{ borderColor: "rgba(0,212,255,0.1)" }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="jarvis-input w-full px-3 py-2 rounded text-xs"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content..."
              rows={3}
              className="jarvis-input w-full px-3 py-2 rounded text-xs resize-none"
            />
            <div className="flex gap-2">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (optional)..."
                className="jarvis-input flex-1 px-3 py-2 rounded text-xs"
              />
              <button
                onClick={addNote}
                className="jarvis-btn px-4 py-2 rounded text-xs tracking-widest"
              >
                SAVE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded group cursor-pointer"
              style={{
                background: "rgba(0,20,40,0.6)",
                border: `1px solid ${expanded === note.id ? "rgba(255,215,0,0.3)" : "rgba(0,212,255,0.1)"}`,
              }}
              onClick={() => setExpanded(expanded === note.id ? null : note.id)}
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="text-xs" style={{ color: "#ffd700" }}>◈</span>
                <span className="flex-1 text-xs font-bold" style={{ color: "#ffd700" }}>
                  {note.title}
                </span>
                {note.tags && (
                  <span className="text-xs opacity-40 tracking-widest">{note.tags}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  style={{ color: "#ff3355" }}
                >
                  ×
                </button>
              </div>
              <AnimatePresence>
                {expanded === note.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3"
                  >
                    <div
                      className="text-xs leading-relaxed opacity-70 border-t pt-2"
                      style={{ borderColor: "rgba(255,215,0,0.1)", color: "#a0d8ef", whiteSpace: "pre-wrap" }}
                    >
                      {note.content || "No content"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <div className="text-center text-xs opacity-30 py-6 tracking-widest">
            NO INTEL STORED
          </div>
        )}
      </div>
    </div>
  );
}

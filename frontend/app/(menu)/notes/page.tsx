"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Declarar primero la función de carga usando useCallback
const fetchActiveNotes = useCallback(async () => {
    try {
      const response = await fetchApi("/notes", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to load active notes");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Ejecutarla en el montaje
  useEffect(() => {
    fetchActiveNotes();
  }, [fetchActiveNotes]);

  // 3. Declarar handleCreateNote después, donde fetchActiveNotes ya existe y es visible
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetchApi("/notes", {
        method: "POST",
        body: JSON.stringify({ title, content, archived: false }),
      });

      if (response.ok) {
        toast.success("Note created successfully!");
        setTitle("");
        setContent("");
        setIsCreating(false);
        fetchActiveNotes(); // Refresca la lista correctamente
      } else {
        const errorMessage = await response.text();
        toast.error(errorMessage || "Failed to create note");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetchApi(`/notes/${id}/archive`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Note moved to archive");
        setNotes(notes.filter((n) => n.id !== id));
      } else {
        toast.error("Failed to archive note");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Active Notes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your daily tasks and ideas 📝
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Note
        </button>
      </div>

      {/* Quick Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateNote}
          className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Create a new note
          </h2>
          <div>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
          <div>
            <textarea
              placeholder="Write your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-zinc-500 dark:text-zinc-400">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No active notes found. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {note.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-400">Active</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleArchive(note.id)}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
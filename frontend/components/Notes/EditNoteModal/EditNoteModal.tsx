"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
}

interface EditNoteModalProps {
  note: Note | null;
  onClose: () => void;
  onUpdated: (updatedNote: Note) => void;
}

export function EditNoteModal({
  note,
  onClose,
  onUpdated,
}: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (!note) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchApi(`/notes/${note.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          content,
          archived: note.archived,
        }),
      });

      if (response.ok) {
        const updatedNote: Note = await response.json();

        onUpdated(updatedNote);
        toast.success("Note updated successfully!");
        onClose();
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        const errorMessage = await response.text();
        toast.error(errorMessage || "Failed to update note");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Edit Note
              </h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Update the title or content of your note.
              </p>
            </div>

            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Title
              </label>

              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Content
              </label>

              <textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
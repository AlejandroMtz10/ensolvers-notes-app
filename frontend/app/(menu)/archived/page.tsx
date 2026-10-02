"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { EditNoteModal } from "@/components/Notes/EditNoteModal";

interface Category {
  id: number;
  name: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
  categories: Category[];
}

export default function ArchivedNotesPage() {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // --------------------------------------------------
  // Fetch categories
  // --------------------------------------------------

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetchApi("/categories", {
        method: "GET",
      });

      if (response.ok) {
        const data: Category[] = await response.json();
        setCategories(data);
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to load categories");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    }
  }, []);

  // --------------------------------------------------
  // Fetch archived notes
  // --------------------------------------------------

  const fetchArchivedNotes = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetchApi("/notes/archived", {
        method: "GET",
      });

      if (response.ok) {
        const data: Note[] = await response.json();
        setArchivedNotes(data);
      } else if (response.status === 401) {
        toast.error("Session expired or unauthorized");
      } else {
        toast.error("Failed to load archived notes");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Initial data
  // --------------------------------------------------

  useEffect(() => {
    fetchCategories();
    fetchArchivedNotes();
  }, [fetchCategories, fetchArchivedNotes]);

  // --------------------------------------------------
  // Update note in local state
  // --------------------------------------------------

  const handleUpdatedNote = (updatedNote: Note) => {
    setArchivedNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  // --------------------------------------------------
  // Unarchive note
  // --------------------------------------------------

  const handleUnarchive = async (id: number) => {
    try {
      const response = await fetchApi(`/notes/${id}/archive`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Note restored to active");

        setArchivedNotes((currentNotes) =>
          currentNotes.filter((note) => note.id !== id)
        );
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to restore note");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    }
  };

  // --------------------------------------------------
  // Delete note
  // --------------------------------------------------

  const handleDelete = async (id: number) => {
    try {
      const response = await fetchApi(`/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        toast.success("Note deleted permanently");

        setArchivedNotes((currentNotes) =>
          currentNotes.filter((note) => note.id !== id)
        );
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to delete note");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    }
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading archived notes...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Archived Notes
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          View and restore your archived notes 🗄️
        </p>
      </div>

      {/* Empty state */}
      {archivedNotes.length === 0 ? (
        <div
          className="text-center py-16 border
            border-dashed border-zinc-200
            dark:border-zinc-800 rounded-2xl"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No archived notes found.
          </p>
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archivedNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-800
                rounded-2xl shadow-sm flex flex-col
                justify-between space-y-3 opacity-90"
            >
              {/* Note content */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {note.title}
                  </h3>

                  <p
                    className="text-sm text-zinc-500
                      dark:text-zinc-400 line-clamp-3
                      whitespace-pre-wrap"
                  >
                    {note.content}
                  </p>
                </div>

                {/* Categories */}
                {note.categories &&
                  note.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2.5 py-1 text-xs
                            font-medium rounded-full
                            bg-blue-50 text-blue-700
                            dark:bg-blue-950
                            dark:text-blue-300"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center
                  justify-between pt-3
                  border-t border-zinc-100
                  dark:border-zinc-800 text-xs"
              >
                <span className="text-amber-500 font-medium">
                  Archived
                </span>

                <div className="flex items-center gap-3">
                  {/* Edit */}
                  <button
                    onClick={() => setEditingNote(note)}
                    className="text-blue-600
                      dark:text-blue-400
                      hover:underline
                      font-medium transition-colors"
                  >
                    Edit
                  </button>

                  {/* Unarchive */}
                  <button
                    onClick={() => handleUnarchive(note.id)}
                    className="text-blue-600
                      dark:text-blue-400
                      font-medium hover:underline"
                  >
                    Unarchive
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600
                      dark:text-red-400
                      font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditNoteModal
        note={editingNote}
        categories={categories}
        onClose={() => setEditingNote(null)}
        onUpdated={handleUpdatedNote}
      />
    </div>
  );
}
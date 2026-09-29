"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

interface Note {
  id: number;
  title: string;
  content: string;
  archived: boolean;
}

export default function ArchivedNotesPage() {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArchivedNotes = useCallback(async () => {
    try {
      const response = await fetchApi("/notes/archived", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedNotes(data);
      } else if (response.status === 401) {
        toast.error("Session expired or unauthorized");
      } else {
        toast.error("Failed to load archived notes");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedNotes();
  }, [fetchArchivedNotes]);

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
      } else {
        toast.error("Failed to restore note");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetchApi(`/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Note deleted permanently");

        setArchivedNotes((currentNotes) =>
          currentNotes.filter((note) => note.id !== id)
        );
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Unable to connect to the backend server");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading archived notes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Archived Notes
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          View and restore your archived notes 🗄️
        </p>
      </div>

      {archivedNotes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No archived notes found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archivedNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 opacity-80"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {note.title}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-amber-500 font-medium">
                  Archived
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUnarchive(note.id)}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Unarchive
                  </button>

                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 dark:text-red-400 font-medium hover:underline"
                  >
                    Delete
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
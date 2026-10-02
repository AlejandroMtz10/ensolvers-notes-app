"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryInput, setCategoryInput] = useState("");

  // Fetch categories

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

  // Fetch active notes

  const fetchActiveNotes = useCallback(async () => {
    setIsLoading(true);

    try {
      const query = selectedCategory
        ? `?category=${encodeURIComponent(selectedCategory)}`
        : "";

      const response = await fetchApi(`/notes${query}`, {
        method: "GET",
      });

      if (response.ok) {
        const data: Note[] = await response.json();
        setNotes(data);
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to load active notes");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Initial data

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchActiveNotes();
  }, [fetchActiveNotes]);

  // Create note

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the note first
      const response = await fetchApi("/notes", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content,
          archived: false,
        }),
      });

      if (response.status === 401) {
        toast.error("Session expired, please log in again.");
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text();
        toast.error(errorMessage || "Failed to create note");
        return;
      }

      const createdNote: Note = await response.json();

      // Assign category if one was provided
      if (categoryInput.trim()) {
        const categoryName = categoryInput.trim();

        // Check if the category already exists
        let category = categories.find(
          (item) =>
            item.name.toLowerCase() === categoryName.toLowerCase()
        );

        // Create the category if it does not exist
        if (!category) {
          const categoryResponse = await fetchApi("/categories", {
            method: "POST",
            body: JSON.stringify({
              name: categoryName,
            }),
          });

          if (categoryResponse.status === 401) {
            toast.error("Session expired, please log in again.");
            return;
          }

          if (!categoryResponse.ok) {
            const errorMessage = await categoryResponse.text();
            toast.error(
              errorMessage || "Failed to create category"
            );
            return;
          }

          category = await categoryResponse.json();

          // Add the new category to local state
          setCategories((currentCategories) => [
            ...currentCategories,
            category!,
          ]);
        }

        // Assign the category to the note
        const categoryResponse = await fetchApi(
          `/notes/${createdNote.id}/categories`,
          {
            method: "PUT",
            body: JSON.stringify({
              categoryIds: [category.id],
            }),
          }
        );

        if (categoryResponse.status === 401) {
          toast.error("Session expired, please log in again.");
          return;
        }

        if (!categoryResponse.ok) {
          toast.error(
            "Note created, but the category could not be assigned."
          );
          return;
        }
      }

      toast.success("Note created successfully!");

      setTitle("");
      setContent("");
      setCategoryInput("");
      setIsCreating(false);

      fetchActiveNotes();
    } catch {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update note in local state

  const handleUpdatedNote = (updatedNote: Note) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  // Archive note

  const handleArchive = async (id: number) => {
    try {
      const response = await fetchApi(`/notes/${id}/archive`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Note moved to archive");

        setNotes((currentNotes) =>
          currentNotes.filter((note) => note.id !== id)
        );
      } else if (response.status === 401) {
        toast.error("Session expired, please log in again.");
      } else {
        toast.error("Failed to archive note");
      }
    } catch {
      toast.error("Unable to connect to the backend server");
    }
  };

  // Render

  return (
    <div className="space-y-6">
      {/* Header */}
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
          className="px-4 py-2 text-sm font-medium text-white
            bg-blue-600 hover:bg-blue-700 rounded-xl
            transition-colors shadow-sm flex items-center
            justify-center gap-2"
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
          className="p-6 bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-800
            rounded-2xl shadow-sm space-y-4"
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
              className="w-full px-3 py-2 text-sm
                bg-transparent border border-zinc-200
                dark:border-zinc-800 rounded-lg
                focus:outline-none focus:ring-2
                focus:ring-blue-600 text-zinc-900
                dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          <div>
            <textarea
              placeholder="Write your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm
                bg-transparent border border-zinc-200
                dark:border-zinc-800 rounded-lg
                focus:outline-none focus:ring-2
                focus:ring-blue-600 text-zinc-900
                dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          <div>
            <label
              htmlFor="note-category"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Category
            </label>

            <input
              id="note-category"
              type="text"
              list="category-options"
              placeholder="Select or create a category..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full px-3 py-2 text-sm
                bg-transparent border border-zinc-200
                dark:border-zinc-800 rounded-lg
                focus:outline-none focus:ring-2
                focus:ring-blue-600 text-zinc-900
                dark:text-zinc-100 placeholder:text-zinc-400"
            />

            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>

            <p className="mt-1.5 text-xs text-zinc-400">
              Select an existing category or type a new one.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs font-medium
                text-zinc-600 dark:text-zinc-400
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium
                text-white bg-blue-600 hover:bg-blue-700
                rounded-lg transition-colors
                disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Filter by category
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Show notes assigned to a specific category.
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-52 px-3 py-2 text-sm
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-800
            rounded-lg text-zinc-900 dark:text-zinc-100
            focus:outline-none focus:ring-2
            focus:ring-blue-600"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-zinc-500 dark:text-zinc-400">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 border border-dashed
          border-zinc-200 dark:border-zinc-800 rounded-2xl"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {selectedCategory
              ? `No active notes found in "${selectedCategory}".`
              : "No active notes found. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-800
                rounded-2xl shadow-sm flex flex-col
                justify-between space-y-3"
            >
              {/* Note content */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {note.title}
                  </h3>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                {/* Categories */}
                {note.categories && note.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-2.5 py-1 text-xs font-medium
                          rounded-full bg-blue-50
                          text-blue-700
                          dark:bg-blue-950
                          dark:text-blue-300"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Note actions */}
              <div
                className="flex items-center justify-between
                  pt-3 border-t border-zinc-100
                  dark:border-zinc-800 text-xs"
              >
                <span className="text-zinc-400">
                  Active
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="text-blue-600
                      dark:text-blue-400 hover:underline
                      font-medium transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleArchive(note.id)}
                    className="text-zinc-600
                      dark:text-zinc-400
                      hover:text-blue-600
                      dark:hover:text-blue-400
                      font-medium transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        categories={categories}
        onClose={() => setEditingNote(null)}
        onUpdated={handleUpdatedNote}
      />
    </div>
  );
}
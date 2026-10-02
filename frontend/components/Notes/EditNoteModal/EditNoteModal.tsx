"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

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

interface EditNoteModalProps {
  note: Note | null;
  categories: Category[];
  onClose: () => void;
  onUpdated: (updatedNote: Note) => void;
}

export function EditNoteModal({
  note,
  categories,
  onClose,
  onUpdated,
}: EditNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load note data when the modal opens
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);

      setSelectedCategoryIds(
        (note.categories ?? []).map((category) => category.id)
      );
    }
  }, [note]);

  if (!note) {
    return null;
  }

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((currentIds) => {
      if (currentIds.includes(categoryId)) {
        return currentIds.filter((id) => id !== categoryId);
      }

      return [...currentIds, categoryId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // ----------------------------------------
      // Update note
      // ----------------------------------------

      const noteResponse = await fetchApi(`/notes/${note.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          content,
          archived: note.archived,
        }),
      });

      if (noteResponse.status === 401) {
        toast.error("Session expired, please log in again.");
        return;
      }

      if (!noteResponse.ok) {
        const errorMessage = await noteResponse.text();

        toast.error(
          errorMessage || "Failed to update note"
        );

        return;
      }

      const updatedNote: Note = await noteResponse.json();

      // ----------------------------------------
      // Update categories
      // ----------------------------------------

      const categoryResponse = await fetchApi(
        `/notes/${note.id}/categories`,
        {
          method: "PUT",
          body: JSON.stringify({
            categoryIds: selectedCategoryIds,
          }),
        }
      );

      if (categoryResponse.status === 401) {
        toast.error("Session expired, please log in again.");
        return;
      }

      if (!categoryResponse.ok) {
        const errorMessage = await categoryResponse.text();

        toast.error(
          errorMessage ||
            "Note updated, but categories could not be saved"
        );

        return;
      }

      const updatedNoteWithCategories: Note =
        await categoryResponse.json();

      // Update parent state
      onUpdated({
        ...updatedNote,
        categories:
          updatedNoteWithCategories.categories ?? [],
      });

      toast.success("Note updated successfully!");

      onClose();
    } catch {
      toast.error(
        "Unable to connect to the backend server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center
        justify-center bg-black/50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh]
          overflow-y-auto bg-white dark:bg-zinc-900
          rounded-2xl shadow-xl border
          border-zinc-200 dark:border-zinc-800"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">

            {/* Header */}
            <div>
              <h2
                className="text-lg font-semibold
                  text-zinc-900 dark:text-zinc-50"
              >
                Edit Note
              </h2>

              <p
                className="text-sm text-zinc-500
                  dark:text-zinc-400 mt-1"
              >
                Update the title, content, or categories
                of your note.
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium
                  text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Title
              </label>

              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm
                  bg-transparent border border-zinc-200
                  dark:border-zinc-800 rounded-lg
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600 text-zinc-900
                  dark:text-zinc-100"
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium
                  text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Content
              </label>

              <textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm
                  bg-transparent border border-zinc-200
                  dark:border-zinc-800 rounded-lg
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600 text-zinc-900
                  dark:text-zinc-100 resize-none"
              />
            </div>

            {/* Categories */}
            <div>
              <label
                className="block text-sm font-medium
                  text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Categories
              </label>

              {categories.length === 0 ? (
                <p
                  className="text-sm text-zinc-500
                    dark:text-zinc-400"
                >
                  No categories available.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isSelected =
                      selectedCategoryIds.includes(category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          toggleCategory(category.id)
                        }
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5
                          rounded-full text-xs
                          font-medium border
                          transition-colors ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                      >
                        {isSelected && "✓ "}
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected categories count */}
              {selectedCategoryIds.length > 0 && (
                <p
                  className="mt-2 text-xs text-zinc-400"
                >
                  {selectedCategoryIds.length}{" "}
                  {selectedCategoryIds.length === 1
                    ? "category"
                    : "categories"}{" "}
                  selected
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 px-6 py-4
              border-t border-zinc-100
              dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium
                text-zinc-600 dark:text-zinc-400
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                rounded-lg transition-colors
                disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium
                text-white bg-blue-600 hover:bg-blue-700
                rounded-lg transition-colors
                disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
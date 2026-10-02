"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps {
  noteId: number;
  selectedCategories: Category[];
  onUpdated: (categories: Category[]) => void;
}

export default function CategorySelector({
  noteId,
  selectedCategories,
  onUpdated,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(
    selectedCategories.map((category) => category.id)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchApi("/categories");

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch {
        toast.error("Unable to load categories");
      }
    };

    loadCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const saveCategories = async () => {
    setIsSaving(true);

    try {
      const response = await fetchApi(`/notes/${noteId}/categories`, {
        method: "PUT",
        body: JSON.stringify({
          categoryIds: selectedIds,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to update categories");
        return;
      }

      const updatedNote = await response.json();

      onUpdated(updatedNote.categories || []);

      toast.success("Categories updated successfully!");
    } catch {
      toast.error("Unable to connect to the backend server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={saveCategories}
        disabled={isSaving}
        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save categories"}
      </button>
    </div>
  );
}
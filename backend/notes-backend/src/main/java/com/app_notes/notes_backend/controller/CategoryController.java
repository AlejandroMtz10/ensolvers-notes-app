package com.app_notes.notes_backend.controller;

import com.app_notes.notes_backend.model.Category;
import com.app_notes.notes_backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category
    ) {
        try {
            return ResponseEntity.ok(
                    categoryService.createCategory(category)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
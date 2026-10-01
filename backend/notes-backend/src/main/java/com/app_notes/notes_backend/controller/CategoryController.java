package com.app_notes.notes_backend.controller;

import com.app_notes.notes_backend.model.Category;
import com.app_notes.notes_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category
    ) {
        if (categoryRepository.findByName(category.getName()) != null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                categoryRepository.save(category)
        );
    }
}
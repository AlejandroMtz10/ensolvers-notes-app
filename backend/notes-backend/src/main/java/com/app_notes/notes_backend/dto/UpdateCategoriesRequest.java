package com.app_notes.notes_backend.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateCategoriesRequest {

    private Set<Long> categoryIds;
}
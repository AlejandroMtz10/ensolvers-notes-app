package com.app_notes.notes_backend.service;

import com.app_notes.notes_backend.model.Category;
import com.app_notes.notes_backend.model.Note;
import com.app_notes.notes_backend.repository.CategoryRepository;
import com.app_notes.notes_backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Create or update note
    public Note saveNote(Note note) {
        return noteRepository.save(note);
    }

    // List active notes for the authenticated user
    public List<Note> getActiveNotes(String username) {
        return noteRepository.findByUserUsernameAndArchived(username, false);
    }

    // List archived notes for the authenticated user
    public List<Note> getArchivedNotes(String username) {
        return noteRepository.findByUserUsernameAndArchived(username, true);
    }

    // Search note by ID for the authenticated user
    public Optional<Note> getNoteById(Long id, String username) {
        return noteRepository.findByIdAndUserUsername(id, username);
    }

    // Delete note
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    // Archive or unarchive a note
    public Note toggleArchiveNote(Long id, String username) {
        Note note = noteRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() ->
                        new RuntimeException("Note not found with ID: " + id)
                );

        note.setArchived(!note.isArchived());

        return noteRepository.save(note);
    }

    // Update note categories
    public Note updateCategories(
            Long noteId,
            String username,
            Set<Long> categoryIds
    ) {
        Note note = noteRepository.findByIdAndUserUsername(noteId, username)
                .orElseThrow(() ->
                        new RuntimeException("Note not found with ID: " + noteId)
                );

        Set<Category> categories =
                new HashSet<>(categoryRepository.findAllById(categoryIds));

        note.setCategories(categories);

        return noteRepository.save(note);
    }
}
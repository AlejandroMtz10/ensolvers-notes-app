package com.app_notes.notes_backend.controller;

import com.app_notes.notes_backend.model.Note;
import com.app_notes.notes_backend.model.User;
import com.app_notes.notes_backend.repository.UserRepository;
import com.app_notes.notes_backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.app_notes.notes_backend.dto.UpdateCategoriesRequest;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserRepository userRepository;

    // List active notes
    @GetMapping
    public List<Note> getAllActiveNotes(Authentication authentication) {
        return noteService.getActiveNotes(authentication.getName());
    }

    // List archived notes
    @GetMapping("/archived")
    public List<Note> getAllArchivedNotes(Authentication authentication) {
        return noteService.getArchivedNotes(authentication.getName());
    }

    // Create note
    @PostMapping
    public ResponseEntity<Note> createNote(
            @RequestBody Note note,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        note.setUser(user);
        note.setArchived(false);

        return ResponseEntity.ok(noteService.saveNote(note));
    }

    // Edit note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @PathVariable Long id,
            @RequestBody Note noteDetails,
            Authentication authentication
    ) {
        return noteService.getNoteById(id, authentication.getName())
                .map(note -> {
                    note.setTitle(noteDetails.getTitle());
                    note.setContent(noteDetails.getContent());

                    Note updatedNote = noteService.saveNote(note);

                    return ResponseEntity.ok(updatedNote);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    // Archive or unarchive note
    @PatchMapping("/{id}/archive")
    public ResponseEntity<Note> toggleArchive(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Note updatedNote = noteService.toggleArchiveNote(
                    id,
                    authentication.getName()
            );

            return ResponseEntity.ok(updatedNote);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Delete note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (noteService.getNoteById(id, authentication.getName()).isPresent()) {
            noteService.deleteNote(id);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/categories")
    public ResponseEntity<Note> updateCategories(
            @PathVariable Long id,
            @RequestBody UpdateCategoriesRequest request,
            Authentication authentication
    ) {
        try {
            Note updatedNote = noteService.updateCategories(
                    id,
                    authentication.getName(),
                    request.getCategoryIds()
            );

            return ResponseEntity.ok(updatedNote);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
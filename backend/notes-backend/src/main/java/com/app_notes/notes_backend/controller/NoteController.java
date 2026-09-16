package com.app_notes.notes_backend.controller;

import com.app_notes.notes_backend.model.Note;
import com.app_notes.notes_backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    // List active notes (archived = false)
    @GetMapping
    public List<Note> getAllActiveNotes() {
        return noteService.getActiveNotes();
    }

    // List archived notes (archived = true)
    @GetMapping("/archived")
    public List<Note> getAllArchivedNotes() {
        return noteService.getArchivedNotes();
    }

    // New note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        note.setArchived(false); // Por defecto nace activa
        return noteService.saveNote(note);
    }

    // Edit note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        return noteService.getNoteById(id)
                .map(note -> {
                    note.setTitle(noteDetails.getTitle());
                    note.setContent(noteDetails.getContent());
                    Note updatedNote = noteService.saveNote(note);
                    return ResponseEntity.ok(updatedNote);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Archive or unarchive a note
    @PatchMapping("/{id}/archive")
    public ResponseEntity<Note> toggleArchive(@PathVariable Long id) {
        try {
            Note updatedNote = noteService.toggleArchiveNote(id);
            return ResponseEntity.ok(updatedNote);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        if (noteService.getNoteById(id).isPresent()) {
            noteService.deleteNote(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
package com.notes.backend.service;

import com.notes.backend.model.Note;
import com.notes.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    // Create or update note
    public Note saveNote(Note note) {
        return noteRepository.save(note);
    }

    // List active notes (archived = false)
    public List<Note> getActiveNotes() {
        return noteRepository.findByArchived(false);
    }

    // List archived notes (archived = true)
    public List<Note> getArchivedNotes() {
        return noteRepository.findByArchived(true);
    }

    // Search note by ID
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    // Delete note
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    // Archive or unarchive a note
    public Note toggleArchiveNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found with ID: " + id));
        note.setArchived(!note.isArchived());
        return noteRepository.save(note);
    }
}
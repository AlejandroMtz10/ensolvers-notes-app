package com.app_notes.notes_backend.service;

import com.app_notes.notes_backend.model.Note;
import com.app_notes.notes_backend.repository.NoteRepository;
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

    public List<Note> getActiveNotes(String username) {
        return noteRepository.findByUserUsernameAndArchived(username, false);
    }

    public List<Note> getArchivedNotes(String username) {
        return noteRepository.findByUserUsernameAndArchived(username, true);
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
package com.app_notes.notes_backend.repository;

import com.app_notes.notes_backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Search notes by title containing a specific keyword
    List<Note> findByArchived(boolean archived);
}
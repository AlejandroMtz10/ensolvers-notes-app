package com.app_notes.notes_backend.repository;

import com.app_notes.notes_backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserUsernameAndArchived(
            String username,
            boolean archived
    );

    Optional<Note> findByIdAndUserUsername(
            Long id,
            String username
    );

    List<Note> findByUserUsernameAndArchivedAndCategoriesNameIgnoreCase(
            String username,
            boolean archived,
            String categoryName
    );
}
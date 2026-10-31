package com.example.notes.repository;

import com.example.notes.model.Note;
import com.example.notes.model.NoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByCreatedByAndStatusOrderByCreatedAtDesc(UUID createdBy, NoteStatus status);
    List<Note> findByCreatedByAndGroupUuidAndStatusOrderByCreatedAtAsc(UUID createdBy, UUID groupUuid, NoteStatus status);
    Optional<Note> findByUuidAndCreatedBy(UUID uuid, UUID createdBy);
    long countByGroupUuidAndStatus(UUID groupUuid, NoteStatus status);
}


package com.example.notes.repository;

import com.example.notes.model.NotesGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotesGroupRepository extends JpaRepository<NotesGroup, UUID> {
    Optional<NotesGroup> findByUuidAndCreatedBy(UUID uuid, UUID createdBy);
    List<NotesGroup> findByCreatedByOrderByGroupIdAsc(UUID createdBy);

    @Query("SELECT COALESCE(MAX(g.groupId), 0) FROM NotesGroup g WHERE g.createdBy = :createdBy")
    Long findMaxGroupIdByCreatedBy(@Param("createdBy") UUID createdBy);
}


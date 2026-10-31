package com.example.notes.dto;

import com.example.notes.model.Note;
import com.example.notes.model.NoteStatus;

import java.time.Instant;
import java.util.UUID;

public class NoteResponse {
    private UUID uuid;
    private String note;
    private UUID groupUuid;
    private Long groupId;
    private NoteStatus status;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public NoteResponse() {
    }

    public NoteResponse(Note note, Long groupId) {
        this.uuid = note.getUuid();
        this.note = note.getNote();
        this.groupUuid = note.getGroupUuid();
        this.groupId = groupId;
        this.status = note.getStatus();
        this.createdBy = note.getCreatedBy();
        this.createdAt = note.getCreatedAt();
        this.updatedAt = note.getUpdatedAt();
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public UUID getGroupUuid() {
        return groupUuid;
    }

    public void setGroupUuid(UUID groupUuid) {
        this.groupUuid = groupUuid;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public NoteStatus getStatus() {
        return status;
    }

    public void setStatus(NoteStatus status) {
        this.status = status;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}


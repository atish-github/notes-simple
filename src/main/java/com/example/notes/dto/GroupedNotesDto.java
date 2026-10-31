package com.example.notes.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class GroupedNotesDto {
    private UUID groupUuid;
    private Long groupId;
    private String groupName;
    private Instant createdAt;
    private List<NoteResponse> notes = new ArrayList<>();

    public GroupedNotesDto() {
    }

    public GroupedNotesDto(UUID groupUuid, Long groupId, String groupName, Instant createdAt, List<NoteResponse> notes) {
        this.groupUuid = groupUuid;
        this.groupId = groupId;
        this.groupName = groupName;
        this.createdAt = createdAt;
        this.notes = notes;
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

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<NoteResponse> getNotes() {
        return notes;
    }

    public void setNotes(List<NoteResponse> notes) {
        this.notes = notes;
    }
}


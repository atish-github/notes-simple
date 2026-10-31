package com.example.notes.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CreateNoteRequest {

    @NotBlank(message = "Note content cannot be empty")
    private String note;

    private UUID groupUuid; // Optional: if null, backend creates a new notes_group

    public CreateNoteRequest() {
    }

    public CreateNoteRequest(String note, UUID groupUuid) {
        this.note = note;
        this.groupUuid = groupUuid;
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
}


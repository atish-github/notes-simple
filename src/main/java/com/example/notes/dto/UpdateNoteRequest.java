package com.example.notes.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateNoteRequest {

    @NotBlank(message = "Note content cannot be empty")
    private String note;

    public UpdateNoteRequest() {
    }

    public UpdateNoteRequest(String note) {
        this.note = note;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}


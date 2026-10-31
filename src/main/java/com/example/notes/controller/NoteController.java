package com.example.notes.controller;

import com.example.notes.dto.CreateNoteRequest;
import com.example.notes.dto.GroupedNotesDto;
import com.example.notes.dto.NoteResponse;
import com.example.notes.dto.UpdateNoteRequest;
import com.example.notes.model.User;
import com.example.notes.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Notes", description = "Endpoints for managing notes and note groups tied to authenticated user")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    @Operation(summary = "Get all active notes grouped",
               description = "Fetches notes tied to the logged-in user (created_by), structured by note groups. Excludes archived notes.")
    public ResponseEntity<List<GroupedNotesDto>> getNotes(@AuthenticationPrincipal User user) {
        List<GroupedNotesDto> groupedNotes = noteService.getActiveNotesGrouped(user);
        return ResponseEntity.ok(groupedNotes);
    }

    @PostMapping
    @Operation(summary = "Create a new note",
               description = "Creates a note. If groupUuid is provided, appends to that group; otherwise generates a new notes_group. Note is sanitized for XSS.")
    public ResponseEntity<NoteResponse> createNote(
            @Valid @RequestBody CreateNoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        NoteResponse created = noteService.createNote(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update note text",
               description = "Updates note content in-place within the card. Note content is sanitized for XSS.")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateNoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        NoteResponse updated = noteService.updateNote(id, request, user);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a note",
               description = "Marks a note as archived. It will be hidden on the UI and excluded from future read API responses.")
    public ResponseEntity<NoteResponse> archiveNote(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal User user
    ) {
        NoteResponse archived = noteService.archiveNote(id, user);
        return ResponseEntity.ok(archived);
    }
}


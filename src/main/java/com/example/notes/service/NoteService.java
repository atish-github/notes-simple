package com.example.notes.service;

import com.example.notes.config.XssSanitizer;
import com.example.notes.dto.CreateNoteRequest;
import com.example.notes.dto.GroupedNotesDto;
import com.example.notes.dto.NoteResponse;
import com.example.notes.dto.UpdateNoteRequest;
import com.example.notes.model.Note;
import com.example.notes.model.NoteStatus;
import com.example.notes.model.NotesGroup;
import com.example.notes.model.User;
import com.example.notes.repository.NoteRepository;
import com.example.notes.repository.NotesGroupRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final NotesGroupRepository notesGroupRepository;
    private final XssSanitizer xssSanitizer;

    public NoteService(NoteRepository noteRepository,
                       NotesGroupRepository notesGroupRepository,
                       XssSanitizer xssSanitizer) {
        this.noteRepository = noteRepository;
        this.notesGroupRepository = notesGroupRepository;
        this.xssSanitizer = xssSanitizer;
    }

    /**
     * Fetch all active notes for the logged in user, structured by note groups.
     * Archived notes are excluded as required.
     */
    @Transactional(readOnly = true)
    public List<GroupedNotesDto> getActiveNotesGrouped(User user) {
        UUID userId = user.getUuid();

        // 1. Get all active notes for the user
        List<Note> activeNotes = noteRepository.findByCreatedByAndStatusOrderByCreatedAtDesc(userId, NoteStatus.active);

        // 2. Fetch all groups for the user
        List<NotesGroup> userGroups = notesGroupRepository.findByCreatedByOrderByGroupIdAsc(userId);
        Map<UUID, NotesGroup> groupMap = userGroups.stream()
                .collect(Collectors.toMap(NotesGroup::getUuid, g -> g));

        // 3. Group active notes by group_uuid
        Map<UUID, List<Note>> notesByGroup = new LinkedHashMap<>();
        for (Note note : activeNotes) {
            notesByGroup.computeIfAbsent(note.getGroupUuid(), k -> new ArrayList<>()).add(note);
        }

        List<GroupedNotesDto> result = new ArrayList<>();

        // Add groups that have active notes
        for (NotesGroup group : userGroups) {
            List<Note> notes = notesByGroup.get(group.getUuid());
            if (notes != null && !notes.isEmpty()) {
                // Keep notes in chronological order for stacking
                notes.sort(Comparator.comparing(Note::getCreatedAt));
                List<NoteResponse> noteResponses = notes.stream()
                        .map(n -> new NoteResponse(n, group.getGroupId()))
                        .toList();

                result.add(new GroupedNotesDto(
                        group.getUuid(),
                        group.getGroupId(),
                        group.getGroupName(),
                        group.getCreatedAt(),
                        noteResponses
                ));
            }
        }

        return result;
    }

    /**
     * Create a new note. If groupUuid is not provided, a new group with an incremental groupId is created.
     * Content is strictly sanitized for XSS.
     */
    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, User user) {
        UUID userId = user.getUuid();
        String rawContent = request.getNote();
        String sanitizedContent = xssSanitizer.sanitize(rawContent);

        NotesGroup group;
        if (request.getGroupUuid() != null) {
            group = notesGroupRepository.findByUuidAndCreatedBy(request.getGroupUuid(), userId)
                    .orElseGet(() -> createNewGroupForUser(userId));
        } else {
            group = createNewGroupForUser(userId);
        }

        Note note = new Note(sanitizedContent, group.getUuid(), userId);
        Note savedNote = noteRepository.save(note);

        return new NoteResponse(savedNote, group.getGroupId());
    }

    /**
     * Update an existing note within the card. Content is sanitized for XSS.
     */
    @Transactional
    public NoteResponse updateNote(UUID noteUuid, UpdateNoteRequest request, User user) {
        UUID userId = user.getUuid();
        Note note = noteRepository.findByUuidAndCreatedBy(noteUuid, userId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteUuid));

        String sanitizedContent = xssSanitizer.sanitize(request.getNote());
        note.setNote(sanitizedContent);
        Note updated = noteRepository.save(note);

        NotesGroup group = notesGroupRepository.findByUuidAndCreatedBy(updated.getGroupUuid(), userId)
                .orElse(null);
        Long groupId = group != null ? group.getGroupId() : 0L;

        return new NoteResponse(updated, groupId);
    }

    /**
     * Archive a note. Backend sets status to 'archived', excluding it from the main read API.
     */
    @Transactional
    public NoteResponse archiveNote(UUID noteUuid, User user) {
        UUID userId = user.getUuid();
        Note note = noteRepository.findByUuidAndCreatedBy(noteUuid, userId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteUuid));

        note.setStatus(NoteStatus.archived);
        Note archived = noteRepository.save(note);

        NotesGroup group = notesGroupRepository.findByUuidAndCreatedBy(archived.getGroupUuid(), userId)
                .orElse(null);
        Long groupId = group != null ? group.getGroupId() : 0L;

        return new NoteResponse(archived, groupId);
    }

    /**
     * Helper to create a new group with incremental groupId for this user.
     */
    private NotesGroup createNewGroupForUser(UUID userId) {
        Long maxGroupId = notesGroupRepository.findMaxGroupIdByCreatedBy(userId);
        long nextGroupId = (maxGroupId != null ? maxGroupId : 0L) + 1L;

        NotesGroup newGroup = new NotesGroup(nextGroupId, "Group #" + nextGroupId, userId);
        return notesGroupRepository.save(newGroup);
    }
}


package com.example.notes.config;

import com.example.notes.model.Note;
import com.example.notes.model.NoteStatus;
import com.example.notes.model.NotesGroup;
import com.example.notes.model.Role;
import com.example.notes.model.User;
import com.example.notes.repository.NoteRepository;
import com.example.notes.repository.NotesGroupRepository;
import com.example.notes.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final NotesGroupRepository notesGroupRepository;
    private final NoteRepository noteRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            NotesGroupRepository notesGroupRepository,
            NoteRepository noteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.notesGroupRepository = notesGroupRepository;
        this.noteRepository = noteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        final String defaultEmail = "atishsharma11@gmail.com";
        final String defaultPasswordRaw = "qwerty@123";
        final String defaultPreferredName = "Atish";

        Optional<User> existingUser = userRepository.findByEmail(defaultEmail);
        User user;

        if (existingUser.isEmpty()) {
            logger.info("Seeding default user: {}", defaultEmail);
            user = new User();
            user.setEmail(defaultEmail);
            user.setPreferredName(defaultPreferredName);
            user.setPassword(passwordEncoder.encode(defaultPasswordRaw));
            user.setRole(Role.ROLE_ADMIN);
            user = userRepository.save(user);
            logger.info("Default user created with UUID: {}", user.getUuid());

            // Seed initial note groups and sample stacked notes for visual showcase
            seedSampleNotes(user);
        } else {
            user = existingUser.get();
            logger.info("Default user {} already exists (UUID: {})", defaultEmail, user.getUuid());
        }
    }

    private void seedSampleNotes(User user) {
        // Group 1: Project Architecture & Setup
        NotesGroup group1 = new NotesGroup(1L, "Architecture & Setup", user.getUuid());
        notesGroupRepository.save(group1);

        Note note1 = new Note("Backend powered by Spring Boot (Java 25) with JWT stateless authentication valid for 24 hours.", group1.getUuid(), user.getUuid());
        Note note2 = new Note("PostgreSQL database holds users, notes, and notes_groups with strict cryptographic BCrypt hashing.", group1.getUuid(), user.getUuid());
        Note note3 = new Note("All input is sanitized at the Java level with Jsoup to prevent XSS vulnerabilities.", group1.getUuid(), user.getUuid());

        noteRepository.save(note1);
        noteRepository.save(note2);
        noteRepository.save(note3);

        // Group 2: Mobile-First Glassmorphism UI
        NotesGroup group2 = new NotesGroup(2L, "UI & Experience", user.getUuid());
        notesGroupRepository.save(group2);

        Note note4 = new Note("Glassmorphic layered cards with shadow risen effect floating above the canvas.", group2.getUuid(), user.getUuid());
        Note note5 = new Note("Swipe or toggle between stacked notes in a zig-zag physical layout on the desk.", group2.getUuid(), user.getUuid());

        noteRepository.save(note4);
        noteRepository.save(note5);

        logger.info("Sample notes seeded successfully in 2 groups.");
    }
}


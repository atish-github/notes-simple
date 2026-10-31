package com.example.notes.dto;

import com.example.notes.model.Role;
import java.util.UUID;

public class UserSummaryDto {
    private UUID id;
    private String email;
    private String preferredName;
    private Role role;

    public UserSummaryDto() {
    }

    public UserSummaryDto(UUID id, String email, String preferredName, Role role) {
        this.id = id;
        this.email = email;
        this.preferredName = preferredName;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPreferredName() {
        return preferredName;
    }

    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}


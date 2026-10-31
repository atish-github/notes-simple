package com.example.notes.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private long expiresIn; // seconds, e.g. 86400 (24 hours)
    private UserSummaryDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, long expiresIn, UserSummaryDto user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserSummaryDto getUser() {
        return user;
    }

    public void setUser(UserSummaryDto user) {
        this.user = user;
    }
}


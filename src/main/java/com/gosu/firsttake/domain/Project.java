package com.gosu.firsttake.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "project")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String generalPrompt;

    private String tone;

    private String narratorVoice;

    @Column(columnDefinition = "TEXT")
    private String narratorVoicePrompt;

    @Column(columnDefinition = "TEXT")
    private String visualStylePrompt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(32) DEFAULT 'DRAFT'")
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant lastOpenedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGeneralPrompt() {
        return generalPrompt;
    }

    public void setGeneralPrompt(String generalPrompt) {
        this.generalPrompt = generalPrompt;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getNarratorVoice() {
        return narratorVoice;
    }

    public void setNarratorVoice(String narratorVoice) {
        this.narratorVoice = narratorVoice;
    }

    public String getNarratorVoicePrompt() {
        return narratorVoicePrompt;
    }

    public void setNarratorVoicePrompt(String narratorVoicePrompt) {
        this.narratorVoicePrompt = narratorVoicePrompt;
    }

    public String getVisualStylePrompt() {
        return visualStylePrompt;
    }

    public void setVisualStylePrompt(String visualStylePrompt) {
        this.visualStylePrompt = visualStylePrompt;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
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

    public Instant getLastOpenedAt() {
        return lastOpenedAt;
    }

    public void setLastOpenedAt(Instant lastOpenedAt) {
        this.lastOpenedAt = lastOpenedAt;
    }
}

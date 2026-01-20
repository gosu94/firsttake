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
@Table(name = "timeline_beat")
public class TimelineBeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private int orderIndex;

    @Column(columnDefinition = "TEXT")
    private String scriptSentence;

    @Column(columnDefinition = "TEXT")
    private String scenePrompt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SceneType sceneType = SceneType.IMAGE;

    @Column(nullable = false)
    private boolean selectedForGeneration = true;

    @Column(nullable = false)
    private boolean videoGenerateAudio = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

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

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getScriptSentence() {
        return scriptSentence;
    }

    public void setScriptSentence(String scriptSentence) {
        this.scriptSentence = scriptSentence;
    }

    public String getScenePrompt() {
        return scenePrompt;
    }

    public void setScenePrompt(String scenePrompt) {
        this.scenePrompt = scenePrompt;
    }

    public SceneType getSceneType() {
        return sceneType;
    }

    public void setSceneType(SceneType sceneType) {
        this.sceneType = sceneType;
    }

    public boolean isSelectedForGeneration() {
        return selectedForGeneration;
    }

    public void setSelectedForGeneration(boolean selectedForGeneration) {
        this.selectedForGeneration = selectedForGeneration;
    }

    public boolean isVideoGenerateAudio() {
        return videoGenerateAudio;
    }

    public void setVideoGenerateAudio(boolean videoGenerateAudio) {
        this.videoGenerateAudio = videoGenerateAudio;
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

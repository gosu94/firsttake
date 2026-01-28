package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.ProjectDtos;
import com.gosu.firsttake.service.ProjectService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/session/project")
public class SessionProjectController {
    private static final String SESSION_PROJECT_ID = "currentProjectId";

    private final ProjectService projectService;

    public SessionProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ProjectDtos.ProjectDetail getSessionProject(HttpSession session) {
        Long projectId = (Long) session.getAttribute(SESSION_PROJECT_ID);
        if (projectId == null) {
            ProjectDtos.ProjectSummary draft = projectService.createDraftProject();
            session.setAttribute(SESSION_PROJECT_ID, draft.id());
            return projectService.getProjectDetail(draft.id());
        }
        try {
            return projectService.getProjectDetail(projectId);
        } catch (IllegalArgumentException ex) {
            ProjectDtos.ProjectSummary draft = projectService.createDraftProject();
            session.setAttribute(SESSION_PROJECT_ID, draft.id());
            return projectService.getProjectDetail(draft.id());
        }
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDtos.ProjectDetail createNewSessionProject(HttpSession session) {
        ProjectDtos.ProjectSummary draft = projectService.createDraftProject();
        session.setAttribute(SESSION_PROJECT_ID, draft.id());
        return projectService.getProjectDetail(draft.id());
    }

    @PostMapping("/select/{projectId}")
    public ProjectDtos.ProjectDetail selectSessionProject(
        @PathVariable Long projectId,
        HttpSession session
    ) {
        ProjectDtos.ProjectDetail detail = projectService.getProjectDetail(projectId);
        session.setAttribute(SESSION_PROJECT_ID, projectId);
        return detail;
    }
}

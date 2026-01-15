package com.gosu.firsttake.api;

import com.gosu.firsttake.api.dto.ProjectDtos;
import com.gosu.firsttake.api.dto.ProjectRequests;
import com.gosu.firsttake.service.ExportService;
import com.gosu.firsttake.service.ProjectService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProjectController {
    private final ProjectService projectService;
    private final ExportService exportService;

    public ProjectController(ProjectService projectService, ExportService exportService) {
        this.projectService = projectService;
        this.exportService = exportService;
    }

    @GetMapping("/projects")
    public List<ProjectDtos.ProjectSummary> listProjects() {
        return projectService.listProjects();
    }

    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDtos.ProjectSummary createProject(@RequestBody ProjectRequests.ProjectCreate request) {
        return projectService.createProject(request);
    }

    @GetMapping("/projects/{projectId}")
    public ProjectDtos.ProjectDetail getProject(@PathVariable Long projectId) {
        return projectService.getProjectDetail(projectId);
    }

    @PutMapping("/projects/{projectId}")
    public ProjectDtos.ProjectSummary updateProject(
        @PathVariable Long projectId,
        @RequestBody ProjectRequests.ProjectUpdate request
    ) {
        return projectService.updateProject(projectId, request);
    }

    @PostMapping("/projects/{projectId}/beats")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDtos.BeatDetail createBeat(
        @PathVariable Long projectId,
        @RequestBody ProjectRequests.BeatCreate request
    ) {
        return projectService.createBeat(projectId, request);
    }

    @PostMapping("/projects/{projectId}/generate-script")
    public List<ProjectDtos.BeatDetail> generateScript(
        @PathVariable Long projectId,
        @RequestBody ProjectRequests.GenerateScript request
    ) {
        return projectService.generateScript(projectId, request);
    }

    @PostMapping("/projects/{projectId}/generate-assets")
    public List<ProjectDtos.BeatDetail> generateAssets(
        @PathVariable Long projectId,
        @RequestBody(required = false) ProjectRequests.GenerateAssets request
    ) {
        return projectService.generateAssets(projectId, request);
    }

    @GetMapping("/projects/{projectId}/export.zip")
    public void exportProject(@PathVariable Long projectId, HttpServletResponse response) throws IOException {
        exportService.exportProject(projectId, response);
    }

    @DeleteMapping("/beats/{beatId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBeat(@PathVariable Long beatId) {
        projectService.deleteBeat(beatId);
    }

    @PutMapping("/beats/{beatId}")
    public ProjectDtos.BeatDetail updateBeat(
        @PathVariable Long beatId,
        @RequestBody ProjectRequests.BeatUpdate request
    ) {
        return projectService.updateBeat(beatId, request);
    }
}

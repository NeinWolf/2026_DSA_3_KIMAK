package com.timetracking.service;

import com.timetracking.dto.ProjectRequestDTO;
import com.timetracking.dto.ProjectResponseDTO;
import com.timetracking.entity.Project;
import com.timetracking.repository.ProjectRepository;
import com.timetracking.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    public List<ProjectResponseDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectResponseDTO::fromEntity)
                .toList();
    }

    public ProjectResponseDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        return ProjectResponseDTO.fromEntity(project);
    }

    public ProjectResponseDTO createProject(ProjectRequestDTO request) {
        validateDates(request);
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        return ProjectResponseDTO.fromEntity(projectRepository.save(project));
    }

    public ProjectResponseDTO updateProject(Long id, ProjectRequestDTO request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        validateDates(request);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        return ProjectResponseDTO.fromEntity(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!taskRepository.findByProjectId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete project with existing tasks");
        }
        projectRepository.delete(project);
    }

    private void validateDates(ProjectRequestDTO request) {
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
        }
    }
}

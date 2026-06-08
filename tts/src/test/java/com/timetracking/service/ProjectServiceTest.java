package com.timetracking.service;

import com.timetracking.dto.ProjectRequestDTO;
import com.timetracking.dto.ProjectResponseDTO;
import com.timetracking.entity.Project;
import com.timetracking.entity.Task;
import com.timetracking.repository.ProjectRepository;
import com.timetracking.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void createProject_ShouldThrowBadRequest_WhenEndDateIsBeforeStartDate() {
        // Arrange
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setName("Rhythm Game Thesis");
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now()); // Invalid: End date is before start date

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> projectService.createProject(request)
        );
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("End date cannot be before start date", exception.getReason());
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void deleteProject_ShouldThrowConflict_WhenProjectHasTasks() {
        // Arrange
        Long projectId = 1L;
        Project mockProject = new Project();
        mockProject.setId(projectId);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        // Simulate finding an active task attached to this project
        when(taskRepository.findByProjectId(projectId)).thenReturn(List.of(new Task()));

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> projectService.deleteProject(projectId)
        );
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("Cannot delete project with existing tasks", exception.getReason());
        verify(projectRepository, never()).delete(any(Project.class));
    }
}
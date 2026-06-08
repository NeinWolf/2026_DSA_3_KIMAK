package com.timetracking.service;

import com.timetracking.dto.TaskRequestDTO;
import com.timetracking.entity.Project;
import com.timetracking.entity.TaskStatus;
import com.timetracking.repository.ProjectRepository;
import com.timetracking.repository.TaskRepository;
import com.timetracking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void getTasksByProjectId_ShouldThrowNotFound_WhenProjectDoesNotExist() {
        // Arrange
        Long invalidProjectId = 999L;
        when(projectRepository.existsById(invalidProjectId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.getTasksByProjectId(invalidProjectId)
        );
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Project not found", exception.getReason());
    }

    @Test
    void createTask_ShouldThrowNotFound_WhenAssignedUserDoesNotExist() {
        // Arrange
        Long projectId = 1L;
        Project mockProject = new Project();
        mockProject.setId(projectId);

        TaskRequestDTO request = new TaskRequestDTO();
        request.setProjectId(projectId);
        request.setName("Fix Cable Crosstalk");
        request.setStatus(TaskStatus.TODO);
        request.setAssignedUserIds(Set.of(10L, 11L)); // Inputting two IDs

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        // Simulate only finding one of the two users in the DB
        when(userRepository.findAllById(request.getAssignedUserIds())).thenReturn(List.of(new com.timetracking.entity.User()));

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskService.createTask(request)
        );
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("One or more assigned users not found", exception.getReason());
        verify(taskRepository, never()).save(any());
    }
}
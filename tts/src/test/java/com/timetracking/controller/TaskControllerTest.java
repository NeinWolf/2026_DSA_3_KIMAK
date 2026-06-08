package com.timetracking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timetracking.dto.TaskRequestDTO;
import com.timetracking.entity.Project;
import com.timetracking.entity.TaskStatus;
import com.timetracking.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    private Project savedProject;

    @BeforeEach
    void setUp() {
        // Save a base project to satisfy the database constraint requirements
        Project project = new Project();
        project.setName("Main Infrastructure Development");
        project.setDescription("Core platform tasks");
        savedProject = projectRepository.save(project);
    }

    @Test
    @WithMockUser(username = "admin_user")
    void createTask_ShouldReturn200AndSaveTask_WhenPayloadIsValid() throws Exception {
        // Arrange
        TaskRequestDTO request = new TaskRequestDTO();
        request.setProjectId(savedProject.getId()); // Map to our newly created project
        request.setName("Implement Pipeline Architecture");
        request.setDescription("Set up automated GitHub actions workflows");
        request.setStatus(TaskStatus.TODO);
        request.setAssignedUserIds(Collections.emptySet());

        // Act & Assert
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Implement Pipeline Architecture"));
    }
}
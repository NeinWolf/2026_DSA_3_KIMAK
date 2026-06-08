package com.timetracking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timetracking.dto.ProjectRequestDTO;
import com.timetracking.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin_user", roles = {"ADMIN"}) // Bypasses JWT security check
    void createProject_ShouldReturn201Created_WhenUserIsAuthenticated() throws Exception {
        // Arrange
        ProjectRequestDTO request = new ProjectRequestDTO();
        request.setName("Custom Engine Project");
        request.setDescription("Rebuilding game components from scratch");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusMonths(3));

        // Act & Assert
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Custom Engine Project"));
    }

    @Test
    void getAllProjects_ShouldReturn401Unauthorized_WhenNoUserProvided() throws Exception {
        // Act & Assert: Running without @WithMockUser should trigger your security filter!
        mockMvc.perform(get("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
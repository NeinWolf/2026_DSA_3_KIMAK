package com.timetracking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timetracking.dto.UserRequestDTO;
import com.timetracking.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // CRITICAL: This rolls back the database changes after the test finishes!
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // Used to convert objects to JSON strings

    @Test
    void createUser_ShouldReturn200AndCreateUser_WhenRequestIsValid() throws Exception {
        // 1. Arrange
        UserRequestDTO request = new UserRequestDTO();
        request.setUsername("integration_user");
        request.setPassword("securepass123");
        request.setRole(Role.EMPLOYEE);

        // 2 & 3. Act & Assert
        // We can test this without a JWT token because of your permitAll() rule!
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()) // Expect HTTP 200
                .andExpect(jsonPath("$.username").value("integration_user"))
                .andExpect(jsonPath("$.id").exists()); // Check that the DB assigned an ID
    }
}
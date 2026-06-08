package com.timetracking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timetracking.dto.LoginRequestDTO;
import com.timetracking.entity.Role;
import com.timetracking.entity.User;
import com.timetracking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Wipes the database clean after every single test
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Create a real user in the test database before we attempt to log in
        User testUser = new User();
        testUser.setUsername("auth_integration_user");
        testUser.setPasswordHash(passwordEncoder.encode("superSecret123"));
        testUser.setRole(Role.EMPLOYEE);
        userRepository.save(testUser);
    }

    @Test
    void login_ShouldReturn200AndToken_WhenCredentialsAreValid() throws Exception {
        // Arrange
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("auth_integration_user");
        request.setPassword("superSecret123"); // The raw password, NOT the hash

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists()) // Ensure the JWT is actually returned
                .andExpect(jsonPath("$.username").value("auth_integration_user"));
    }

    @Test
    void login_ShouldReturn401_WhenPasswordIsIncorrect() throws Exception {
        // Arrange
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("auth_integration_user");
        request.setPassword("wrongPassword!!");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // Expect HTTP 401
    }
}
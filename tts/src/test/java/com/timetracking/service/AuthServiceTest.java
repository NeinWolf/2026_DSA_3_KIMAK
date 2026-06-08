package com.timetracking.service;

import com.timetracking.dto.AuthResponseDTO;
import com.timetracking.dto.LoginRequestDTO;
import com.timetracking.entity.Role;
import com.timetracking.entity.User;
import com.timetracking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_ShouldReturnAuthResponse_WhenCredentialsAreValid() {
        // Arrange
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("testemployee");
        request.setPassword("correctPassword");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testemployee");
        mockUser.setPasswordHash("hashedPasswordFromDb");
        mockUser.setRole(Role.EMPLOYEE);

        // Tell the mocks how to behave
        when(userRepository.findByUsername("testemployee")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("correctPassword", "hashedPasswordFromDb")).thenReturn(true);
        when(jwtService.generateToken("testemployee")).thenReturn("fake-jwt-token-123");

        // Act
        AuthResponseDTO response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("testemployee", response.getUsername());
        assertEquals("fake-jwt-token-123", response.getToken());
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("unknown_user");

        when(userRepository.findByUsername("unknown_user")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(request)
        );
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());

        // Ensure we never tried to check the password or generate a token
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsIncorrect() {
        // Arrange
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("testemployee");
        request.setPassword("wrongPassword");

        User mockUser = new User();
        mockUser.setUsername("testemployee");
        mockUser.setPasswordHash("hashedPasswordFromDb");

        when(userRepository.findByUsername("testemployee")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongPassword", "hashedPasswordFromDb")).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(request)
        );
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());

        // Ensure we never generated a token
        verify(jwtService, never()).generateToken(anyString());
    }
}
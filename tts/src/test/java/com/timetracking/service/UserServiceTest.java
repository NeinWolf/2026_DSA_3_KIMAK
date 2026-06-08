package com.timetracking.service;


import com.timetracking.dto.UserRequestDTO;
import com.timetracking.dto.UserResponseDTO;
import com.timetracking.entity.Role;
import com.timetracking.entity.User;
import com.timetracking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Tells JUnit to use Mockito
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_ShouldReturnUserResponse_WhenUsernameIsUnique() {
        // 1. Arrange (Set up the fake data)
        UserRequestDTO request = new UserRequestDTO();
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setRole(Role.EMPLOYEE);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        savedUser.setRole(Role.EMPLOYEE);

        // Tell the mocks how to behave
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // 2. Act (Call the actual method)
        UserResponseDTO response = userService.createUser(request);

        // 3. Assert (Check the results)
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        verify(userRepository, times(1)).save(any(User.class)); // Ensure save was called exactly once
    }

    @Test
    void createUser_ShouldThrowException_WhenUsernameExists() {
        // 1. Arrange
        UserRequestDTO request = new UserRequestDTO();
        request.setUsername("existinguser");

        // Simulate the database finding an existing user
        when(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(new User()));

        // 2 & 3. Act & Assert
        assertThrows(ResponseStatusException.class, () -> userService.createUser(request));

        // Ensure the code never tried to save the user to the database
        verify(userRepository, never()).save(any(User.class));
    }
}

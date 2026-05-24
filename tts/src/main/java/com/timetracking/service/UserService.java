package com.timetracking.service;

import com.timetracking.dto.UserRequestDTO;
import com.timetracking.dto.UserResponseDTO;
import com.timetracking.entity.User;
import com.timetracking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
    }

    public UserResponseDTO getUserById(Long id) {
        User user = findUserOrThrow(id);
        return UserResponseDTO.fromEntity(user);
    }

    public UserResponseDTO createUser(UserRequestDTO request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(request.getPassword()); //tymczasowo, później zmienię to na hashowanie
        user.setRole(request.getRole());

        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        User user = findUserOrThrow(id);

        userRepository.findByUsername(request.getUsername())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
                });

        user.setUsername(request.getUsername());
        user.setPasswordHash(request.getPassword()); // tymczasowo, później zmienię na PasswordEncoder
        user.setRole(request.getRole());

        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
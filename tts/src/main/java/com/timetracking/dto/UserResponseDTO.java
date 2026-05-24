package com.timetracking.dto;

import com.timetracking.entity.Role;
import com.timetracking.entity.User;

public class UserResponseDTO {

    private Long id;
    private String username;
    private Role role;

    public static UserResponseDTO fromEntity(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.role = user.getRole();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Role getRole() {
        return role;
    }
}
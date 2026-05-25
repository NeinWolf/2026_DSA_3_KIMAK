package com.timetracking.dto;

import com.timetracking.entity.Role;
import com.timetracking.entity.User;

public class AuthResponseDTO {

    private String token;
    private Long id;
    private String username;
    private Role role;

    public static AuthResponseDTO fromEntity(User user, String token) {
        AuthResponseDTO dto = new AuthResponseDTO();

        dto.token = token;
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.role = user.getRole();

        return dto;
    }

    public String getToken() {
        return token;
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
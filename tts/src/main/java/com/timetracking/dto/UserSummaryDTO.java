package com.timetracking.dto;

import com.timetracking.entity.User;

public class UserSummaryDTO {

    private Long id;
    private String username;

    public static UserSummaryDTO fromEntity(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.id = user.getId();
        dto.username = user.getUsername();
        return dto;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
}

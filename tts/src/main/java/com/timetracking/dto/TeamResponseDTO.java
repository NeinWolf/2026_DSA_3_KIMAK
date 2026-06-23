package com.timetracking.dto;

import com.timetracking.entity.Team;

import java.util.List;
import java.util.stream.Collectors;

public class TeamResponseDTO {

    private Long id;
    private String name;
    private List<UserSummaryDTO> members;

    public static TeamResponseDTO fromEntity(Team team) {
        TeamResponseDTO dto = new TeamResponseDTO();
        dto.id = team.getId();
        dto.name = team.getName();
        dto.members = team.getMembers().stream()
                .map(UserSummaryDTO::fromEntity)
                .collect(Collectors.toList());
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public List<UserSummaryDTO> getMembers() { return members; }
}

package com.timetracking.dto;

import com.timetracking.entity.Project;

import java.time.LocalDate;

public class ProjectResponseDTO {

    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    public static ProjectResponseDTO fromEntity(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.id = project.getId();
        dto.name = project.getName();
        dto.description = project.getDescription();
        dto.startDate = project.getStartDate();
        dto.endDate = project.getEndDate();
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
}

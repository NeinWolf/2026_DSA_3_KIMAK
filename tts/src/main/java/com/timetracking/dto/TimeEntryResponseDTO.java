package com.timetracking.dto;

import com.timetracking.entity.TimeEntry;

import java.time.Duration;
import java.time.LocalDateTime;

public class TimeEntryResponseDTO {

    private Long id;
    private Long userId;
    private String username;
    private Long taskId;
    private String taskName;
    private Long projectId;
    private String projectName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private Long durationMinutes;
    private String description;

    public static TimeEntryResponseDTO fromEntity(TimeEntry entry) {
        TimeEntryResponseDTO dto = new TimeEntryResponseDTO();
        dto.id = entry.getId();
        dto.userId = entry.getUser().getId();
        dto.username = entry.getUser().getUsername();
        dto.taskId = entry.getTask().getId();
        dto.taskName = entry.getTask().getName();
        dto.projectId = entry.getTask().getProject().getId();
        dto.projectName = entry.getTask().getProject().getName();
        dto.startTime = entry.getStartTime();
        dto.endTime = entry.getEndTime();
        dto.isActive = entry.getIsActive();
        dto.durationMinutes = entry.getEndTime() != null
                ? Duration.between(entry.getStartTime(), entry.getEndTime()).toMinutes()
                : null;
        dto.description = entry.getDescription();
        return dto;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public Long getTaskId() { return taskId; }
    public String getTaskName() { return taskName; }
    public Long getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public Boolean getIsActive() { return isActive; }
    public Long getDurationMinutes() { return durationMinutes; }
    public String getDescription() { return description; }
}

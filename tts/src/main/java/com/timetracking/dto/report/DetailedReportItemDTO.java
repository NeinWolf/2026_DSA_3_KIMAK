package com.timetracking.dto.report;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

public class DetailedReportItemDTO {

    private Long userId;
    private String username;
    private Long taskId;
    private String taskName;
    private Long projectId;
    private String projectName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private double hours;
    private String description;

    public DetailedReportItemDTO(Long userId, String username, Long taskId, String taskName,
                                 Long projectId, String projectName, LocalDate date,
                                 LocalTime startTime, LocalTime endTime,
                                 double hours, String description) {
        this.userId = userId;
        this.username = username;
        this.taskId = taskId;
        this.taskName = taskName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hours = hours;
        this.description = description;
    }

    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public Long getTaskId() { return taskId; }
    public String getTaskName() { return taskName; }
    public Long getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public double getHours() { return hours; }
    public String getDescription() { return description; }
}

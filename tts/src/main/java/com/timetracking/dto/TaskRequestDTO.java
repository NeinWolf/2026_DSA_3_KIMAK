package com.timetracking.dto;

import com.timetracking.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class TaskRequestDTO {

    @NotNull
    private Long projectId;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private TaskStatus status;

    private Set<Long> assignedUserIds;

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Set<Long> getAssignedUserIds() {
        return assignedUserIds;
    }

    public void setAssignedUserIds(Set<Long> assignedUserIds) {
        this.assignedUserIds = assignedUserIds;
    }
}
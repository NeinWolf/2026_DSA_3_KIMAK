package com.timetracking.dto;

import com.timetracking.entity.Task;
import com.timetracking.entity.TaskStatus;
import com.timetracking.entity.User;

import java.util.List;

public class TaskResponseDTO {

    private Long id;
    private Long projectId;
    private String projectName;

    private String name;
    private String description;
    private TaskStatus status;

    private List<AssignedUserDTO> assignedUsers;

    public static TaskResponseDTO fromEntity(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();

        dto.id = task.getId();

        dto.projectId = task.getProject().getId();
        dto.projectName = task.getProject().getName();

        dto.name = task.getName();
        dto.description = task.getDescription();
        dto.status = task.getStatus();

        dto.assignedUsers = task.getAssignedUsers().stream()
                .map(AssignedUserDTO::fromEntity)
                .toList();

        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public List<AssignedUserDTO> getAssignedUsers() {
        return assignedUsers;
    }

    public static class AssignedUserDTO {

        private Long id;
        private String username;

        public static AssignedUserDTO fromEntity(User user) {
            AssignedUserDTO dto = new AssignedUserDTO();

            dto.id = user.getId();
            dto.username = user.getUsername();

            return dto;
        }

        public Long getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }
    }
}
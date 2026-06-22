package com.timetracking.service;

import com.timetracking.dto.TaskRequestDTO;
import com.timetracking.dto.TaskResponseDTO;
import com.timetracking.entity.Project;
import com.timetracking.entity.Task;
import com.timetracking.entity.User;
import com.timetracking.repository.ProjectRepository;
import com.timetracking.repository.TaskRepository;
import com.timetracking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(TaskResponseDTO::fromEntity)
                .toList();
    }

    public TaskResponseDTO getTaskById(Long id) {
        Task task = findTaskOrThrow(id);
        return TaskResponseDTO.fromEntity(task);
    }

    public List<TaskResponseDTO> getTasksByProjectId(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }

        return taskRepository.findByProjectId(projectId).stream()
                .map(TaskResponseDTO::fromEntity)
                .toList();
    }

    public TaskResponseDTO createTask(TaskRequestDTO request) {
        Project project = findProjectOrThrow(request.getProjectId());

        Task task = new Task();
        task.setProject(project);
        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setAssignedUsers(findAssignedUsers(request.getAssignedUserIds()));

        return TaskResponseDTO.fromEntity(taskRepository.save(task));
    }

    public TaskResponseDTO updateTask(Long id, TaskRequestDTO request) {
        Task task = findTaskOrThrow(id);
        Project project = findProjectOrThrow(request.getProjectId());

        task.setProject(project);
        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setAssignedUsers(findAssignedUsers(request.getAssignedUserIds()));

        return TaskResponseDTO.fromEntity(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
    }

    public TaskResponseDTO assignUserToTask(Long taskId, Long userId) {
        Task task = findTaskOrThrow(taskId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        task.getAssignedUsers().add(user);
        return TaskResponseDTO.fromEntity(taskRepository.save(task));
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private Set<User> findAssignedUsers(Set<Long> assignedUserIds) {
        if (assignedUserIds == null || assignedUserIds.isEmpty()) {
            return new HashSet<>();
        }

        List<User> users = userRepository.findAllById(assignedUserIds);

        if (users.size() != assignedUserIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more assigned users not found");
        }

        return new HashSet<>(users);
    }
}
package com.timetracking.service;

import com.timetracking.dto.TimeEntryRequestDTO;
import com.timetracking.dto.TimeEntryResponseDTO;
import com.timetracking.entity.Task;
import com.timetracking.entity.TimeEntry;
import com.timetracking.entity.User;
import com.timetracking.repository.TaskRepository;
import com.timetracking.repository.TimeEntryRepository;
import com.timetracking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public TimeEntryService(
            TimeEntryRepository timeEntryRepository,
            UserRepository userRepository,
            TaskRepository taskRepository
    ) {
        this.timeEntryRepository = timeEntryRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public List<TimeEntryResponseDTO> getAllTimeEntries() {
        return timeEntryRepository.findAll().stream()
                .map(TimeEntryResponseDTO::fromEntity)
                .toList();
    }

    public TimeEntryResponseDTO getTimeEntryById(Long id) {
        return TimeEntryResponseDTO.fromEntity(findEntryOrThrow(id));
    }

    public List<TimeEntryResponseDTO> getTimeEntriesByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return timeEntryRepository.findByUserId(userId).stream()
                .map(TimeEntryResponseDTO::fromEntity)
                .toList();
    }

    public List<TimeEntryResponseDTO> getTimeEntriesByTaskId(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        return timeEntryRepository.findByTaskId(taskId).stream()
                .map(TimeEntryResponseDTO::fromEntity)
                .toList();
    }

    public TimeEntryResponseDTO createTimeEntry(TimeEntryRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time cannot be before start time");
        }

        if (request.getEndTime() == null) {
            boolean hasActiveEntry = !timeEntryRepository.findByUserIdAndIsActiveTrue(request.getUserId()).isEmpty();
            if (hasActiveEntry) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an active time entry");
            }
        }

        TimeEntry entry = new TimeEntry();
        entry.setUser(user);
        entry.setTask(task);
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setIsActive(request.getEndTime() == null);
        entry.setDescription(request.getDescription());

        return TimeEntryResponseDTO.fromEntity(timeEntryRepository.save(entry));
    }

    public TimeEntryResponseDTO updateTimeEntry(Long id, TimeEntryRequestDTO request) {
        TimeEntry entry = findEntryOrThrow(id);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time cannot be before start time");
        }

        entry.setUser(user);
        entry.setTask(task);
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setIsActive(request.getEndTime() == null);
        entry.setDescription(request.getDescription());

        return TimeEntryResponseDTO.fromEntity(timeEntryRepository.save(entry));
    }

    public void deleteTimeEntry(Long id) {
        timeEntryRepository.delete(findEntryOrThrow(id));
    }

    private TimeEntry findEntryOrThrow(Long id) {
        return timeEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Time entry not found"));
    }
}

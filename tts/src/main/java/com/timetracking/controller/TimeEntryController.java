package com.timetracking.controller;

import com.timetracking.dto.TimeEntryRequestDTO;
import com.timetracking.dto.TimeEntryResponseDTO;
import com.timetracking.service.TimeEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-entries")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @GetMapping
    public List<TimeEntryResponseDTO> getAllTimeEntries() {
        return timeEntryService.getAllTimeEntries();
    }

    @GetMapping("/{id}")
    public TimeEntryResponseDTO getTimeEntryById(@PathVariable Long id) {
        return timeEntryService.getTimeEntryById(id);
    }

    @GetMapping("/user/{userId}")
    public List<TimeEntryResponseDTO> getTimeEntriesByUserId(@PathVariable Long userId) {
        return timeEntryService.getTimeEntriesByUserId(userId);
    }

    @GetMapping("/task/{taskId}")
    public List<TimeEntryResponseDTO> getTimeEntriesByTaskId(@PathVariable Long taskId) {
        return timeEntryService.getTimeEntriesByTaskId(taskId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimeEntryResponseDTO createTimeEntry(@Valid @RequestBody TimeEntryRequestDTO request) {
        return timeEntryService.createTimeEntry(request);
    }

    @PutMapping("/{id}")
    public TimeEntryResponseDTO updateTimeEntry(
            @PathVariable Long id,
            @Valid @RequestBody TimeEntryRequestDTO request
    ) {
        return timeEntryService.updateTimeEntry(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTimeEntry(@PathVariable Long id) {
        timeEntryService.deleteTimeEntry(id);
    }
}

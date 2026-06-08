package com.timetracking.service;

import com.timetracking.dto.report.*;
import com.timetracking.entity.*;
import com.timetracking.repository.ReportRepository;
import com.timetracking.repository.TeamRepository;
import com.timetracking.repository.TimeEntryRepository;
import com.timetracking.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TimeEntryRepository timeEntryRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public ReportService(TimeEntryRepository timeEntryRepository,
                         TeamRepository teamRepository,
                         UserRepository userRepository,
                         ReportRepository reportRepository) {
        this.timeEntryRepository = timeEntryRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
    }

    // ── Validation ──────────────────────────────────────────────────────────

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Both startDate and endDate are required");
        }
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Start date cannot be after end date");
        }
        if (java.time.temporal.ChronoUnit.DAYS.between(start, end) > 366) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Date range cannot exceed 366 days");
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** Returns completed entries whose startTime falls within [start 00:00, end 23:59:59]. */
    private List<TimeEntry> fetchEntries(LocalDate start, LocalDate end) {
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to = end.atTime(23, 59, 59);
        return timeEntryRepository.findAll().stream()
                .filter(e -> e.getEndTime() != null)
                .filter(e -> !e.getStartTime().isBefore(from) && !e.getStartTime().isAfter(to))
                .collect(Collectors.toList());
    }

    /** Hours rounded to 2 decimal places. */
    private double calcHours(TimeEntry e) {
        long minutes = Duration.between(e.getStartTime(), e.getEndTime()).toMinutes();
        return Math.round(minutes / 60.0 * 100.0) / 100.0;
    }

    private double sumHours(List<TimeEntry> entries) {
        return Math.round(entries.stream().mapToDouble(this::calcHours).sum() * 100.0) / 100.0;
    }

    /** Persists report metadata; skips silently if no users exist. */
    private void saveReport(ReportType type, LocalDate start, LocalDate end) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }
        User author = users.stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .findFirst()
                .orElse(users.get(0));

        Report report = new Report();
        report.setType(type);
        report.setDateRangeStart(start);
        report.setDateRangeEnd(end);
        report.setGeneratedAt(LocalDateTime.now());
        report.setGeneratedBy(author);
        reportRepository.save(report);
    }

    // ── Report generators ────────────────────────────────────────────────────

    @Transactional
    public ReportResponseDTO<SummaryReportItemDTO> generateSummaryReport(LocalDate start, LocalDate end) {
        validateDateRange(start, end);
        List<TimeEntry> entries = fetchEntries(start, end);

        Map<Long, List<TimeEntry>> byUser = entries.stream()
                .collect(Collectors.groupingBy(e -> e.getUser().getId()));

        List<SummaryReportItemDTO> data = byUser.entrySet().stream()
                .map(entry -> {
                    User user = entry.getValue().get(0).getUser();
                    return new SummaryReportItemDTO(
                            user.getId(),
                            user.getUsername(),
                            sumHours(entry.getValue()),
                            entry.getValue().size());
                })
                .sorted(Comparator.comparing(SummaryReportItemDTO::getUsername))
                .collect(Collectors.toList());

        saveReport(ReportType.SUMMARY, start, end);
        return new ReportResponseDTO<>(ReportType.SUMMARY, start, end, LocalDateTime.now(), data);
    }

    @Transactional
    public ReportResponseDTO<DetailedReportItemDTO> generateDetailedReport(LocalDate start, LocalDate end) {
        validateDateRange(start, end);
        List<TimeEntry> entries = fetchEntries(start, end);

        List<DetailedReportItemDTO> data = entries.stream()
                .map(e -> {
                    User user = e.getUser();
                    Task task = e.getTask();
                    Project project = task.getProject();
                    return new DetailedReportItemDTO(
                            user.getId(),
                            user.getUsername(),
                            task.getId(),
                            task.getName(),
                            project.getId(),
                            project.getName(),
                            e.getStartTime().toLocalDate(),
                            e.getStartTime().toLocalTime(),
                            e.getEndTime().toLocalTime(),
                            calcHours(e),
                            e.getDescription());
                })
                .sorted(Comparator.comparing(DetailedReportItemDTO::getDate)
                        .thenComparing(DetailedReportItemDTO::getUsername))
                .collect(Collectors.toList());

        saveReport(ReportType.DETAILED, start, end);
        return new ReportResponseDTO<>(ReportType.DETAILED, start, end, LocalDateTime.now(), data);
    }

    @Transactional
    public ReportResponseDTO<ProjectReportItemDTO> generateByProjectReport(LocalDate start, LocalDate end) {
        validateDateRange(start, end);
        List<TimeEntry> entries = fetchEntries(start, end);

        Map<Long, List<TimeEntry>> byProject = entries.stream()
                .collect(Collectors.groupingBy(e -> e.getTask().getProject().getId()));

        List<ProjectReportItemDTO> data = byProject.entrySet().stream()
                .map(entry -> {
                    Project project = entry.getValue().get(0).getTask().getProject();
                    int contributors = (int) entry.getValue().stream()
                            .map(e -> e.getUser().getId())
                            .distinct()
                            .count();
                    return new ProjectReportItemDTO(
                            project.getId(),
                            project.getName(),
                            sumHours(entry.getValue()),
                            entry.getValue().size(),
                            contributors);
                })
                .sorted(Comparator.comparing(ProjectReportItemDTO::getProjectName))
                .collect(Collectors.toList());

        saveReport(ReportType.PER_PROJECT, start, end);
        return new ReportResponseDTO<>(ReportType.PER_PROJECT, start, end, LocalDateTime.now(), data);
    }

    @Transactional
    public ReportResponseDTO<TeamReportItemDTO> generateByTeamReport(LocalDate start, LocalDate end) {
        validateDateRange(start, end);
        List<TimeEntry> entries = fetchEntries(start, end);
        List<Team> teams = teamRepository.findAll();

        List<TeamReportItemDTO> data = teams.stream()
                .map(team -> {
                    Set<Long> memberIds = team.getMembers().stream()
                            .map(User::getId)
                            .collect(Collectors.toSet());

                    List<TimeEntry> teamEntries = entries.stream()
                            .filter(e -> memberIds.contains(e.getUser().getId()))
                            .collect(Collectors.toList());

                    return new TeamReportItemDTO(
                            team.getId(),
                            team.getName(),
                            sumHours(teamEntries),
                            teamEntries.size(),
                            team.getMembers().size());
                })
                .sorted(Comparator.comparing(TeamReportItemDTO::getTeamName))
                .collect(Collectors.toList());

        saveReport(ReportType.PER_TEAM, start, end);
        return new ReportResponseDTO<>(ReportType.PER_TEAM, start, end, LocalDateTime.now(), data);
    }
}

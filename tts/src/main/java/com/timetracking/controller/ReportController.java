package com.timetracking.controller;

import com.timetracking.dto.report.*;
import com.timetracking.entity.Report;
import com.timetracking.repository.ReportRepository;
import com.timetracking.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;

    public ReportController(ReportService reportService, ReportRepository reportRepository) {
        this.reportService = reportService;
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReportResponseDTO<?>>> getAllReports() {
        List<ReportResponseDTO<?>> reports = reportRepository.findAll().stream()
                .<ReportResponseDTO<?>>map(r -> new ReportResponseDTO<>(
                        r.getType(),
                        r.getDateRangeStart(),
                        r.getDateRangeEnd(),
                        r.getGeneratedAt(),
                        List.of()))
                .toList();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportResponseDTO<SummaryReportItemDTO>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok()
                .header("X-Generated-By", "ADMIN")
                .body(reportService.generateSummaryReport(startDate, endDate));
    }

    @GetMapping("/detailed")
    public ResponseEntity<ReportResponseDTO<DetailedReportItemDTO>> getDetailed(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok()
                .header("X-Generated-By", "ADMIN")
                .body(reportService.generateDetailedReport(startDate, endDate));
    }

    @GetMapping("/by-project")
    public ResponseEntity<ReportResponseDTO<ProjectReportItemDTO>> getByProject(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok()
                .header("X-Generated-By", "ADMIN")
                .body(reportService.generateByProjectReport(startDate, endDate));
    }

    @GetMapping("/by-team")
    public ResponseEntity<ReportResponseDTO<TeamReportItemDTO>> getByTeam(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok()
                .header("X-Generated-By", "ADMIN")
                .body(reportService.generateByTeamReport(startDate, endDate));
    }
}

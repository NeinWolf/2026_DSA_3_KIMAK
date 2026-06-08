package com.timetracking.dto.report;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.timetracking.entity.ReportType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ReportResponseDTO<T> {

    private ReportType type;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime generatedAt;

    private List<T> data;

    public ReportResponseDTO(ReportType type, LocalDate startDate, LocalDate endDate,
                             LocalDateTime generatedAt, List<T> data) {
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.generatedAt = generatedAt;
        this.data = data;
    }

    public ReportType getType() { return type; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public List<T> getData() { return data; }
}

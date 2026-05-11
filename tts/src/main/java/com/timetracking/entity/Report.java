package com.timetracking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stores metadata about a generated report, including its type, requested
 * date range, and the admin who triggered its generation.
 */
@Getter
@Setter
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportType type;

    @Column(name = "start_date")
    private LocalDate dateRangeStart;

    @Column(name = "end_date")
    private LocalDate dateRangeEnd;

    @NotNull
    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;
}
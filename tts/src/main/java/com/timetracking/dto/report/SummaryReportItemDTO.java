package com.timetracking.dto.report;

public class SummaryReportItemDTO {

    private Long userId;
    private String username;
    private double totalHours;
    private int totalEntries;

    public SummaryReportItemDTO(Long userId, String username, double totalHours, int totalEntries) {
        this.userId = userId;
        this.username = username;
        this.totalHours = totalHours;
        this.totalEntries = totalEntries;
    }

    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public double getTotalHours() { return totalHours; }
    public int getTotalEntries() { return totalEntries; }
}

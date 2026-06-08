package com.timetracking.dto.report;

public class TeamReportItemDTO {

    private Long teamId;
    private String teamName;
    private double totalHours;
    private int totalEntries;
    private int memberCount;

    public TeamReportItemDTO(Long teamId, String teamName, double totalHours,
                             int totalEntries, int memberCount) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.totalHours = totalHours;
        this.totalEntries = totalEntries;
        this.memberCount = memberCount;
    }

    public Long getTeamId() { return teamId; }
    public String getTeamName() { return teamName; }
    public double getTotalHours() { return totalHours; }
    public int getTotalEntries() { return totalEntries; }
    public int getMemberCount() { return memberCount; }
}

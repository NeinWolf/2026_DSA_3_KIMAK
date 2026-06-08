package com.timetracking.dto.report;

public class ProjectReportItemDTO {

    private Long projectId;
    private String projectName;
    private double totalHours;
    private int totalEntries;
    private int contributorCount;

    public ProjectReportItemDTO(Long projectId, String projectName, double totalHours,
                                int totalEntries, int contributorCount) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalHours = totalHours;
        this.totalEntries = totalEntries;
        this.contributorCount = contributorCount;
    }

    public Long getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public double getTotalHours() { return totalHours; }
    public int getTotalEntries() { return totalEntries; }
    public int getContributorCount() { return contributorCount; }
}

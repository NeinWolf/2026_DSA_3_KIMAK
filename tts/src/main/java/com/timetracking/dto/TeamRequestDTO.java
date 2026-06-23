package com.timetracking.dto;

import jakarta.validation.constraints.NotBlank;

public class TeamRequestDTO {

    @NotBlank
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

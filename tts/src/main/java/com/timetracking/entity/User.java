package com.timetracking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents an application user — either an ADMIN managing the system
 * or an EMPLOYEE who logs time against tasks.
 */
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** Inverse side of Team.members — prevents circular serialization. */
    @ManyToMany(mappedBy = "members")
    @JsonIgnore
    private Set<Team> teams = new HashSet<>();

    /** Inverse side of Task.assignedUsers — prevents circular serialization. */
    @ManyToMany(mappedBy = "assignedUsers")
    @JsonIgnore
    private Set<Task> assignedTasks = new HashSet<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<TimeEntry> timeEntries = new ArrayList<>();
}
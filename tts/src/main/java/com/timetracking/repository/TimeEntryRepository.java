package com.timetracking.repository;

import com.timetracking.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByUserIdAndDate(Long userId, LocalDate date);

    List<TimeEntry> findByTaskId(Long taskId);
}
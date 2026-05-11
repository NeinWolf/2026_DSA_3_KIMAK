package com.timetracking.repository;

import com.timetracking.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByUserIdAndStartTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<TimeEntry> findByTaskId(Long taskId);
}
package com.timetracking.service;

import com.timetracking.dto.TeamRequestDTO;
import com.timetracking.dto.TeamResponseDTO;
import com.timetracking.entity.Team;
import com.timetracking.entity.User;
import com.timetracking.repository.TeamRepository;
import com.timetracking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    public List<TeamResponseDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(TeamResponseDTO::fromEntity)
                .toList();
    }

    public TeamResponseDTO getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        return TeamResponseDTO.fromEntity(team);
    }

    public TeamResponseDTO createTeam(TeamRequestDTO request) {
        Team team = new Team();
        team.setName(request.getName());
        return TeamResponseDTO.fromEntity(teamRepository.save(team));
    }

    public TeamResponseDTO updateTeam(Long id, TeamRequestDTO request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        team.setName(request.getName());
        return TeamResponseDTO.fromEntity(teamRepository.save(team));
    }

    public void deleteTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        teamRepository.delete(team);
    }

    public TeamResponseDTO addMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (team.getMembers().contains(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this team");
        }
        team.getMembers().add(user);
        return TeamResponseDTO.fromEntity(teamRepository.save(team));
    }

    public TeamResponseDTO removeMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!team.getMembers().contains(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a member of this team");
        }
        team.getMembers().remove(user);
        return TeamResponseDTO.fromEntity(teamRepository.save(team));
    }
}

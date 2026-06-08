package com.timetracking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    void generateToken_ShouldCreateValidTokenWithCorrectSubject() {
        // Arrange
        String username = "developer_zombi";

        // Act
        String token = jwtService.generateToken(username);

        // Assert
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals(username, jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenTokenIsMalformed() {
        // Arrange
        String malformedToken = "invalid.token.payloadhere";

        // Act
        boolean isValid = jwtService.isTokenValid(malformedToken);

        // Assert
        assertFalse(isValid);
    }
}
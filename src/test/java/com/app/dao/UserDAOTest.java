/**
 * 
 */
package com.app.dao;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.app.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import static org.mockito.Mockito.*;

public class UserDAOTest {

    @Mock
    private Connection mockConnection;
    @Mock
    private PreparedStatement mockPreparedStatement;
    @Mock
    private ResultSet mockResultSet;

    private UserDAO userDAO;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        userDAO = new UserDAO();
        userDAO.setConnection(mockConnection);
    }

    @Test
    public void testAddUser() throws Exception {
        when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
        when(mockPreparedStatement.executeUpdate()).thenReturn(1);

        User user = new User("John", "Doe","johndoe", "password123", "john.doe@example.com");
        boolean result = userDAO.registerUser(user);

        assertTrue(result);
        verify(mockPreparedStatement).setString(1, "johndoe");
        verify(mockPreparedStatement).setString(2, "password123");
        verify(mockPreparedStatement).setString(3, "john.doe@example.com");
        verify(mockPreparedStatement).setString(4, "John");
        verify(mockPreparedStatement).setString(5, "Doe");
        verify(mockPreparedStatement).executeUpdate();
    }

    @Test
    public void testGetUserByUsername() throws Exception {
        when(mockConnection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
        when(mockPreparedStatement.executeQuery()).thenReturn(mockResultSet);
        when(mockResultSet.next()).thenReturn(true);
        when(mockResultSet.getString("username")).thenReturn("johndoe");
        when(mockResultSet.getString("password")).thenReturn("password123");
        when(mockResultSet.getString("email")).thenReturn("john.doe@example.com");
        when(mockResultSet.getString("first_name")).thenReturn("John");
        when(mockResultSet.getString("last_name")).thenReturn("Doe");

        User user = userDAO.getUserByUsername("john_doe");

        assertNotNull(user);
        assertEquals("johndoe", user.getUsername());
        assertEquals("password123", user.getPassword());
        assertEquals("john.doe@example.com", user.getEmail());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
    }
}


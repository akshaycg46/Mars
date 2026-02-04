/**
 * 
 */
package com.app.servlet;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.app.dao.UserDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import static org.mockito.Mockito.*;

public class LoginServletTest {

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private HttpSession session;
    @Mock
    private UserDAO userDAO;

    private LoginServlet loginServlet;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        loginServlet = new LoginServlet();
        userDAO = new UserDAO();
        when(request.getSession()).thenReturn(session);
    }

    @Test
    public void testSuccessfulLogin() throws Exception {
        when(request.getParameter("username")).thenReturn("johndoe");
        when(request.getParameter("password")).thenReturn("password123");
        when(userDAO.validateUser("johndoe", "password123")).thenReturn(true);

        loginServlet.doPost(request, response);

        verify(session).setAttribute("username", "johndoe");
        verify(response).sendRedirect("index.jsp");
    }

    @Test
    public void testFailedLogin() throws Exception {
        when(request.getParameter("username")).thenReturn("john_doe");
        when(request.getParameter("password")).thenReturn("wrongpassword");
        when(userDAO.validateUser("john_doe", "wrongpassword")).thenReturn(false);

        loginServlet.doPost(request, response);

        verify(request).setAttribute("errorMessage", "Invalid username or password");
        verify(request.getRequestDispatcher("login.jsp")).forward(request, response);
    }
}

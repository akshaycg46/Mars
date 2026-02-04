package com.app.servlet;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.app.dao.UserDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Login Servlet Handles user authentication requests.
 */
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
	/**
	 *
	 */
	private static final long serialVersionUID = 1L;
	private static final Logger logger = Logger.getLogger(LoginServlet.class.getName());

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String username = request.getParameter("username");
		String password = request.getParameter("password");

		logger.log(Level.INFO, " username: {0} password: {1} " + username, password);

		UserDAO userDAO = new UserDAO();
		boolean isValidUser = userDAO.validateUser(username, password);
		logger.log(Level.INFO, "Check if the user is valid");
		if (isValidUser) {
			request.getSession().setAttribute("user", username);
			response.sendRedirect("marslanding.jsp");
		} else {
			request.setAttribute("errorMessage", "Invalid credentials");
			request.getRequestDispatcher("login.jsp").forward(request, response);
		}
	}
	
}

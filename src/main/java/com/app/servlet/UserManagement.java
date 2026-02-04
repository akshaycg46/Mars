package com.app.servlet;

import java.io.IOException;

import com.app.dao.UserDAO;
import com.app.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/register")
public class UserManagement extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private UserDAO userDao;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public UserManagement() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String firstName = request.getParameter("firstName");
		String lastName = request.getParameter("lastName");
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		String email = request.getParameter("email");
		String interestReason = request.getParameter("interestReason");

		User newUser = new User(firstName, lastName, username, password, email, interestReason);
		userDao = new UserDAO();
		if (userDao.registerUser(newUser)) {
			response.sendRedirect("login.jsp");
		} else {
			request.setAttribute("error", "Registration failed. Username/Email already exists.");
			request.getRequestDispatcher("register.jsp").forward(request, response);
		}

	}

}

package com.app.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import com.app.database.DatabaseConnection;
import com.app.model.User;

/**
 * User Data Access Object (DAO) Class Implements DAO pattern to manage user
 * records.
 */
public class UserDAO {
	private static final Logger logger = Logger.getLogger(UserDAO.class.getName());

	private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";
	private static final Pattern emailPattern = Pattern.compile(EMAIL_REGEX);

	public static Pattern getEmailPattern() {
		return emailPattern;
	}

	public boolean registerUser(User user) {
		if (!isValidEmail(user.getEmail())) {
			logger.log(Level.WARNING, "Invalid email format: {0}", user.getEmail());
			return false;
		}

		String query = "INSERT INTO users (first_name, last_name, username, password, email, interest_reason) VALUES (?, ?, ?, ?, ?, ?)";
		try (Connection conn = DatabaseConnection.getInstance().getConnection();
				PreparedStatement stmt = conn.prepareStatement(query)) {
			stmt.setString(1, user.getFirstName());
			stmt.setString(2, user.getLastName());
			stmt.setString(3, user.getUsername());
			stmt.setString(4, user.getPassword());
			stmt.setString(5, user.getEmail());
			stmt.setString(6, user.getInterestReason());
			return stmt.executeUpdate() > 0;
		} catch (SQLException e) {
			logger.log(Level.SEVERE, "Error registering user", e);
			return false;
		}
	}

	public boolean validateUser(String username, String password) {
		String query = "SELECT * FROM users WHERE username = ? AND password = ?";
		try (Connection conn = DatabaseConnection.getInstance().getConnection();
				PreparedStatement stmt = conn.prepareStatement(query)) {
			stmt.setString(1, username);
			stmt.setString(2, password);
			ResultSet rs = stmt.executeQuery();
			return rs.next();
		} catch (SQLException e) {
			logger.log(Level.SEVERE, "Error validating user", e);
			return false;
		}
	}

	private boolean isValidEmail(String email) {
		return emailPattern.matcher(email).matches();
	}

	public void setConnection(Connection mockConnection) {
		try {
			mockConnection = DatabaseConnection.getInstance().getConnection();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

	public User getUserByUsername(String username) {
		User user = null;
		String query = "SELECT * FROM users WHERE username = ? ";
		try (Connection conn = DatabaseConnection.getInstance().getConnection();
				PreparedStatement stmt = conn.prepareStatement(query)) {
			stmt.setString(1, username);
			ResultSet rs = stmt.executeQuery();
			if( rs.next() ) {
				return new User(rs.getString("first_name"),rs.getString("last_name"),rs.getString("username"),rs.getString("password"),rs.getString("email"));
			}
		} catch (SQLException e) {
			logger.log(Level.SEVERE, "Error getting user", e);
			return null;
		}
		return user;
	}
}
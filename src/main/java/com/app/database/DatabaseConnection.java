package com.app.database;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Singleton Database Connection Class Demonstrates Singleton Pattern for
 * managing database connections.
 */
public class DatabaseConnection {
	private static DatabaseConnection instance;
	private Connection connection;
	private static final Logger logger = Logger.getLogger(DatabaseConnection.class.getName());
	private static final String PROPERTIES_FILE = "dbconfig.properties";

	private DatabaseConnection() {
		try {
			Properties properties = new Properties();
			try (InputStream input = getClass().getClassLoader().getResourceAsStream(PROPERTIES_FILE)) {
				if (input == null) {
					logger.log(Level.SEVERE, "Unable to find dbconfig.properties");
					return;
				}
				properties.load(input);
			}

			String url = properties.getProperty("db.url");
			String user = properties.getProperty("db.user");
			String password = properties.getProperty("db.password");

			Class.forName("com.mysql.cj.jdbc.Driver");
			this.connection = DriverManager.getConnection(url, user, password);
		} catch (ClassNotFoundException | SQLException | IOException e) {
			logger.log(Level.SEVERE, "Database connection error", e);
		}
	}

	public static synchronized DatabaseConnection getInstance() throws SQLException {
		if (instance == null || instance.getConnection().isClosed()) {
			instance = new DatabaseConnection();
		}
		return instance;
	}

	public Connection getConnection() {
		return connection;
	}
}
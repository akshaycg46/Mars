package com.app.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Common {

	private static final Logger logger = Logger.getLogger(Common.class.getName());
	private static final Properties properties = new Properties();

	static {
		try (InputStream input = Common.class.getClassLoader().getResourceAsStream("dbconfig.properties")) {
			if (input == null) {
				logger.log(Level.SEVERE, "Unable to find dbconfig.properties");
			} else {
				properties.load(input);
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	public static String getProperty(String key) {
		return properties.getProperty(key);
	}
}

package com.app.model;

import org.junit.Test;
import static org.junit.Assert.*;

public class UserTest {

	@Test
	public void testUserCreation() {
		User user = new User("John", "Doe", "johndoe", "password123", "john.doe@example.com");

		assertEquals("johndoe", user.getUsername());
		assertEquals("password123", user.getPassword());
		assertEquals("john.doe@example.com", user.getEmail());
		assertEquals("John", user.getFirstName());
		assertEquals("Doe", user.getLastName());
	}

	@Test
	public void testUserEquality() {
		User user1 = new User("John", "Doe", "johndoe", "password123", "john.doe@example.com");
		User user2 = new User("John", "Doe", "johndoe", "password123", "john.doe@example.com");
		User user3 = new User("Jane", "Doe", "janedoe", "password456", "jane.doe@example.com");

		assertEquals(user1, user2);
		assertNotEquals(user1, user3);
	}
}

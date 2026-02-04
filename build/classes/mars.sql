-- Create the mars database
CREATE DATABASE IF NOT EXISTS mars;

-- Use the mars database
USE mars;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    interest_reason TEXT
);

-- Insert sample records
INSERT INTO users (first_name, last_name, username, password, email, interest_reason) VALUES
('John', 'Doe', 'johndoe', 'password123', 'john.doe@example.com', 'Fascinated by the potential for Mars colonization'),
('Jane', 'Smith', 'janesmith', 'securepass', 'jane.smith@example.com', 'Interested in Martian geology'),
('Alice', 'Johnson', 'alicej', 'pass1234', 'alice.j@example.com', 'Curious about the search for life on Mars'),
('Bob', 'Williams', 'bobw', 'bobpass', 'bob.williams@example.com', 'Excited about space technology advancements'),
('Emily', 'Brown', 'emilyb', 'brownpass', 'emily.brown@example.com', 'Passionate about space exploration');

-- Verify the data
SELECT * FROM users;

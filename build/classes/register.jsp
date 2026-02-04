<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<jsp:include page="header.jsp" />
<body>
    <div class="form-container">
        <h2>Mars Colony Registration</h2>
        <form action="register" method="POST" onsubmit="return validateForm()">
            <div class="form-group">
                <label>First Name:</label>
                <input type="text" name="firstName" required>
            </div>
            <div class="form-group">
                <label>Last Name:</label>
                <input type="text" name="lastName" required>
            </div>
            <div class="form-group">
                <label>Username:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" name="password" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Interest Reason:</label>
                <textarea name="interestReason" rows="4" required></textarea>
            </div>
            <div class="button-group">
                <button type="reset">Cancel</button>
                <button type="submit">Register</button>
            </div>
        </form>
    </div>
<jsp:include page="footer.jsp" />

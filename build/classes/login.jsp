<!DOCTYPE html>
<html lang="en">
<jsp:include page="header.jsp" />
<body>
	<div class="form-container">

		<h2>Login to Mars Rover Image Lookup Application</h2>
		<%
		if (request.getAttribute("errorMessage") != null) {
		%>
		<p style="color: red;"><%=request.getAttribute("errorMessage")%></p>
		<%
		}
		%>
		<form action="login" method="post">
			<div class="form-group">
				<input type="text" name="username" placeholder="Username" required>
			</div>
			<div class="form-group">
				<input type="password" name="password" placeholder="Password"
					required>
			</div>
			<div class="button-group">
				<input type="submit" value="Login">
			</div>
		</form>
	</div>
	<jsp:include page="footer.jsp" />
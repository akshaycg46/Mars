<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<header>
	<img
		src="https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04470/opgs/edr/ncam/NLB_794309633EDR_F1132670CCAM05468M_.JPG"
		alt="Mars Curiosity Rover"
		style="width: 100%; max-height: 200px; object-fit: cover;">
	<h1>Jigyasa</h1>
	<nav>
		<ul class="nav-menu">
			<li><a href="index.jsp">Home</a></li>
			<c:choose>
				<c:when test="${not empty sessionScope.user}">
					<li class="welcome-message">Welcome, <span class="username">${sessionScope.user}</span>!
					</li>
					<li><a href="logout" class="logout-btn">Logout</a></li>
				</c:when>
				<c:otherwise>
					<li><a href="register.jsp">Register</a></li>
					<li><a href="login.jsp">Login</a></li>
				</c:otherwise>
			</c:choose>
		</ul>
	</nav>
</header>

<style>
.welcome-message {
	color: #2c3e50;
	font-weight: 500;
	margin-right: 15px;
}

.username {
	color: #e74c3c;
	font-weight: 600;
}

header {
	position: relative;
	text-align: center;
	color: white;
}

header h1 {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(0, 0, 0, 0.5);
	padding: 10px;
}

.nav-menu {
	list-style-type: none;
	margin: 0;
	padding: 0;
	overflow: hidden;
	background-color: #333;
	display: flex;
	justify-content: center;
}

.nav-menu li {
	float: left;
}

.nav-menu li a {
	display: block;
	color: white;
	text-align: center;
	padding: 14px 16px;
	text-decoration: none;
}

.nav-menu li a:hover {
	background-color: #111;
}

.welcome-message {
	color: red;
	padding: 14px 16px;
}

.username {
	font-weight: bold;
}

.logout-btn {
	color: #ff9999;
}

.form-container {
	max-width: 500px;
	margin: 20px auto;
	padding: 20px;
	border: 1px solid #ddd;
}

.form-group {
	margin-bottom: 15px;
}

label {
	display: block;
	margin-bottom: 5px;
}

input[type="text"], input[type="password"], textarea {
	width: 100%;
	padding: 8px;
}

.button-group {
	margin-top: 20px;
	text-align: right;
}

body {
	font-family: Arial, sans-serif;
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
}

h1 {
	color: #c1440e;
}

img {
	max-width: 100%;
	height: auto;
	margin: 20px 0;
}

.result {
	background-color: #f0f0f0;
	padding: 20px;
	border-radius: 5px;
}

.thanks {
	font-style: italic;
	margin-top: 20px;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	padding: 20px;
}

.grid-item {
	position: relative;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.rover-image {
	width: 100%;
	height: 250px;
	object-fit: cover;
	transition: transform 0.3s ease;
}

.rover-image:hover {
	transform: scale(1.05);
}

.image-info {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 8px;
	font-size: 0.9em;
}

.no-images, .error {
	text-align: center;
	padding: 20px;
	color: #c1440e;
}
</style>

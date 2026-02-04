<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.time.LocalDate" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script>
    $(function() {
        $("#datepicker").datepicker({ dateFormat: 'yy-mm-dd' });
    });
    </script>
</head>
<jsp:include page="header.jsp" />
<body>
    <h1>Mars Landing Date Selector</h1>
    
    <form method="post" action="fetchData">
        <label for="datepicker">Select date:</label>
        <input type="text" id="datepicker" name="landingDate" required>
        <input type="submit" value="Submit">
    </form>

    <%
    String landingDate = request.getParameter("landingDate");
    if (landingDate != null && !landingDate.isEmpty()) {
        %>
        <div class="result">
            <h2>Your Mars Images</h2>
            <p>Selected date: <%= landingDate %></p>
           
            <p class="thanks">Thank you to NASA for providing images and data from the Mars exploration missions.</p>
        </div>
        <%
    }
    %>
    
    
<%@ page import="org.json.JSONArray, org.json.JSONObject" %>


<div class="image-grid">
<%
String jsonResponse = (String) request.getAttribute("apiResponse");

try {
    JSONObject json = new JSONObject(jsonResponse);
    JSONArray photos = json.getJSONArray("photos");
    
    if(photos.length() > 0) {
        for(int i=0; i<photos.length(); i++) {
            JSONObject photo = photos.getJSONObject(i);
            String imgSrc = photo.getString("img_src");
%>
            <div class="grid-item">
                <img src="<%= imgSrc %>" 
                     alt="Mars Rover Image <%= i+1 %>"
                     class="rover-image"
                     loading="lazy">
                <div class="image-info">
                    <span><%= photo.getString("earth_date") %></span>
                </div>
            </div>
<%
        }
    } else {
%>
        <p class="no-images">No images available for selected date</p>
<%
    }
} catch(Exception e) {
%>
    <p class="error">Error loading Mars images: <%= e.getMessage() %></p>
<%
}
%>
</div>

<style>
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
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
    background: rgba(0,0,0,0.7);
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
    
<jsp:include page="footer.jsp" />

package com.app.servlet;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONObject;

import com.app.util.Common;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/fetchData")
public class FetchDataServlet extends HttpServlet {

	private static final Logger logger = Logger.getLogger(FetchDataServlet.class.getName());

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String selectedDate = request.getParameter("landingDate");
		String api_key = Common.getProperty("api.key");
		String apiUrl = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=" + selectedDate
				+ "&api_key=" + api_key;

		HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
		conn.setRequestMethod("GET");

		StringBuilder jsonResponse;
		logger.log(Level.INFO, "Parse json response");
		try (Scanner scanner = new Scanner(conn.getInputStream())) {
			jsonResponse = new StringBuilder();
			while (scanner.hasNext()) {
				jsonResponse.append(scanner.nextLine());
			}
		}

		JSONObject json = new JSONObject(jsonResponse.toString());
		request.setAttribute("apiResponse", json.toString());
		request.getRequestDispatcher("marslanding.jsp").forward(request, response);
	}
}

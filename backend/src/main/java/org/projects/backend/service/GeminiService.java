package org.projects.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.projects.backend.model.ATSResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * A service to interact with the Google Gemini API for advanced text analysis.
 */
@Service
public class GeminiService {

    // Injects the API key from application.properties
    @Value("${gemini.api.key}")
    private String apiKey;

    // Injects the API URL from application.properties
    @Value("${gemini.api.url}")
    private String apiUrl;

    /**
     * Analyzes a resume against a job description using the Gemini API.
     *
     * @param resumeText The text content of the resume.
     * @param jobDescription The text content of the job description.
     * @return An ATSResult object containing the detailed analysis.
     * @throws IOException If the API call fails.
     * @throws InterruptedException If the API call is interrupted.
     */
    public ATSResult getAnalysis(String resumeText, String jobDescription) throws IOException, InterruptedException {
        // 1. Create the prompt for the language model
        String prompt = createPrompt(resumeText, jobDescription);

        // 2. Build the JSON payload for the Gemini API request
        JSONObject payload = new JSONObject();
        JSONArray contents = new JSONArray();
        JSONObject partsContainer = new JSONObject();
        JSONArray parts = new JSONArray();
        JSONObject textPart = new JSONObject();

        textPart.put("text", prompt);
        parts.put(textPart);
        partsContainer.put("parts", parts);
        contents.put(partsContainer);
        payload.put("contents", contents);

        // Add generationConfig to ask for a JSON response
        JSONObject generationConfig = new JSONObject();
        generationConfig.put("responseMimeType", "application/json");
        payload.put("generationConfig", generationConfig);


        // 3. Make the HTTP request to the Gemini API
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Failed to call Gemini API. Status: " + response.statusCode() + " Body: " + response.body());
        }

        // 4. Parse the JSON response from the API
        return parseApiResponse(response.body());
    }

    /**
     * Creates the detailed prompt to send to the Gemini model.
     * This prompt instructs the model to act as an ATS and return a specific JSON structure.
     */
    private String createPrompt(String resumeText, String jobDescription) {
        return "You are an advanced Applicant Tracking System (ATS). Your task is to analyze the provided resume against the job description. " +
                "Provide a detailed analysis in a strict JSON format. The JSON object must have the following keys: " +
                "'score' (an integer from 0 to 100 representing the match percentage), " +
                "'matchingKeywords' (a JSON array of strings), " +
                "'missingKeywords' (a JSON array of strings with the top 5-7 most important missing skills or keywords), and " +
                "'suggestions' (a string containing actionable advice for the applicant to improve their resume for this specific job). " +
                "Do not include any text outside of the JSON object.\n\n" +
                "--- JOB DESCRIPTION ---\n" + jobDescription + "\n\n" +
                "--- RESUME TEXT ---\n" + resumeText;
    }

    /**
     * Parses the raw JSON string from the Gemini API into an ATSResult object.
     */
    private ATSResult parseApiResponse(String responseBody) {
        JSONObject responseJson = new JSONObject(responseBody);

        // Navigate through the Gemini API's response structure to get the content
        String contentText = responseJson.getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text");

        // The actual analysis is in the 'text' field, which is a JSON string itself
        JSONObject analysisJson = new JSONObject(contentText);

        ATSResult result = new ATSResult();
        result.setScore(analysisJson.getInt("score"));
        result.setSuggestions(analysisJson.getString("suggestions"));
        result.setRawResponse(responseBody); // Save the full response for debugging

        // Convert JSONArrays to List<String>
        List<String> matching = new ArrayList<>();
        JSONArray matchingArray = analysisJson.getJSONArray("matchingKeywords");
        for (int i = 0; i < matchingArray.length(); i++) {
            matching.add(matchingArray.getString(i));
        }
        result.setMatchingKeywords(matching);

        List<String> missing = new ArrayList<>();
        JSONArray missingArray = analysisJson.getJSONArray("missingKeywords");
        for (int i = 0; i < missingArray.length(); i++) {
            missing.add(missingArray.getString(i));
        }
        result.setMissingKeywords(missing);

        return result;
    }
}

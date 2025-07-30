package org.projects.backend.model;

import java.util.List;

/**
 * Represents the result of an ATS analysis.
 * This model is updated to hold the richer data provided by the Gemini API.
 */
public class ATSResult {

    private int score;
    private List<String> matchingKeywords;
    private List<String> missingKeywords;
    private String suggestions;
    private String rawResponse; // To store the full response for debugging or future use

    public ATSResult() {
    }

    public ATSResult(int score, List<String> matchingKeywords, List<String> missingKeywords, String suggestions) {
        this.score = score;
        this.matchingKeywords = matchingKeywords;
        this.missingKeywords = missingKeywords;
        this.suggestions = suggestions;
    }

    // --- Getters and Setters ---

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public List<String> getMatchingKeywords() {
        return matchingKeywords;
    }

    public void setMatchingKeywords(List<String> matchingKeywords) {
        this.matchingKeywords = matchingKeywords;
    }

    public List<String> getMissingKeywords() {
        return missingKeywords;
    }

    public void setMissingKeywords(List<String> missingKeywords) {
        this.missingKeywords = missingKeywords;
    }

    public String getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(String suggestions) {
        this.suggestions = suggestions;
    }

    public String getRawResponse() {
        return rawResponse;
    }

    public void setRawResponse(String rawResponse) {
        this.rawResponse = rawResponse;
    }
}

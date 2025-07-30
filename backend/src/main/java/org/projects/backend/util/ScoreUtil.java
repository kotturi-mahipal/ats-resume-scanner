package org.projects.backend.util;

import java.util.*;

public class ScoreUtil {
    public static double calculateSimilarity(String text1, String text2) {
        Map<String, Integer> freq1 = getTermFrequencies(text1);
        Map<String, Integer> freq2 = getTermFrequencies(text2);

        Set<String> allTerms = new HashSet<>(freq1.keySet());
        allTerms.addAll(freq2.keySet());

        List<Integer> vec1 = new ArrayList<>();
        List<Integer> vec2 = new ArrayList<>();

        for (String term : allTerms) {
            vec1.add(freq1.getOrDefault(term, 0));
            vec2.add(freq2.getOrDefault(term, 0));
        }

        return cosineSimilarity(vec1, vec2);
    }

    private static Map<String, Integer> getTermFrequencies(String text) {
        Map<String, Integer> freqs = new HashMap<>();
        String[] words = text.toLowerCase().split("\\W+");
        for (String word : words) {
            if (word.length() > 2) freqs.put(word, freqs.getOrDefault(word, 0) + 1);
        }
        return freqs;
    }

    private static double cosineSimilarity(List<Integer> vec1, List<Integer> vec2) {
        int dot = 0, mag1 = 0, mag2 = 0;
        for (int i = 0; i < vec1.size(); i++) {
            int v1 = vec1.get(i);
            int v2 = vec2.get(i);
            dot += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        }
        return (mag1 == 0 || mag2 == 0) ? 0 : dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
    }
}

package org.projects.backend.service;

import org.projects.backend.model.ATSResult;
import org.projects.backend.util.ParseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service class to handle the core logic of resume processing.
 * This class is now refactored to use the GeminiService for analysis.
 */
@Service
public class ResumeService {

    private final GeminiService geminiService;

    @Autowired
    public ResumeService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Calculates the ATS score by parsing the resume and calling the analysis service.
     *
     * @param resumeFile     The resume file uploaded by the user.
     * @param jobDescription The job description pasted by the user.
     * @return An ATSResult object containing the score and keyword analysis.
     * @throws IOException If there is an error parsing the file or calling the API.
     */
    public ATSResult analyzeResume(MultipartFile resumeFile, String jobDescription) throws IOException {
        // Step 1: Parse the resume PDF to extract text.
        String resumeText = ParseUtil.parsePdf(resumeFile);

        // Step 2: Call the GeminiService to get a sophisticated analysis.
        // The old ScoreUtil is no longer needed.
        try {
            return geminiService.getAnalysis(resumeText, jobDescription);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Analysis service was interrupted", e);
        }
    }
}

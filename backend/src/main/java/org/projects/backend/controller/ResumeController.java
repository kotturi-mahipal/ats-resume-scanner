package org.projects.backend.controller;

import org.projects.backend.model.ATSResult;
import org.projects.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Adjust for your frontend URL
public class ResumeController {

    private final ResumeService resumeService;

    @Autowired
    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ATSResult> uploadAndAnalyze(
            @RequestParam("resume") MultipartFile resumeFile,
            @RequestParam("jobDescription") String jobDescription) {
        try {
            if (resumeFile.isEmpty() || jobDescription.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            // The method name is updated for clarity
            ATSResult result = resumeService.analyzeResume(resumeFile, jobDescription);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

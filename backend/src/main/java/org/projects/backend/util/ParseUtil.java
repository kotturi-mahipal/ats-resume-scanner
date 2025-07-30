package org.projects.backend.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Utility class for parsing resume files.
 */
public class ParseUtil {

    /**
     * Parses a PDF file and extracts the text content.
     *
     * @param file The PDF file as a MultipartFile.
     * @return The extracted text from the PDF.
     * @throws IOException If an error occurs during file reading or parsing.
     */
    public static String parsePdf(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to parse empty file.");
        }

        try (PDDocument document = PDDocument.load(file.getBytes())) {
            PDFTextStripper textStripper = new PDFTextStripper();

            // *** IMPROVEMENT ***
            // This tells PDFBox to sort the text by its position on the page.
            // It's crucial for resumes with columns or complex layouts to ensure
            // the text is extracted in a logical reading order.
            textStripper.setSortByPosition(true);

            return textStripper.getText(document);
        }
    }
}

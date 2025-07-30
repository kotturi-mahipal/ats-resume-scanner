package org.projects.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global Web Configuration for the application.
 * This class provides a central place for web-related beans and configurations,
 * including a robust, application-wide CORS policy.
 */
@Configuration
public class WebConfig {

    /**
     * Defines the global CORS configuration for the application.
     * This is the recommended approach over per-controller @CrossOrigin annotations
     * as it's more powerful and centrally managed.
     *
     * @return WebMvcConfigurer bean with CORS settings.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // This configuration applies to all endpoints under /api/
                registry.addMapping("/api/**")
                        // Allows requests from your Vite development server (and any other origin).
                        // For production, you would restrict this to your actual domain.
                        .allowedOrigins("*")
                        // Specifies the allowed HTTP methods.
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        // Specifies the allowed request headers.
                        .allowedHeaders("*")
                        // Allows credentials (like cookies, authorization headers) to be sent.
                        .allowCredentials(false);
            }
        };
    }
}

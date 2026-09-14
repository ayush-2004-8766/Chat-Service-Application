package com.example.Chat_Application.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 'uploads/' folder ko public static resource bana diya
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
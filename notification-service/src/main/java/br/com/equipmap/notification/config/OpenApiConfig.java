package br.com.equipmap.notification.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI notificationOpenApi() {
        return new OpenAPI().info(new Info()
                .title("EquipMap Notification Service API")
                .version("0.1.0")
                .description("Endpoints for user notifications and event-driven alerts."));
    }
}

package br.com.equipmap.maintenance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI maintenanceOpenApi() {
        return new OpenAPI().info(new Info().title("EquipMap Maintenance Service").version("0.1.0").description("Maintenance CRUD, completion and scheduled overdue event APIs."));
    }
}

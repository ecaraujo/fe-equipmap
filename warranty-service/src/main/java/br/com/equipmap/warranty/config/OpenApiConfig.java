package br.com.equipmap.warranty.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI warrantyOpenApi() {
        return new OpenAPI().info(new Info()
                .title("EquipMap Warranty Service API")
                .version("0.1.0")
                .description("CRUD, document upload references and warranty expiration events."));
    }
}

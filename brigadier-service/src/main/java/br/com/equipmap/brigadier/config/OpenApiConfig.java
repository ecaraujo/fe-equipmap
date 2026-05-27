package br.com.equipmap.brigadier.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI brigadierOpenApi() {
        return new OpenAPI().info(new Info()
                .title("EquipMap Brigadier Service API")
                .version("0.1.0")
                .description("CRUD, certification monitoring and asynchronous brigadier notifications."));
    }
}

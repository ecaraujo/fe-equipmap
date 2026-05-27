package br.com.equipmap.equipment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI equipmentOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("EquipMap Equipment Service")
                        .version("0.1.0")
                        .description("Equipment CRUD, soft delete and outbox event APIs."));
    }
}

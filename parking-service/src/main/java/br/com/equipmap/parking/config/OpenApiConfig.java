package br.com.equipmap.parking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI parkingOpenApi() {
        return new OpenAPI().info(new Info()
                .title("EquipMap Parking Service API")
                .version("0.1.0")
                .description("CRUD for apartments/spots and auditable parking lottery."));
    }
}

package br.com.equipmap.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI authOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("EquipMap Auth Service")
                        .version("0.1.0")
                        .description("Authentication, refresh token rotation, RBAC and condominium switching APIs."));
    }
}

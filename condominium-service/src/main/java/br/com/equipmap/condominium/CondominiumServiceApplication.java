package br.com.equipmap.condominium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(CondominiumProperties.class)
public class CondominiumServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CondominiumServiceApplication.class, args);
    }
}

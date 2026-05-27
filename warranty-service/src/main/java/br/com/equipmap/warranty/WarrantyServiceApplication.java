package br.com.equipmap.warranty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication
public class WarrantyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WarrantyServiceApplication.class, args);
    }
}

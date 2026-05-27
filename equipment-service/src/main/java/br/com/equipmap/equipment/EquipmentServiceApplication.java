package br.com.equipmap.equipment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class EquipmentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EquipmentServiceApplication.class, args);
    }
}

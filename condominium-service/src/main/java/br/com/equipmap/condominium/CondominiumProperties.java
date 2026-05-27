package br.com.equipmap.condominium;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.UUID;

@ConfigurationProperties(prefix = "equipmap.condominium")
public class CondominiumProperties {
    private final Seed seed = new Seed();

    public Seed getSeed() {
        return seed;
    }

    public static class Seed {
        private UUID id = UUID.fromString("11111111-1111-1111-1111-111111111111");
        private String name = "Residencial Park EquipMap";
        private String cnpj = "12345678000199";
        private String address = "Rua das Acacias, 100";
        private String timezone = "America/Sao_Paulo";

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCnpj() {
            return cnpj;
        }

        public void setCnpj(String cnpj) {
            this.cnpj = cnpj;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }
    }
}

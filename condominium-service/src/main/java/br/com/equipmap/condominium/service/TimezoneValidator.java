package br.com.equipmap.condominium.service;

import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ValidationException;
import org.springframework.stereotype.Component;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.List;

@Component
public class TimezoneValidator {
    public String normalize(String timezone) {
        String candidate = timezone == null || timezone.isBlank() ? "America/Sao_Paulo" : timezone;
        try {
            return ZoneId.of(candidate).getId();
        } catch (DateTimeException exception) {
            throw new ValidationException(
                    "Invalid timezone. Suggested values: America/Sao_Paulo, America/Manaus, America/Cuiaba",
                    List.of(new ErrorDetail("timezone", "invalid"))
            );
        }
    }
}

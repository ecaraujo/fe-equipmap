package br.com.equipmap.condominium.api;

import br.com.equipmap.condominium.api.dto.AddUserRequest;
import br.com.equipmap.condominium.api.dto.CondominiumResponse;
import br.com.equipmap.condominium.api.dto.CondominiumUserResponse;
import br.com.equipmap.condominium.api.dto.CreateCondominiumRequest;
import br.com.equipmap.condominium.api.dto.UpdateCondominiumRequest;
import br.com.equipmap.condominium.security.PrincipalResolver;
import br.com.equipmap.condominium.service.CondominiumService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/condominiums")
public class CondominiumController {
    private final CondominiumService condominiumService;
    private final PrincipalResolver principalResolver;

    public CondominiumController(CondominiumService condominiumService, PrincipalResolver principalResolver) {
        this.condominiumService = condominiumService;
        this.principalResolver = principalResolver;
    }

    @GetMapping
    public List<CondominiumResponse> list(HttpServletRequest request) {
        return condominiumService.list(principalResolver.resolve(request));
    }

    @GetMapping("/{id}")
    public CondominiumResponse get(@PathVariable UUID id, HttpServletRequest request) {
        return condominiumService.get(principalResolver.resolve(request), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CondominiumResponse create(@Valid @RequestBody CreateCondominiumRequest body, HttpServletRequest request) {
        return condominiumService.create(principalResolver.resolve(request), body);
    }

    @PutMapping("/{id}")
    public CondominiumResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateCondominiumRequest body, HttpServletRequest request) {
        return condominiumService.update(principalResolver.resolve(request), id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, HttpServletRequest request) {
        condominiumService.delete(principalResolver.resolve(request), id);
    }

    @GetMapping("/{id}/users")
    public List<CondominiumUserResponse> listUsers(@PathVariable UUID id, HttpServletRequest request) {
        return condominiumService.listUsers(principalResolver.resolve(request), id);
    }

    @PostMapping("/{id}/users")
    @ResponseStatus(HttpStatus.CREATED)
    public CondominiumUserResponse addUser(@PathVariable UUID id, @Valid @RequestBody AddUserRequest body, HttpServletRequest request) {
        return condominiumService.addUser(principalResolver.resolve(request), id, body);
    }

    @DeleteMapping("/{id}/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeUser(@PathVariable UUID id, @PathVariable UUID userId, HttpServletRequest request) {
        condominiumService.removeUser(principalResolver.resolve(request), id, userId);
    }
}

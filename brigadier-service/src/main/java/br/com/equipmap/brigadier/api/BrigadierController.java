package br.com.equipmap.brigadier.api;

import br.com.equipmap.brigadier.api.dto.*;
import br.com.equipmap.brigadier.domain.BrigadierRole;
import br.com.equipmap.brigadier.domain.CertificationStatus;
import br.com.equipmap.brigadier.security.PrincipalResolver;
import br.com.equipmap.brigadier.security.RequestPrincipal;
import br.com.equipmap.brigadier.service.BrigadierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Brigadiers")
@RestController
@RequestMapping("/brigadiers")
public class BrigadierController {
    private final BrigadierService service;
    private final PrincipalResolver principalResolver;

    public BrigadierController(BrigadierService service, PrincipalResolver principalResolver) {
        this.service = service;
        this.principalResolver = principalResolver;
    }

    @Operation(summary = "List brigadiers with filters")
    @GetMapping
    public List<BrigadierResponse> list(HttpServletRequest request,
                                        @RequestParam(required = false) String name,
                                        @RequestParam(required = false) BrigadierRole role,
                                        @RequestParam(required = false) CertificationStatus status) {
        return service.list(principal(request), name, role, status);
    }

    @Operation(summary = "Get brigadier by id")
    @GetMapping("/{id}")
    public BrigadierResponse get(HttpServletRequest request, @PathVariable UUID id) {
        return service.get(principal(request), id);
    }

    @Operation(summary = "Create brigadier")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BrigadierResponse create(HttpServletRequest request, @Valid @RequestBody CreateBrigadierRequest body) {
        return service.create(principal(request), body);
    }

    @Operation(summary = "Update brigadier")
    @PutMapping("/{id}")
    public BrigadierResponse update(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateBrigadierRequest body) {
        return service.update(principal(request), id, body);
    }

    @Operation(summary = "Soft delete brigadier")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(HttpServletRequest request, @PathVariable UUID id) {
        service.delete(principal(request), id);
    }

    @Operation(summary = "Enqueue asynchronous mass notification")
    @PostMapping("/notify")
    public NotifyBrigadiersResponse notify(HttpServletRequest request, @Valid @RequestBody NotifyBrigadiersRequest body) {
        return service.notify(principal(request), body);
    }

    @Operation(summary = "List notification logs")
    @GetMapping("/notify/logs")
    public List<NotificationLogResponse> logs(HttpServletRequest request) {
        return service.logs(principal(request));
    }

    private RequestPrincipal principal(HttpServletRequest request) {
        return principalResolver.resolve(request);
    }
}

package br.com.equipmap.maintenance.api;

import br.com.equipmap.maintenance.api.dto.*;
import br.com.equipmap.maintenance.domain.MaintenanceStatus;
import br.com.equipmap.maintenance.domain.MaintenanceType;
import br.com.equipmap.maintenance.security.PrincipalResolver;
import br.com.equipmap.maintenance.service.MaintenanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;
    private final PrincipalResolver principalResolver;

    public MaintenanceController(MaintenanceService maintenanceService, PrincipalResolver principalResolver) {
        this.maintenanceService = maintenanceService;
        this.principalResolver = principalResolver;
    }

    @GetMapping
    public PageResponse<MaintenanceResponse> list(@RequestParam(required = false) String search,
                                                  @RequestParam(required = false) MaintenanceType type,
                                                  @RequestParam(required = false) MaintenanceStatus status,
                                                  @RequestParam(defaultValue = "1") int page,
                                                  @RequestParam(defaultValue = "20") int pageSize,
                                                  HttpServletRequest request) {
        return maintenanceService.list(principalResolver.resolve(request), search, type, status, page, pageSize);
    }

    @GetMapping("/{id}")
    public MaintenanceResponse get(@PathVariable UUID id, HttpServletRequest request) {
        return maintenanceService.get(principalResolver.resolve(request), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaintenanceResponse create(@Valid @RequestBody CreateMaintenanceRequest body, HttpServletRequest request) {
        return maintenanceService.create(principalResolver.resolve(request), body);
    }

    @PutMapping("/{id}")
    public MaintenanceResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateMaintenanceRequest body, HttpServletRequest request) {
        return maintenanceService.update(principalResolver.resolve(request), id, body);
    }

    @PatchMapping("/{id}/complete")
    public MaintenanceResponse complete(@PathVariable UUID id, @Valid @RequestBody CompleteMaintenanceRequest body, HttpServletRequest request) {
        return maintenanceService.complete(principalResolver.resolve(request), id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, HttpServletRequest request) {
        maintenanceService.delete(principalResolver.resolve(request), id);
    }

    @PostMapping("/internal/jobs/mark-overdue")
    public JobRunResponse markOverdueJob() {
        return new JobRunResponse(maintenanceService.markOverdue(LocalDate.now()));
    }

    public record JobRunResponse(int changed) {
    }
}

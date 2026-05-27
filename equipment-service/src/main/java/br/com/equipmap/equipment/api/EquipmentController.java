package br.com.equipmap.equipment.api;

import br.com.equipmap.equipment.api.dto.CreateEquipmentRequest;
import br.com.equipmap.equipment.api.dto.EquipmentResponse;
import br.com.equipmap.equipment.api.dto.PageResponse;
import br.com.equipmap.equipment.api.dto.UpdateEquipmentRequest;
import br.com.equipmap.equipment.domain.EquipmentStatus;
import br.com.equipmap.equipment.domain.EquipmentType;
import br.com.equipmap.equipment.security.PrincipalResolver;
import br.com.equipmap.equipment.service.EquipmentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/equipment")
public class EquipmentController {
    private final EquipmentService equipmentService;
    private final PrincipalResolver principalResolver;

    public EquipmentController(EquipmentService equipmentService, PrincipalResolver principalResolver) {
        this.equipmentService = equipmentService;
        this.principalResolver = principalResolver;
    }

    @GetMapping
    public PageResponse<EquipmentResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EquipmentType type,
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request
    ) {
        return equipmentService.list(principalResolver.resolve(request), search, type, status, includeDeleted, page, pageSize);
    }

    @GetMapping("/{id}")
    public EquipmentResponse get(@PathVariable UUID id, HttpServletRequest request) {
        return equipmentService.get(principalResolver.resolve(request), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentResponse create(@Valid @RequestBody CreateEquipmentRequest body, HttpServletRequest request) {
        return equipmentService.create(principalResolver.resolve(request), body);
    }

    @PutMapping("/{id}")
    public EquipmentResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateEquipmentRequest body, HttpServletRequest request) {
        return equipmentService.update(principalResolver.resolve(request), id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, HttpServletRequest request) {
        equipmentService.delete(principalResolver.resolve(request), id);
    }
}

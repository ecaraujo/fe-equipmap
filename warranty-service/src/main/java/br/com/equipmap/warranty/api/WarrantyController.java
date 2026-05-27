package br.com.equipmap.warranty.api;

import br.com.equipmap.warranty.api.dto.*;
import br.com.equipmap.warranty.domain.WarrantyStatus;
import br.com.equipmap.warranty.domain.WarrantyType;
import br.com.equipmap.warranty.security.PrincipalResolver;
import br.com.equipmap.warranty.security.RequestPrincipal;
import br.com.equipmap.warranty.service.WarrantyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Warranties")
@RestController
@RequestMapping("/warranties")
public class WarrantyController {
    private final WarrantyService service;
    private final PrincipalResolver principalResolver;

    public WarrantyController(WarrantyService service, PrincipalResolver principalResolver) {
        this.service = service;
        this.principalResolver = principalResolver;
    }

    @Operation(summary = "List warranties with filters and calculated status")
    @GetMapping
    public PageResponse<WarrantyResponse> list(HttpServletRequest request,
                                               @RequestParam(required = false) String search,
                                               @RequestParam(required = false) WarrantyType type,
                                               @RequestParam(required = false) WarrantyStatus status,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "20") int pageSize) {
        return service.list(principal(request), search, type, status, page, pageSize);
    }

    @Operation(summary = "Get warranty by id")
    @GetMapping("/{id}")
    public WarrantyResponse get(HttpServletRequest request, @PathVariable UUID id) {
        return service.get(principal(request), id);
    }

    @Operation(summary = "Create warranty")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WarrantyResponse create(HttpServletRequest request, @Valid @RequestBody CreateWarrantyRequest body) {
        return service.create(principal(request), body);
    }

    @Operation(summary = "Update warranty")
    @PutMapping("/{id}")
    public WarrantyResponse update(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UpdateWarrantyRequest body) {
        return service.update(principal(request), id, body);
    }

    @Operation(summary = "Soft delete warranty")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(HttpServletRequest request, @PathVariable UUID id) {
        service.delete(principal(request), id);
    }

    @Operation(summary = "Generate document upload pre-signed URL")
    @PostMapping("/{id}/upload-url")
    public UploadUrlResponse uploadUrl(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody UploadUrlRequest body) {
        return service.uploadUrl(principal(request), id, body);
    }

    @Operation(summary = "Confirm uploaded document after backend MIME validation")
    @PostMapping("/{id}/confirm-upload")
    public WarrantyResponse confirmUpload(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody ConfirmUploadRequest body) {
        return service.confirmUpload(principal(request), id, body);
    }

    private RequestPrincipal principal(HttpServletRequest request) {
        return principalResolver.resolve(request);
    }
}

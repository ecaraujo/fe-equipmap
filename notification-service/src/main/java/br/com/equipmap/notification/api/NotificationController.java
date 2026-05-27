package br.com.equipmap.notification.api;

import br.com.equipmap.notification.api.dto.NotificationResponse;
import br.com.equipmap.notification.api.dto.ReadAllResponse;
import br.com.equipmap.notification.security.PrincipalResolver;
import br.com.equipmap.notification.security.RequestPrincipal;
import br.com.equipmap.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService service;
    private final PrincipalResolver principalResolver;

    public NotificationController(NotificationService service, PrincipalResolver principalResolver) {
        this.service = service;
        this.principalResolver = principalResolver;
    }

    @GetMapping
    @Operation(summary = "List authenticated user's notifications in the active condominium")
    public List<NotificationResponse> list(HttpServletRequest request) {
        RequestPrincipal principal = principalResolver.resolve(request);
        return service.list(principal).stream().map(NotificationResponse::from).toList();
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark one notification as read")
    public NotificationResponse markRead(@PathVariable UUID id, HttpServletRequest request) {
        RequestPrincipal principal = principalResolver.resolve(request);
        return NotificationResponse.from(service.markRead(id, principal));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all authenticated user's notifications as read")
    public ReadAllResponse markAllRead(HttpServletRequest request) {
        RequestPrincipal principal = principalResolver.resolve(request);
        return new ReadAllResponse(service.markAllRead(principal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete one notification owned by the authenticated user")
    public ResponseEntity<Void> delete(@PathVariable UUID id, HttpServletRequest request) {
        RequestPrincipal principal = principalResolver.resolve(request);
        service.delete(id, principal);
        return ResponseEntity.noContent().build();
    }
}

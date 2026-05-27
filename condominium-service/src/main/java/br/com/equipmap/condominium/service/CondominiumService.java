package br.com.equipmap.condominium.service;

import br.com.equipmap.condominium.api.dto.AddUserRequest;
import br.com.equipmap.condominium.api.dto.CondominiumResponse;
import br.com.equipmap.condominium.api.dto.CondominiumUserResponse;
import br.com.equipmap.condominium.api.dto.CreateCondominiumRequest;
import br.com.equipmap.condominium.api.dto.UpdateCondominiumRequest;
import br.com.equipmap.condominium.domain.Condominium;
import br.com.equipmap.condominium.domain.CondominiumUser;
import br.com.equipmap.condominium.domain.UserRole;
import br.com.equipmap.condominium.repository.CondominiumRepository;
import br.com.equipmap.condominium.repository.CondominiumUserRepository;
import br.com.equipmap.condominium.security.RequestPrincipal;
import br.com.equipmap.core.error.ConflictException;
import br.com.equipmap.core.error.ErrorDetail;
import br.com.equipmap.core.error.ForbiddenException;
import br.com.equipmap.core.error.NotFoundException;
import br.com.equipmap.core.error.ValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CondominiumService {
    private final CondominiumRepository condominiumRepository;
    private final CondominiumUserRepository condominiumUserRepository;
    private final TimezoneValidator timezoneValidator;

    public CondominiumService(
            CondominiumRepository condominiumRepository,
            CondominiumUserRepository condominiumUserRepository,
            TimezoneValidator timezoneValidator
    ) {
        this.condominiumRepository = condominiumRepository;
        this.condominiumUserRepository = condominiumUserRepository;
        this.timezoneValidator = timezoneValidator;
    }

    @Transactional(readOnly = true)
    public List<CondominiumResponse> list(RequestPrincipal principal) {
        if (principal.isAdmin()) {
            return condominiumRepository.findAll().stream()
                    .map(CondominiumResponse::from)
                    .toList();
        }

        Set<UUID> condominiumIds = new LinkedHashSet<>();
        condominiumUserRepository.findAllByUserIdAndActiveTrue(principal.userId()).stream()
                .map(item -> item.getCondominium().getId())
                .forEach(condominiumIds::add);
        condominiumIds.add(principal.condominiumId());

        return condominiumIds.stream()
                .map(condominiumRepository::findById)
                .flatMap(java.util.Optional::stream)
                .map(CondominiumResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CondominiumResponse get(RequestPrincipal principal, UUID id) {
        requireReadable(principal, id);
        return CondominiumResponse.from(findCondominium(id));
    }

    @Transactional
    public CondominiumResponse create(RequestPrincipal principal, CreateCondominiumRequest request) {
        requireAdmin(principal);
        String cnpj = normalizeAndValidateCnpj(request.cnpj());
        if (condominiumRepository.existsByCnpj(cnpj)) {
            throw duplicateCnpj();
        }

        Condominium condominium = new Condominium(
                request.name(),
                cnpj,
                request.address(),
                timezoneValidator.normalize(request.timezone())
        );
        return CondominiumResponse.from(condominiumRepository.save(condominium));
    }

    @Transactional
    public CondominiumResponse update(RequestPrincipal principal, UUID id, UpdateCondominiumRequest request) {
        requireAdmin(principal);
        Condominium condominium = findCondominium(id);
        String cnpj = normalizeAndValidateCnpj(request.cnpj());
        if (condominiumRepository.existsByCnpjAndIdNot(cnpj, id)) {
            throw duplicateCnpj();
        }

        condominium.update(
                request.name(),
                cnpj,
                request.address(),
                timezoneValidator.normalize(request.timezone()),
                request.active()
        );
        return CondominiumResponse.from(condominium);
    }

    @Transactional
    public void delete(RequestPrincipal principal, UUID id) {
        requireAdmin(principal);
        Condominium condominium = findCondominium(id);
        if (condominium.getActiveDependenciesCount() > 0) {
            throw new ValidationException(
                    "Cannot delete condominium with active dependencies",
                    List.of(new ErrorDetail("condominiumId", "has active dependencies"))
            );
        }
        condominiumRepository.delete(condominium);
    }

    @Transactional(readOnly = true)
    public List<CondominiumUserResponse> listUsers(RequestPrincipal principal, UUID condominiumId) {
        requireAssociationManagerAccess(principal, condominiumId);
        ensureCondominiumExists(condominiumId);
        return condominiumUserRepository.findAllByCondominium_IdAndActiveTrue(condominiumId).stream()
                .map(CondominiumUserResponse::from)
                .toList();
    }

    @Transactional
    public CondominiumUserResponse addUser(RequestPrincipal principal, UUID condominiumId, AddUserRequest request) {
        requireAssociationManagerAccess(principal, condominiumId);
        Condominium condominium = findCondominium(condominiumId);
        CondominiumUser association = condominiumUserRepository
                .findByCondominium_IdAndUserId(condominiumId, request.userId())
                .map(existing -> updateAssociation(existing, request))
                .orElseGet(() -> new CondominiumUser(
                        condominium,
                        request.userId(),
                        request.userEmail(),
                        request.userName(),
                        request.role()
                ));

        return CondominiumUserResponse.from(condominiumUserRepository.save(association));
    }

    @Transactional
    public void removeUser(RequestPrincipal principal, UUID condominiumId, UUID userId) {
        requireAssociationManagerAccess(principal, condominiumId);
        CondominiumUser association = condominiumUserRepository.findByCondominium_IdAndUserId(condominiumId, userId)
                .filter(CondominiumUser::isActive)
                .orElseThrow(() -> new NotFoundException("User association not found"));

        if (association.getRole() == UserRole.ADMIN
                && condominiumUserRepository.countByCondominium_IdAndRoleAndActiveTrue(condominiumId, UserRole.ADMIN) <= 1) {
            throw new ValidationException(
                    "Cannot remove the last condominium admin",
                    List.of(new ErrorDetail("role", "last admin cannot be removed"))
            );
        }

        association.deactivate();
    }

    private CondominiumUser updateAssociation(CondominiumUser existing, AddUserRequest request) {
        if (existing.isActive()) {
            throw new ConflictException(
                    "User is already associated with this condominium",
                    List.of(new ErrorDetail("userId", "association already exists"))
            );
        }
        existing.update(request.userEmail(), request.userName(), request.role());
        return existing;
    }

    private void requireAdmin(RequestPrincipal principal) {
        if (!principal.isAdmin()) {
            throw new ForbiddenException("Only admins can manage condominiums");
        }
    }

    private void requireAssociationManagerAccess(RequestPrincipal principal, UUID condominiumId) {
        if (!principal.canManageAssociations()) {
            throw new ForbiddenException("Only admins and managers can manage condominium users");
        }
        if (!principal.isAdmin() && !principal.condominiumId().equals(condominiumId)) {
            throw new ForbiddenException("Managers can manage users only in their active condominium");
        }
    }

    private void requireReadable(RequestPrincipal principal, UUID condominiumId) {
        if (principal.isAdmin() || principal.condominiumId().equals(condominiumId)) {
            return;
        }
        boolean associated = condominiumUserRepository.findByCondominium_IdAndUserId(condominiumId, principal.userId())
                .filter(CondominiumUser::isActive)
                .isPresent();
        if (!associated) {
            throw new ForbiddenException("User cannot access this condominium");
        }
    }

    private Condominium findCondominium(UUID id) {
        return condominiumRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Condominium not found"));
    }

    private void ensureCondominiumExists(UUID id) {
        if (!condominiumRepository.existsById(id)) {
            throw new NotFoundException("Condominium not found");
        }
    }

    private String normalizeAndValidateCnpj(String cnpj) {
        String normalized = Condominium.normalizeCnpj(cnpj);
        if (normalized == null || normalized.length() != 14) {
            throw new ValidationException(
                    "Invalid CNPJ",
                    List.of(new ErrorDetail("cnpj", "must contain 14 digits"))
            );
        }
        return normalized;
    }

    private ConflictException duplicateCnpj() {
        return new ConflictException(
                "Condominium CNPJ already exists",
                List.of(new ErrorDetail("cnpj", "already exists"))
        );
    }
}

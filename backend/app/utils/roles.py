from enum import Enum
from app.db.models import UserRole


class PermissionCode(str, Enum):
    STRUCTURE_READ = "structure:read"
    STRUCTURE_MANAGE = "structure:manage"

    RESOURCES_READ = "resources:read"
    RESOURCES_CREATE = "resources:create"
    RESOURCES_UPDATE = "resources:update"
    RESOURCES_DELETE = "resources:delete"
    RESOURCES_MAINTENANCE = "resources:maintenance"

    BOOKINGS_READ = "bookings:read"
    BOOKINGS_CREATE = "bookings:create"
    BOOKINGS_CANCEL = "bookings:cancel"
    BOOKINGS_APPROVE = "bookings:approve"
    BOOKINGS_RETURN = "bookings:return"

    TECHNICAL_HISTORY_READ = "technical_history:read"
    TECHNICAL_HISTORY_CREATE = "technical_history:create"

    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"

    AUDIT_READ = "audit:read"


PERMISSION_DESCRIPTIONS = {
    PermissionCode.STRUCTURE_READ: "Vizualizare structură academică (instituții, facultăți, departamente, săli)",
    PermissionCode.STRUCTURE_MANAGE: "Administrare structură academică",
    PermissionCode.RESOURCES_READ: "Consultare catalog resurse și disponibilitate",
    PermissionCode.RESOURCES_CREATE: "Adăugare resursă nouă în inventar",
    PermissionCode.RESOURCES_UPDATE: "Modificare date resursă",
    PermissionCode.RESOURCES_DELETE: "Dezactivare / casare resursă",
    PermissionCode.RESOURCES_MAINTENANCE: "Actualizare stare tehnică resursă",
    PermissionCode.BOOKINGS_READ: "Vizualizare rezervări",
    PermissionCode.BOOKINGS_CREATE: "Creare cerere de rezervare",
    PermissionCode.BOOKINGS_CANCEL: "Anulare rezervare proprie",
    PermissionCode.BOOKINGS_APPROVE: "Aprobare sau respingere cerere de rezervare",
    PermissionCode.BOOKINGS_RETURN: "Înregistrare predare și retur fizic",
    PermissionCode.TECHNICAL_HISTORY_READ: "Consultare jurnal tehnic și istoric intervenții",
    PermissionCode.TECHNICAL_HISTORY_CREATE: "Înregistrare intervenție sau defecțiune în fișa tehnică",
    PermissionCode.USERS_READ: "Vizualizare utilizatori din sistem",
    PermissionCode.USERS_MANAGE: "Gestiune conturi și roluri utilizatori",
    PermissionCode.AUDIT_READ: "Consultare registru imutabil de audit",
}

ROLE_PERMISSIONS_MAP: dict[UserRole, list[PermissionCode]] = {
    UserRole.ADMINISTRATOR: [
        PermissionCode.STRUCTURE_READ,
        PermissionCode.STRUCTURE_MANAGE,
        PermissionCode.RESOURCES_READ,
        PermissionCode.RESOURCES_CREATE,
        PermissionCode.RESOURCES_UPDATE,
        PermissionCode.RESOURCES_DELETE,
        PermissionCode.RESOURCES_MAINTENANCE,
        PermissionCode.BOOKINGS_READ,
        PermissionCode.BOOKINGS_CREATE,
        PermissionCode.BOOKINGS_CANCEL,
        PermissionCode.BOOKINGS_APPROVE,
        PermissionCode.BOOKINGS_RETURN,
        PermissionCode.TECHNICAL_HISTORY_READ,
        PermissionCode.TECHNICAL_HISTORY_CREATE,
        PermissionCode.USERS_READ,
        PermissionCode.USERS_MANAGE,
        PermissionCode.AUDIT_READ,
    ],
    UserRole.PROFESOR: [
        PermissionCode.STRUCTURE_READ,
        PermissionCode.RESOURCES_READ,
        PermissionCode.BOOKINGS_READ,
        PermissionCode.BOOKINGS_CREATE,
        PermissionCode.BOOKINGS_CANCEL,
        PermissionCode.BOOKINGS_APPROVE,
    ],
    UserRole.RESPONSABIL_LABORATOR: [
        PermissionCode.STRUCTURE_READ,
        PermissionCode.RESOURCES_READ,
        PermissionCode.RESOURCES_UPDATE,
        PermissionCode.RESOURCES_MAINTENANCE,
        PermissionCode.BOOKINGS_READ,
        PermissionCode.BOOKINGS_APPROVE,
        PermissionCode.BOOKINGS_RETURN,
        PermissionCode.TECHNICAL_HISTORY_READ,
        PermissionCode.TECHNICAL_HISTORY_CREATE,
    ],
    UserRole.STUDENT: [
        PermissionCode.STRUCTURE_READ,
        PermissionCode.RESOURCES_READ,
        PermissionCode.BOOKINGS_READ,
        PermissionCode.BOOKINGS_CREATE,
        PermissionCode.BOOKINGS_CANCEL,
    ],
}


def get_role_permissions(role: UserRole) -> list[PermissionCode]:
    return ROLE_PERMISSIONS_MAP.get(role, [])


def has_permission(role: UserRole, permission: PermissionCode) -> bool:
    return permission in ROLE_PERMISSIONS_MAP.get(role, [])

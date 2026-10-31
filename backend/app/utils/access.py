from typing import Optional
from app.db.models import User
from app.exceptions.academic_exceptions import InactiveEntityAccessDeniedError
from app.utils.roles import PermissionCode


def user_permission_codes(user: User) -> set[str]:
    if not user.role_rel:
        return set()
    return {permission.code for permission in user.role_rel.permissions}


def user_has_permission(user: User, permission: PermissionCode) -> bool:
    return permission.value in user_permission_codes(user)


def is_structure_admin(user: User) -> bool:
    return user_has_permission(user, PermissionCode.STRUCTURE_MANAGE)


def resolve_active_filter(actor: User, requested: Optional[bool], entity_label: str) -> Optional[bool]:
    if is_structure_admin(actor):
        return requested
    if requested is False:
        raise InactiveEntityAccessDeniedError(entity_label)
    return True

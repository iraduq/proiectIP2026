from app.db.models import TipSala, UserRole

MAX_DEPARTMENTS_PER_HEAD = 2
MAX_ROOMS_PER_RESPONSIBLE = 25
DEPARTMENT_HEAD_ROLES = frozenset({UserRole.PROFESOR.value})
ROOM_RESPONSIBLE_ROLES = frozenset({UserRole.RESPONSABIL_LABORATOR.value, UserRole.PROFESOR.value})
ROOM_RESPONSIBLE_EDITABLE_FIELDS = frozenset({"descriere", "capacitate"})
ROOM_FLOOR_MIN = -3
ROOM_FLOOR_MAX = 30
ROOM_CAPACITY_LIMITS: dict[TipSala, tuple[int, int]] = {
    TipSala.LABORATOR: (1, 60),
    TipSala.SALA_CERCETARE: (1, 80),
    TipSala.ATELIER: (1, 40),
    TipSala.SALA_SERVERE: (1, 10),
    TipSala.DEPOZIT: (1, 20),
}

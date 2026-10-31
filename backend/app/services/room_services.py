from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import Page, RoomCreate, RoomResponse, RoomUpdate
from app.db.models import Room, TipSala, User
from app.exceptions.academic_exceptions import (
    DepartmentInactiveError,
    EmptyUpdateError,
    InactiveEntityAccessDeniedError,
    InvalidRoomResponsibleError,
    NotRoomResponsibleError,
    RoomAlreadyActiveError,
    RoomAlreadyInactiveError,
    RoomCapacityOutOfRangeError,
    RoomCodeAlreadyExistsError,
    RoomFieldsRestrictedError,
    RoomInactiveError,
    RoomNameAlreadyExistsError,
    RoomResponsibleLimitExceededError,
    RoomResponsibleUnchangedError,
)
from app.exceptions.exceptions import (
    DepartmentNotFoundError,
    FacultyNotFoundError,
    InstitutionNotFoundError,
    RoomNotFoundError,
    UserNotFoundError,
)
from app.repositories.auth_repository import auth_repository
from app.repositories.department_repository import department_repository
from app.repositories.faculty_repository import faculty_repository
from app.repositories.institution_repository import institution_repository
from app.repositories.room_repository import room_repository
from app.utils.access import is_structure_admin, resolve_active_filter
from app.utils.structure_rules import (
    MAX_ROOMS_PER_RESPONSIBLE,
    ROOM_CAPACITY_LIMITS,
    ROOM_RESPONSIBLE_EDITABLE_FIELDS,
    ROOM_RESPONSIBLE_ROLES,
)


class RoomService:
    async def _get_or_404(self, db: AsyncSession, room_id: int) -> Room:
        room = await room_repository.get_detailed(db, room_id)
        if not room:
            raise RoomNotFoundError(room_id)
        return room

    def _validate_capacity(self, tip_sala: TipSala, capacitate: int) -> None:
        minimum, maximum = ROOM_CAPACITY_LIMITS[tip_sala]
        if capacitate < minimum or capacitate > maximum:
            raise RoomCapacityOutOfRangeError(tip_sala.value, minimum, maximum, capacitate)

    async def _ensure_unique(
        self,
        db: AsyncSession,
        departament_id: int,
        nume: Optional[str],
        cod: Optional[str],
        exclude_id: Optional[int] = None,
    ) -> None:
        if cod is not None and await room_repository.exists_unique(db, "cod", cod, exclude_id):
            raise RoomCodeAlreadyExistsError(cod)
        if nume is not None and await room_repository.exists_unique(
            db, "nume", nume, exclude_id, departament_id=departament_id
        ):
            raise RoomNameAlreadyExistsError(nume)

    async def _validate_responsible(
        self,
        db: AsyncSession,
        user_id: int,
        exclude_room_id: Optional[int] = None,
    ) -> User:
        user = await auth_repository.get_by_id(db, user_id)
        if not user:
            raise UserNotFoundError(user_id)
        if not user.is_active:
            raise InvalidRoomResponsibleError(user.nume, "contul este dezactivat")
        role_name = user.role_rel.name if user.role_rel else None
        if role_name not in ROOM_RESPONSIBLE_ROLES:
            allowed = ", ".join(sorted(ROOM_RESPONSIBLE_ROLES))
            raise InvalidRoomResponsibleError(user.nume, f"rolul trebuie să fie unul dintre: {allowed}")
        active_rooms = await room_repository.count_active_by_responsible(db, user_id, exclude_room_id)
        if active_rooms >= MAX_ROOMS_PER_RESPONSIBLE:
            raise RoomResponsibleLimitExceededError(user.nume, MAX_ROOMS_PER_RESPONSIBLE)
        return user

    async def _refreshed(self, db: AsyncSession, room_id: int) -> RoomResponse:
        room = await room_repository.get_detailed(db, room_id)
        return RoomResponse.from_model(room)

    async def create(self, db: AsyncSession, data: RoomCreate) -> RoomResponse:
        department = await department_repository.get_by_id(db, data.departament_id)
        if not department:
            raise DepartmentNotFoundError(data.departament_id)
        if not department.is_active:
            raise DepartmentInactiveError(department.nume)
        await self._ensure_unique(db, data.departament_id, data.nume, data.cod)
        self._validate_capacity(data.tip_sala, data.capacitate)
        await self._validate_responsible(db, data.responsabil_id)
        room = await room_repository.add(db, Room(**data.model_dump()))
        return await self._refreshed(db, room.id)

    async def get(self, db: AsyncSession, actor: User, room_id: int) -> RoomResponse:
        room = await self._get_or_404(db, room_id)
        is_owner = room.responsabil_id == actor.id_utilizator
        if not room.is_active and not is_structure_admin(actor) and not is_owner:
            raise InactiveEntityAccessDeniedError("sală")
        return RoomResponse.from_model(room)

    async def list_page(
        self,
        db: AsyncSession,
        actor: User,
        departament_id: Optional[int],
        facultate_id: Optional[int],
        institutie_id: Optional[int],
        responsabil_id: Optional[int],
        tip_sala: Optional[TipSala],
        is_active: Optional[bool],
        min_capacitate: Optional[int],
        search: Optional[str],
        skip: int,
        limit: int,
    ) -> Page[RoomResponse]:
        effective_active = resolve_active_filter(actor, is_active, "sală")
        if institutie_id is not None and not await institution_repository.get_by_id(db, institutie_id):
            raise InstitutionNotFoundError(institutie_id)
        if facultate_id is not None and not await faculty_repository.get_by_id(db, facultate_id):
            raise FacultyNotFoundError(facultate_id)
        if departament_id is not None and not await department_repository.get_by_id(db, departament_id):
            raise DepartmentNotFoundError(departament_id)
        if responsabil_id is not None and not await auth_repository.get_by_id(db, responsabil_id):
            raise UserNotFoundError(responsabil_id)
        items, total = await room_repository.list_page(
            db,
            departament_id,
            facultate_id,
            institutie_id,
            responsabil_id,
            tip_sala,
            effective_active,
            min_capacitate,
            search.strip() if search else None,
            skip,
            limit,
        )
        return Page.build([RoomResponse.from_model(item) for item in items], total, skip, limit)

    async def list_mine(self, db: AsyncSession, actor: User, skip: int, limit: int) -> Page[RoomResponse]:
        items, total = await room_repository.list_page(
            db, None, None, None, actor.id_utilizator, None, None, None, None, skip, limit
        )
        return Page.build([RoomResponse.from_model(item) for item in items], total, skip, limit)

    async def update(self, db: AsyncSession, actor: User, room_id: int, data: RoomUpdate) -> RoomResponse:
        changes = data.model_dump(exclude_unset=True)
        if not changes:
            raise EmptyUpdateError()
        room = await self._get_or_404(db, room_id)
        is_admin = is_structure_admin(actor)
        is_owner = room.responsabil_id == actor.id_utilizator
        if not is_admin and not is_owner:
            raise NotRoomResponsibleError(room.cod)
        if not is_admin:
            restricted = sorted(set(changes) - ROOM_RESPONSIBLE_EDITABLE_FIELDS)
            if restricted:
                raise RoomFieldsRestrictedError(restricted)
            if not room.is_active:
                raise RoomInactiveError(room.cod)
        await self._ensure_unique(db, room.departament_id, changes.get("nume"), changes.get("cod"), room_id)
        effective_type = changes.get("tip_sala", room.tip_sala)
        effective_capacity = changes.get("capacitate", room.capacitate)
        if "tip_sala" in changes or "capacitate" in changes:
            self._validate_capacity(effective_type, effective_capacity)
        for field_name, value in changes.items():
            setattr(room, field_name, value)
        await room_repository.flush(db)
        return await self._refreshed(db, room_id)

    async def assign_responsible(self, db: AsyncSession, room_id: int, responsabil_id: int) -> RoomResponse:
        room = await self._get_or_404(db, room_id)
        if not room.is_active:
            raise RoomInactiveError(room.cod)
        if room.responsabil_id == responsabil_id:
            raise RoomResponsibleUnchangedError(room.responsabil.nume)
        await self._validate_responsible(db, responsabil_id, room_id)
        room.responsabil_id = responsabil_id
        await room_repository.flush(db)
        return await self._refreshed(db, room_id)

    async def activate(self, db: AsyncSession, room_id: int) -> RoomResponse:
        room = await self._get_or_404(db, room_id)
        if room.is_active:
            raise RoomAlreadyActiveError(room.cod)
        if not room.department.is_active:
            raise DepartmentInactiveError(room.department.nume)
        await self._validate_responsible(db, room.responsabil_id, room_id)
        room.is_active = True
        await room_repository.flush(db)
        return await self._refreshed(db, room_id)

    async def deactivate(self, db: AsyncSession, room_id: int) -> RoomResponse:
        room = await self._get_or_404(db, room_id)
        if not room.is_active:
            raise RoomAlreadyInactiveError(room.cod)
        room.is_active = False
        await room_repository.flush(db)
        return await self._refreshed(db, room_id)

    async def delete(self, db: AsyncSession, room_id: int) -> None:
        room = await self._get_or_404(db, room_id)
        await room_repository.delete(db, room)


room_service = RoomService()

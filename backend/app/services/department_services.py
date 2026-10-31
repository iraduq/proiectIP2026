from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import DepartmentCreate, DepartmentResponse, DepartmentUpdate, Page
from app.db.models import Department, User
from app.exceptions.academic_exceptions import (
    DepartmentAlreadyActiveError,
    DepartmentAlreadyInactiveError,
    DepartmentCodeAlreadyExistsError,
    DepartmentHasActiveRoomsError,
    DepartmentHasRoomsError,
    DepartmentHeadLimitExceededError,
    DepartmentNameAlreadyExistsError,
    EmptyUpdateError,
    FacultyInactiveError,
    InactiveEntityAccessDeniedError,
    InvalidDepartmentHeadError,
)
from app.exceptions.exceptions import DepartmentNotFoundError, FacultyNotFoundError, InstitutionNotFoundError, UserNotFoundError
from app.repositories.auth_repository import auth_repository
from app.repositories.department_repository import department_repository
from app.repositories.faculty_repository import faculty_repository
from app.repositories.institution_repository import institution_repository
from app.utils.access import is_structure_admin, resolve_active_filter
from app.utils.structure_rules import DEPARTMENT_HEAD_ROLES, MAX_DEPARTMENTS_PER_HEAD


class DepartmentService:
    async def _get_or_404(self, db: AsyncSession, department_id: int) -> Department:
        department = await department_repository.get_detailed(db, department_id)
        if not department:
            raise DepartmentNotFoundError(department_id)
        return department

    async def _ensure_unique(
        self,
        db: AsyncSession,
        facultate_id: int,
        nume: Optional[str],
        cod: Optional[str],
        exclude_id: Optional[int] = None,
    ) -> None:
        if nume is not None and await department_repository.exists_unique(
            db, "nume", nume, exclude_id, facultate_id=facultate_id
        ):
            raise DepartmentNameAlreadyExistsError(nume)
        if cod is not None and await department_repository.exists_unique(
            db, "cod", cod, exclude_id, facultate_id=facultate_id
        ):
            raise DepartmentCodeAlreadyExistsError(cod)

    async def _validate_head(self, db: AsyncSession, user_id: int, department_id: Optional[int] = None) -> None:
        user = await auth_repository.get_by_id(db, user_id)
        if not user:
            raise UserNotFoundError(user_id)
        if not user.is_active:
            raise InvalidDepartmentHeadError(user.nume, "contul este dezactivat")
        role_name = user.role_rel.name if user.role_rel else None
        if role_name not in DEPARTMENT_HEAD_ROLES:
            raise InvalidDepartmentHeadError(user.nume, "utilizatorul trebuie să aibă rolul PROFESOR")
        headed = await department_repository.count_headed_by(db, user_id, department_id)
        if headed >= MAX_DEPARTMENTS_PER_HEAD:
            raise DepartmentHeadLimitExceededError(user.nume, MAX_DEPARTMENTS_PER_HEAD)

    async def _refreshed(self, db: AsyncSession, department_id: int) -> DepartmentResponse:
        department = await department_repository.get_detailed(db, department_id)
        return DepartmentResponse.from_model(department)

    async def create(self, db: AsyncSession, data: DepartmentCreate) -> DepartmentResponse:
        faculty = await faculty_repository.get_by_id(db, data.facultate_id)
        if not faculty:
            raise FacultyNotFoundError(data.facultate_id)
        if not faculty.is_active:
            raise FacultyInactiveError(faculty.nume)
        await self._ensure_unique(db, data.facultate_id, data.nume, data.cod)
        if data.sef_departament_id is not None:
            await self._validate_head(db, data.sef_departament_id)
        department = await department_repository.add(db, Department(**data.model_dump()))
        return await self._refreshed(db, department.id)

    async def get(self, db: AsyncSession, actor: User, department_id: int) -> DepartmentResponse:
        department = await self._get_or_404(db, department_id)
        if not department.is_active and not is_structure_admin(actor):
            raise InactiveEntityAccessDeniedError("departament")
        return DepartmentResponse.from_model(department)

    async def list_page(
        self,
        db: AsyncSession,
        actor: User,
        facultate_id: Optional[int],
        institutie_id: Optional[int],
        sef_departament_id: Optional[int],
        search: Optional[str],
        is_active: Optional[bool],
        skip: int,
        limit: int,
    ) -> Page[DepartmentResponse]:
        effective_active = resolve_active_filter(actor, is_active, "departament")
        if institutie_id is not None and not await institution_repository.get_by_id(db, institutie_id):
            raise InstitutionNotFoundError(institutie_id)
        if facultate_id is not None and not await faculty_repository.get_by_id(db, facultate_id):
            raise FacultyNotFoundError(facultate_id)
        items, total = await department_repository.list_page(
            db,
            facultate_id,
            institutie_id,
            sef_departament_id,
            search.strip() if search else None,
            effective_active,
            skip,
            limit,
        )
        return Page.build([DepartmentResponse.from_model(item) for item in items], total, skip, limit)

    async def update(self, db: AsyncSession, department_id: int, data: DepartmentUpdate) -> DepartmentResponse:
        changes = data.model_dump(exclude_unset=True)
        if not changes:
            raise EmptyUpdateError()
        department = await self._get_or_404(db, department_id)
        await self._ensure_unique(
            db, department.facultate_id, changes.get("nume"), changes.get("cod"), department_id
        )
        new_head_id = changes.get("sef_departament_id")
        if new_head_id is not None and new_head_id != department.sef_departament_id:
            await self._validate_head(db, new_head_id, department_id)
        for field_name, value in changes.items():
            setattr(department, field_name, value)
        await department_repository.flush(db)
        return await self._refreshed(db, department_id)

    async def activate(self, db: AsyncSession, department_id: int) -> DepartmentResponse:
        department = await self._get_or_404(db, department_id)
        if department.is_active:
            raise DepartmentAlreadyActiveError(department.nume)
        if not department.faculty.is_active:
            raise FacultyInactiveError(department.faculty.nume)
        department.is_active = True
        await department_repository.flush(db)
        return await self._refreshed(db, department_id)

    async def deactivate(self, db: AsyncSession, department_id: int) -> DepartmentResponse:
        department = await self._get_or_404(db, department_id)
        if not department.is_active:
            raise DepartmentAlreadyInactiveError(department.nume)
        active_rooms = await department_repository.count_rooms(db, department_id, only_active=True)
        if active_rooms:
            raise DepartmentHasActiveRoomsError(department.nume, active_rooms)
        department.is_active = False
        await department_repository.flush(db)
        return await self._refreshed(db, department_id)

    async def delete(self, db: AsyncSession, department_id: int) -> None:
        department = await self._get_or_404(db, department_id)
        rooms = await department_repository.count_rooms(db, department_id)
        if rooms:
            raise DepartmentHasRoomsError(department.nume, rooms)
        await department_repository.delete(db, department)


department_service = DepartmentService()

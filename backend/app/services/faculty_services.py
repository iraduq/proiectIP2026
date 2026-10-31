from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import FacultyCreate, FacultyResponse, FacultyUpdate, Page
from app.db.models import Faculty, User
from app.exceptions.academic_exceptions import (
    EmptyUpdateError,
    FacultyAlreadyActiveError,
    FacultyAlreadyInactiveError,
    FacultyCodeAlreadyExistsError,
    FacultyHasActiveDepartmentsError,
    FacultyHasDepartmentsError,
    FacultyNameAlreadyExistsError,
    InactiveEntityAccessDeniedError,
    InstitutionInactiveError,
)
from app.exceptions.exceptions import FacultyNotFoundError, InstitutionNotFoundError
from app.repositories.faculty_repository import faculty_repository
from app.repositories.institution_repository import institution_repository
from app.utils.access import is_structure_admin, is_student, resolve_active_filter


class FacultyService:
    async def _get_or_404(self, db: AsyncSession, faculty_id: int) -> Faculty:
        faculty = await faculty_repository.get_detailed(db, faculty_id)
        if not faculty:
            raise FacultyNotFoundError(faculty_id)
        return faculty

    async def _ensure_unique(
        self,
        db: AsyncSession,
        institutie_id: int,
        nume: Optional[str],
        cod: Optional[str],
        exclude_id: Optional[int] = None,
    ) -> None:
        if nume is not None and await faculty_repository.exists_unique(
            db, "nume", nume, exclude_id, institutie_id=institutie_id
        ):
            raise FacultyNameAlreadyExistsError(nume)
        if cod is not None and await faculty_repository.exists_unique(
            db, "cod", cod, exclude_id, institutie_id=institutie_id
        ):
            raise FacultyCodeAlreadyExistsError(cod)

    async def _refreshed(self, db: AsyncSession, faculty_id: int) -> FacultyResponse:
        faculty = await faculty_repository.get_detailed(db, faculty_id)
        return FacultyResponse.from_model(faculty)

    async def create(self, db: AsyncSession, data: FacultyCreate) -> FacultyResponse:
        institution = await institution_repository.get_by_id(db, data.institutie_id)
        if not institution:
            raise InstitutionNotFoundError(data.institutie_id)
        if not institution.is_active:
            raise InstitutionInactiveError(institution.nume)
        await self._ensure_unique(db, data.institutie_id, data.nume, data.cod)
        faculty = await faculty_repository.add(db, Faculty(**data.model_dump()))
        return await self._refreshed(db, faculty.id)

    async def get(self, db: AsyncSession, actor: User, faculty_id: int) -> FacultyResponse:
        faculty = await self._get_or_404(db, faculty_id)
        if is_student(actor):
            if actor.facultate_id is None or faculty.id != actor.facultate_id:
                raise FacultyNotFoundError(faculty_id)
        if not faculty.is_active and not is_structure_admin(actor):
            raise InactiveEntityAccessDeniedError("facultate")
        return FacultyResponse.from_model(faculty)

    async def list_page(
        self,
        db: AsyncSession,
        actor: User,
        institutie_id: Optional[int],
        search: Optional[str],
        is_active: Optional[bool],
        skip: int,
        limit: int,
    ) -> Page[FacultyResponse]:
        effective_active = resolve_active_filter(actor, is_active, "facultate")
        if is_student(actor):
            if actor.facultate_id is None:
                return Page.build([], 0, skip, limit)
            faculty = await faculty_repository.get_detailed(db, actor.facultate_id)
            if not faculty:
                return Page.build([], 0, skip, limit)
            if institutie_id is not None and faculty.institutie_id != institutie_id:
                return Page.build([], 0, skip, limit)
            if search and search.lower() not in faculty.nume.lower() and search.lower() not in faculty.cod.lower():
                return Page.build([], 0, skip, limit)
            return Page.build([FacultyResponse.from_model(faculty)], 1, skip, limit)

        if institutie_id is not None and not await institution_repository.get_by_id(db, institutie_id):
            raise InstitutionNotFoundError(institutie_id)
        items, total = await faculty_repository.list_page(
            db, institutie_id, search.strip() if search else None, effective_active, skip, limit
        )
        return Page.build([FacultyResponse.from_model(item) for item in items], total, skip, limit)

    async def update(self, db: AsyncSession, faculty_id: int, data: FacultyUpdate) -> FacultyResponse:
        changes = data.model_dump(exclude_unset=True)
        if not changes:
            raise EmptyUpdateError()
        faculty = await self._get_or_404(db, faculty_id)
        await self._ensure_unique(db, faculty.institutie_id, changes.get("nume"), changes.get("cod"), faculty_id)
        for field_name, value in changes.items():
            setattr(faculty, field_name, value)
        await faculty_repository.flush(db)
        return await self._refreshed(db, faculty_id)

    async def activate(self, db: AsyncSession, faculty_id: int) -> FacultyResponse:
        faculty = await self._get_or_404(db, faculty_id)
        if faculty.is_active:
            raise FacultyAlreadyActiveError(faculty.nume)
        if not faculty.institution.is_active:
            raise InstitutionInactiveError(faculty.institution.nume)
        faculty.is_active = True
        await faculty_repository.flush(db)
        return await self._refreshed(db, faculty_id)

    async def deactivate(self, db: AsyncSession, faculty_id: int) -> FacultyResponse:
        faculty = await self._get_or_404(db, faculty_id)
        if not faculty.is_active:
            raise FacultyAlreadyInactiveError(faculty.nume)
        active_departments = await faculty_repository.count_departments(db, faculty_id, only_active=True)
        if active_departments:
            raise FacultyHasActiveDepartmentsError(faculty.nume, active_departments)
        faculty.is_active = False
        await faculty_repository.flush(db)
        return await self._refreshed(db, faculty_id)

    async def delete(self, db: AsyncSession, faculty_id: int) -> None:
        faculty = await self._get_or_404(db, faculty_id)
        departments = await faculty_repository.count_departments(db, faculty_id)
        if departments:
            raise FacultyHasDepartmentsError(faculty.nume, departments)
        await faculty_repository.delete(db, faculty)


faculty_service = FacultyService()

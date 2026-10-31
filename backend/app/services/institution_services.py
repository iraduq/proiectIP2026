from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionStats,
    InstitutionUpdate,
    Page,
)
from app.db.models import Institution, User
from app.exceptions.academic_exceptions import (
    EmptyUpdateError,
    InactiveEntityAccessDeniedError,
    InstitutionAlreadyActiveError,
    InstitutionAlreadyInactiveError,
    InstitutionCodeAlreadyExistsError,
    InstitutionHasActiveFacultiesError,
    InstitutionHasFacultiesError,
    InstitutionNameAlreadyExistsError,
)
from app.exceptions.exceptions import InstitutionNotFoundError
from app.repositories.institution_repository import institution_repository
from app.utils.access import is_structure_admin, resolve_active_filter


class InstitutionService:
    async def _get_or_404(self, db: AsyncSession, institution_id: int) -> Institution:
        institution = await institution_repository.get_by_id(db, institution_id)
        if not institution:
            raise InstitutionNotFoundError(institution_id)
        return institution

    async def _ensure_unique(
        self,
        db: AsyncSession,
        nume: Optional[str],
        cod: Optional[str],
        exclude_id: Optional[int] = None,
    ) -> None:
        if nume is not None and await institution_repository.exists_unique(db, "nume", nume, exclude_id):
            raise InstitutionNameAlreadyExistsError(nume)
        if cod is not None and await institution_repository.exists_unique(db, "cod", cod, exclude_id):
            raise InstitutionCodeAlreadyExistsError(cod)

    async def _refreshed(self, db: AsyncSession, institution_id: int) -> InstitutionResponse:
        institution = await institution_repository.get_detailed(db, institution_id)
        return InstitutionResponse.from_model(institution)

    async def create(self, db: AsyncSession, data: InstitutionCreate) -> InstitutionResponse:
        await self._ensure_unique(db, data.nume, data.cod)
        institution = await institution_repository.add(db, Institution(**data.model_dump()))
        return await self._refreshed(db, institution.id)

    async def get(self, db: AsyncSession, actor: User, institution_id: int) -> InstitutionResponse:
        institution = await self._get_or_404(db, institution_id)
        if not institution.is_active and not is_structure_admin(actor):
            raise InactiveEntityAccessDeniedError("instituție")
        return InstitutionResponse.from_model(institution)

    async def list_page(
        self,
        db: AsyncSession,
        actor: User,
        search: Optional[str],
        is_active: Optional[bool],
        oras: Optional[str],
        skip: int,
        limit: int,
    ) -> Page[InstitutionResponse]:
        effective_active = resolve_active_filter(actor, is_active, "instituție")
        items, total = await institution_repository.list_page(
            db, search.strip() if search else None, effective_active, oras.strip() if oras else None, skip, limit
        )
        return Page.build([InstitutionResponse.from_model(item) for item in items], total, skip, limit)

    async def update(self, db: AsyncSession, institution_id: int, data: InstitutionUpdate) -> InstitutionResponse:
        changes = data.model_dump(exclude_unset=True)
        if not changes:
            raise EmptyUpdateError()
        institution = await self._get_or_404(db, institution_id)
        await self._ensure_unique(db, changes.get("nume"), changes.get("cod"), institution_id)
        for field_name, value in changes.items():
            setattr(institution, field_name, value)
        await institution_repository.flush(db)
        return await self._refreshed(db, institution_id)

    async def activate(self, db: AsyncSession, institution_id: int) -> InstitutionResponse:
        institution = await self._get_or_404(db, institution_id)
        if institution.is_active:
            raise InstitutionAlreadyActiveError(institution.nume)
        institution.is_active = True
        await institution_repository.flush(db)
        return await self._refreshed(db, institution_id)

    async def deactivate(self, db: AsyncSession, institution_id: int) -> InstitutionResponse:
        institution = await self._get_or_404(db, institution_id)
        if not institution.is_active:
            raise InstitutionAlreadyInactiveError(institution.nume)
        active_faculties = await institution_repository.count_faculties(db, institution_id, only_active=True)
        if active_faculties:
            raise InstitutionHasActiveFacultiesError(institution.nume, active_faculties)
        institution.is_active = False
        await institution_repository.flush(db)
        return await self._refreshed(db, institution_id)

    async def delete(self, db: AsyncSession, institution_id: int) -> None:
        institution = await self._get_or_404(db, institution_id)
        faculties = await institution_repository.count_faculties(db, institution_id)
        if faculties:
            raise InstitutionHasFacultiesError(institution.nume, faculties)
        await institution_repository.delete(db, institution)

    async def stats(self, db: AsyncSession, actor: User, institution_id: int) -> InstitutionStats:
        institution = await self._get_or_404(db, institution_id)
        if not institution.is_active and not is_structure_admin(actor):
            raise InactiveEntityAccessDeniedError("instituție")
        return InstitutionStats(
            institutie_id=institution.id,
            institutie_nume=institution.nume,
            numar_facultati=await institution_repository.count_faculties(db, institution_id),
            numar_departamente=await institution_repository.count_departments(db, institution_id),
            numar_sali=await institution_repository.count_rooms(db, institution_id),
            numar_sali_active=await institution_repository.count_rooms(db, institution_id, only_active=True),
        )


institution_service = InstitutionService()

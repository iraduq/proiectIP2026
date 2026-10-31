from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Department, Faculty, Institution, Room
from app.repositories.base_repository import BaseRepository, like_pattern


class InstitutionRepository(BaseRepository[Institution]):
    model = Institution

    async def list_page(
        self,
        db: AsyncSession,
        search: Optional[str],
        is_active: Optional[bool],
        oras: Optional[str],
        skip: int,
        limit: int,
    ) -> tuple[list[Institution], int]:
        stmt = select(Institution)
        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Institution.nume.ilike(pattern, escape="\\"),
                    Institution.cod.ilike(pattern, escape="\\"),
                )
            )
        if is_active is not None:
            stmt = stmt.where(Institution.is_active == is_active)
        if oras:
            stmt = stmt.where(func.lower(Institution.oras) == oras.lower())
        return await self.paginate(db, stmt, [Institution.nume.asc(), Institution.id.asc()], skip, limit)

    async def count_faculties(self, db: AsyncSession, institution_id: int, only_active: bool = False) -> int:
        stmt = select(func.count()).select_from(Faculty).where(Faculty.institutie_id == institution_id)
        if only_active:
            stmt = stmt.where(Faculty.is_active.is_(True))
        result = await db.execute(stmt)
        return result.scalar_one()

    async def count_departments(self, db: AsyncSession, institution_id: int) -> int:
        stmt = (
            select(func.count())
            .select_from(Department)
            .join(Faculty, Department.facultate_id == Faculty.id)
            .where(Faculty.institutie_id == institution_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    async def count_rooms(self, db: AsyncSession, institution_id: int, only_active: bool = False) -> int:
        stmt = (
            select(func.count())
            .select_from(Room)
            .join(Department, Room.departament_id == Department.id)
            .join(Faculty, Department.facultate_id == Faculty.id)
            .where(Faculty.institutie_id == institution_id)
        )
        if only_active:
            stmt = stmt.where(Room.is_active.is_(True))
        result = await db.execute(stmt)
        return result.scalar_one()


institution_repository = InstitutionRepository()

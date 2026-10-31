from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import Department, Faculty
from app.repositories.base_repository import BaseRepository, like_pattern


class FacultyRepository(BaseRepository[Faculty]):
    model = Faculty
    detail_options = (joinedload(Faculty.institution),)

    async def list_page(
        self,
        db: AsyncSession,
        institutie_id: Optional[int],
        search: Optional[str],
        is_active: Optional[bool],
        skip: int,
        limit: int,
    ) -> tuple[list[Faculty], int]:
        stmt = select(Faculty)
        if institutie_id is not None:
            stmt = stmt.where(Faculty.institutie_id == institutie_id)
        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Faculty.nume.ilike(pattern, escape="\\"),
                    Faculty.cod.ilike(pattern, escape="\\"),
                )
            )
        if is_active is not None:
            stmt = stmt.where(Faculty.is_active == is_active)
        return await self.paginate(db, stmt, [Faculty.nume.asc(), Faculty.id.asc()], skip, limit)

    async def count_departments(self, db: AsyncSession, faculty_id: int, only_active: bool = False) -> int:
        stmt = select(func.count()).select_from(Department).where(Department.facultate_id == faculty_id)
        if only_active:
            stmt = stmt.where(Department.is_active.is_(True))
        result = await db.execute(stmt)
        return result.scalar_one()


faculty_repository = FacultyRepository()

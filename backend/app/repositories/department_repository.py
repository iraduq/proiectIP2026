from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import Department, Faculty, Room
from app.repositories.base_repository import BaseRepository, like_pattern


class DepartmentRepository(BaseRepository[Department]):
    model = Department
    detail_options = (
        joinedload(Department.faculty).joinedload(Faculty.institution),
        joinedload(Department.sef),
    )

    async def list_page(
        self,
        db: AsyncSession,
        facultate_id: Optional[int],
        institutie_id: Optional[int],
        sef_departament_id: Optional[int],
        search: Optional[str],
        is_active: Optional[bool],
        skip: int,
        limit: int,
    ) -> tuple[list[Department], int]:
        stmt = select(Department)
        if institutie_id is not None:
            stmt = stmt.join(Faculty, Department.facultate_id == Faculty.id).where(
                Faculty.institutie_id == institutie_id
            )
        if facultate_id is not None:
            stmt = stmt.where(Department.facultate_id == facultate_id)
        if sef_departament_id is not None:
            stmt = stmt.where(Department.sef_departament_id == sef_departament_id)
        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Department.nume.ilike(pattern, escape="\\"),
                    Department.cod.ilike(pattern, escape="\\"),
                )
            )
        if is_active is not None:
            stmt = stmt.where(Department.is_active == is_active)
        return await self.paginate(db, stmt, [Department.nume.asc(), Department.id.asc()], skip, limit)

    async def count_rooms(self, db: AsyncSession, department_id: int, only_active: bool = False) -> int:
        stmt = select(func.count()).select_from(Room).where(Room.departament_id == department_id)
        if only_active:
            stmt = stmt.where(Room.is_active.is_(True))
        result = await db.execute(stmt)
        return result.scalar_one()

    async def count_headed_by(
        self,
        db: AsyncSession,
        user_id: int,
        exclude_department_id: Optional[int] = None,
    ) -> int:
        stmt = select(func.count()).select_from(Department).where(Department.sef_departament_id == user_id)
        if exclude_department_id is not None:
            stmt = stmt.where(Department.id != exclude_department_id)
        result = await db.execute(stmt)
        return result.scalar_one()


department_repository = DepartmentRepository()

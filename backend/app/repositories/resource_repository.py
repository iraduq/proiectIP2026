from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import Category, Department, Faculty, Resource, Room, StareTehnica
from app.repositories.base_repository import BaseRepository, like_pattern


class ResourceRepository(BaseRepository[Resource]):
    model = Resource
    detail_options = (
        joinedload(Resource.category),
        joinedload(Resource.room).joinedload(Room.department).joinedload(Department.faculty).joinedload(Faculty.institution),
    )

    async def get_by_cod_inventar(self, db: AsyncSession, cod_inventar: str) -> Optional[Resource]:
        stmt = (
            select(Resource)
            .where(func.lower(Resource.cod_inventar) == cod_inventar.strip().lower())
            .options(*self.detail_options)
        )
        result = await db.execute(stmt)
        return result.unique().scalars().first()

    async def list_page(
        self,
        db: AsyncSession,
        categorie_id: Optional[int] = None,
        sala_id: Optional[int] = None,
        departament_id: Optional[int] = None,
        facultate_id: Optional[int] = None,
        institutie_id: Optional[int] = None,
        stare_tehnica: Optional[StareTehnica] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Resource], int]:
        stmt = select(Resource).options(*self.detail_options)

        needs_room_join = (
            departament_id is not None
            or facultate_id is not None
            or institutie_id is not None
        )
        if needs_room_join:
            stmt = stmt.join(Room, Resource.sala_id == Room.id)
            if facultate_id is not None or institutie_id is not None:
                stmt = stmt.join(Department, Room.departament_id == Department.id)
            if institutie_id is not None:
                stmt = stmt.join(Faculty, Department.facultate_id == Faculty.id).where(
                    Faculty.institutie_id == institutie_id
                )
            if facultate_id is not None:
                stmt = stmt.where(Department.facultate_id == facultate_id)
            if departament_id is not None:
                stmt = stmt.where(Room.departament_id == departament_id)

        if categorie_id is not None:
            stmt = stmt.where(Resource.categorie_id == categorie_id)
        if sala_id is not None:
            stmt = stmt.where(Resource.sala_id == sala_id)
        if stare_tehnica is not None:
            stmt = stmt.where(Resource.stare_tehnica == stare_tehnica)
        if is_active is not None:
            stmt = stmt.where(Resource.is_active == is_active)

        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Resource.nume.ilike(pattern),
                    Resource.cod_inventar.ilike(pattern),
                    Resource.descriere.ilike(pattern),
                    Resource.specificatii.ilike(pattern),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = (await db.execute(count_stmt)).scalar_one()

        stmt = stmt.order_by(Resource.id.asc()).offset(skip).limit(limit)
        items = list((await db.execute(stmt)).unique().scalars().all())
        return items, total

from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import Department, Faculty, Room, TipSala
from app.repositories.base_repository import BaseRepository, like_pattern


class RoomRepository(BaseRepository[Room]):
    model = Room
    detail_options = (
        joinedload(Room.department).joinedload(Department.faculty).joinedload(Faculty.institution),
        joinedload(Room.responsabil),
    )

    async def list_page(
        self,
        db: AsyncSession,
        departament_id: Optional[int],
        facultate_id: Optional[int],
        institutie_id: Optional[int],
        responsabil_id: Optional[int],
        tip_sala: Optional[TipSala],
        is_active: Optional[bool],
        min_capacitate: Optional[int],
        max_capacitate: Optional[int],
        etaj: Optional[int],
        search: Optional[str],
        sort_by: Optional[str],
        sort_order: Optional[str],
        skip: int,
        limit: int,
    ) -> tuple[list[Room], int]:
        stmt = select(Room)
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
        if responsabil_id is not None:
            stmt = stmt.where(Room.responsabil_id == responsabil_id)
        if tip_sala is not None:
            stmt = stmt.where(Room.tip_sala == tip_sala)
        if is_active is not None:
            stmt = stmt.where(Room.is_active == is_active)
        if min_capacitate is not None:
            stmt = stmt.where(Room.capacitate >= min_capacitate)
        if max_capacitate is not None:
            stmt = stmt.where(Room.capacitate <= max_capacitate)
        if etaj is not None:
            stmt = stmt.where(Room.etaj == etaj)
        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Room.nume.ilike(pattern, escape="\\"),
                    Room.cod.ilike(pattern, escape="\\"),
                )
            )

        col = Room.cod
        if sort_by == "nume":
            col = Room.nume
        elif sort_by == "capacitate":
            col = Room.capacitate
        elif sort_by == "etaj":
            col = Room.etaj
        elif sort_by == "created_at":
            col = Room.created_at

        order_clauses = [col.desc(), Room.id.desc()] if sort_order == "desc" else [col.asc(), Room.id.asc()]
        return await self.paginate(db, stmt, order_clauses, skip, limit)

    async def count_active_by_responsible(
        self,
        db: AsyncSession,
        user_id: int,
        exclude_room_id: Optional[int] = None,
    ) -> int:
        stmt = (
            select(func.count())
            .select_from(Room)
            .where(Room.responsabil_id == user_id, Room.is_active.is_(True))
        )
        if exclude_room_id is not None:
            stmt = stmt.where(Room.id != exclude_room_id)
        result = await db.execute(stmt)
        return result.scalar_one()


room_repository = RoomRepository()

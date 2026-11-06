from datetime import datetime
from typing import Optional, Sequence
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import (
    Category,
    Department,
    Faculty,
    Reservation,
    Resource,
    Room,
    StareRezervare,
    User,
)
from app.repositories.base_repository import BaseRepository


class ReservationRepository(BaseRepository[Reservation]):
    model = Reservation
    detail_options = (
        joinedload(Reservation.resource).joinedload(Resource.category),
        joinedload(Reservation.resource)
        .joinedload(Resource.room)
        .joinedload(Room.department)
        .joinedload(Department.faculty),
        joinedload(Reservation.user),
    )

    async def get_detailed(self, db: AsyncSession, reservation_id: int) -> Optional[Reservation]:
        stmt = (
            select(Reservation)
            .where(Reservation.id == reservation_id)
            .options(*self.detail_options)
            .execution_options(populate_existing=True)
        )
        result = await db.execute(stmt)
        return result.unique().scalars().first()

    async def count_active_by_user(self, db: AsyncSession, user_id: int) -> int:
        stmt = (
            select(func.count(Reservation.id))
            .where(
                Reservation.utilizator_id == user_id,
                Reservation.stare.in_([StareRezervare.IN_ASTEPTARE, StareRezervare.APROBATA]),
            )
        )
        return (await db.execute(stmt)).scalar_one()

    async def get_active_by_user(self, db: AsyncSession, user_id: int) -> list[Reservation]:
        stmt = (
            select(Reservation)
            .where(
                Reservation.utilizator_id == user_id,
                Reservation.stare.in_([StareRezervare.IN_ASTEPTARE, StareRezervare.APROBATA]),
            )
            .options(*self.detail_options)
        )
        return list((await db.execute(stmt)).unique().scalars().all())

    async def find_conflicts(
        self,
        db: AsyncSession,
        resursa_id: int,
        data_inceput: datetime,
        data_sfarsit: datetime,
        exclude_reservation_id: Optional[int] = None,
    ) -> list[Reservation]:
        stmt = (
            select(Reservation)
            .where(
                Reservation.resursa_id == resursa_id,
                Reservation.stare.in_([StareRezervare.IN_ASTEPTARE, StareRezervare.APROBATA]),
                Reservation.data_inceput < data_sfarsit,
                Reservation.data_sfarsit > data_inceput,
            )
        )
        if exclude_reservation_id is not None:
            stmt = stmt.where(Reservation.id != exclude_reservation_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def list_page(
        self,
        db: AsyncSession,
        utilizator_id: Optional[int] = None,
        resursa_id: Optional[int] = None,
        facultate_id: Optional[int] = None,
        stare: Optional[StareRezervare] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Reservation], int]:
        stmt = select(Reservation).options(*self.detail_options)

        if facultate_id is not None:
            stmt = (
                stmt.join(Resource, Reservation.resursa_id == Resource.id)
                .join(Room, Resource.sala_id == Room.id)
                .join(Department, Room.departament_id == Department.id)
                .where(Department.facultate_id == facultate_id)
            )

        if utilizator_id is not None:
            stmt = stmt.where(Reservation.utilizator_id == utilizator_id)
        if resursa_id is not None:
            stmt = stmt.where(Reservation.resursa_id == resursa_id)
        if stare is not None:
            stmt = stmt.where(Reservation.stare == stare)

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = (await db.execute(count_stmt)).scalar_one()

        stmt = stmt.order_by(Reservation.created_at.desc()).offset(skip).limit(limit)
        items = list((await db.execute(stmt)).unique().scalars().all())
        return items, total

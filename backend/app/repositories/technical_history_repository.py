from typing import Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models import TechnicalHistory, Resource, User
from app.repositories.base_repository import BaseRepository


class TechnicalHistoryRepository(BaseRepository[TechnicalHistory]):
    model = TechnicalHistory
    detail_options = (
        joinedload(TechnicalHistory.resource),
        joinedload(TechnicalHistory.user),
    )

    async def get_detailed(self, db: AsyncSession, history_id: int) -> Optional[TechnicalHistory]:
        stmt = (
            select(TechnicalHistory)
            .where(TechnicalHistory.id == history_id)
            .options(*self.detail_options)
            .execution_options(populate_existing=True)
        )
        result = await db.execute(stmt)
        return result.unique().scalars().first()

    async def list_page(
        self,
        db: AsyncSession,
        resursa_id: Optional[int] = None,
        utilizator_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[TechnicalHistory], int]:
        stmt = select(TechnicalHistory).options(*self.detail_options)

        if resursa_id is not None:
            stmt = stmt.where(TechnicalHistory.resursa_id == resursa_id)
        if utilizator_id is not None:
            stmt = stmt.where(TechnicalHistory.utilizator_id == utilizator_id)

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = (await db.execute(count_stmt)).scalar_one()

        stmt = stmt.order_by(TechnicalHistory.created_at.desc()).offset(skip).limit(limit)
        items = list((await db.execute(stmt)).unique().scalars().all())
        return items, total

from typing import Optional
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Category, Resource
from app.repositories.base_repository import BaseRepository, like_pattern


class CategoryRepository(BaseRepository[Category]):
    model = Category

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Category]:
        stmt = select(Category).where(func.lower(Category.nume) == name.strip().lower())
        result = await db.execute(stmt)
        return result.scalars().first()

    async def list_page(
        self,
        db: AsyncSession,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Category], int]:
        stmt = select(Category)
        if is_active is not None:
            stmt = stmt.where(Category.is_active == is_active)
        if search:
            pattern = like_pattern(search)
            stmt = stmt.where(
                or_(
                    Category.nume.ilike(pattern),
                    Category.descriere.ilike(pattern),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = (await db.execute(count_stmt)).scalar_one()

        stmt = stmt.order_by(Category.nume.asc()).offset(skip).limit(limit)
        items = list((await db.execute(stmt)).scalars().all())
        return items, total

    async def count_resources(self, db: AsyncSession, category_id: int) -> int:
        stmt = select(func.count(Resource.id)).where(Resource.categorie_id == category_id)
        return (await db.execute(stmt)).scalar_one()

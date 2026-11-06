from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    PaginatedResponse,
)
from app.db.models import Category, User
from app.exceptions.exceptions import CategoryAlreadyExistsError, CategoryNotFoundError
from app.repositories.category_repository import CategoryRepository
from app.utils.access import is_structure_admin

category_repository = CategoryRepository()


class CategoryService:
    async def get_by_id(self, db: AsyncSession, category_id: int) -> Category:
        category = await category_repository.get_by_id(db, category_id)
        if not category:
            raise CategoryNotFoundError(category_id)
        return category

    async def list_page(
        self,
        db: AsyncSession,
        actor: Optional[User] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> PaginatedResponse[CategoryResponse]:
        effective_active = is_active
        if actor and not is_structure_admin(actor):
            effective_active = True

        items, total = await category_repository.list_page(
            db, search=search, is_active=effective_active, skip=skip, limit=limit
        )

        result_items = []
        for cat in items:
            count = await category_repository.count_resources(db, cat.id)
            result_items.append(
                CategoryResponse(
                    id=cat.id,
                    nume=cat.nume,
                    descriere=cat.descriere,
                    is_active=cat.is_active,
                    created_at=cat.created_at,
                    updated_at=cat.updated_at,
                    resources_count=count,
                )
            )

        return PaginatedResponse(items=result_items, total=total, skip=skip, limit=limit)

    async def create(self, db: AsyncSession, actor: User, data: CategoryCreate) -> CategoryResponse:
        existing = await category_repository.get_by_name(db, data.nume)
        if existing:
            raise CategoryAlreadyExistsError(data.nume)

        cat = Category(
            nume=data.nume.strip(),
            descriere=data.descriere.strip() if data.descriere else None,
            is_active=True,
        )
        await category_repository.add(db, cat)
        await db.commit()
        await db.refresh(cat)
        return CategoryResponse(
            id=cat.id,
            nume=cat.nume,
            descriere=cat.descriere,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at,
            resources_count=0,
        )

    async def update(
        self, db: AsyncSession, actor: User, category_id: int, data: CategoryUpdate
    ) -> CategoryResponse:
        cat = await self.get_by_id(db, category_id)
        changes = data.model_dump(exclude_unset=True)

        if "nume" in changes and changes["nume"]:
            new_name = changes["nume"].strip()
            existing = await category_repository.get_by_name(db, new_name)
            if existing and existing.id != category_id:
                raise CategoryAlreadyExistsError(new_name)
            cat.nume = new_name

        if "descriere" in changes:
            cat.descriere = changes["descriere"].strip() if changes["descriere"] else None

        if "is_active" in changes and changes["is_active"] is not None:
            cat.is_active = changes["is_active"]

        await db.commit()
        await db.refresh(cat)
        count = await category_repository.count_resources(db, cat.id)
        return CategoryResponse(
            id=cat.id,
            nume=cat.nume,
            descriere=cat.descriere,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at,
            resources_count=count,
        )

    async def delete(self, db: AsyncSession, actor: User, category_id: int) -> None:
        cat = await self.get_by_id(db, category_id)
        count = await category_repository.count_resources(db, category_id)
        if count > 0:
            # Soft delete if contains resources
            cat.is_active = False
            await db.commit()
        else:
            await category_repository.delete(db, cat)
            await db.commit()


category_service = CategoryService()

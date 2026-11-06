from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    PaginatedResponse,
)
from app.db.database import get_db
from app.db.models import User
from app.dependencies.auth import get_current_user, require_permission
from app.services.category_services import category_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=PaginatedResponse[CategoryResponse])
async def list_categories(
    search: Optional[str] = Query(default=None, max_length=100),
    is_active: Optional[bool] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse[CategoryResponse]:
    return await category_service.list_page(
        db, actor=current_user, search=search, is_active=is_active, skip=skip, limit=limit
    )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> CategoryResponse:
    cat = await category_service.get_by_id(db, category_id)
    return CategoryResponse(
        id=cat.id,
        nume=cat.nume,
        descriere=cat.descriere,
        is_active=cat.is_active,
        created_at=cat.created_at,
        updated_at=cat.updated_at,
    )


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> CategoryResponse:
    return await category_service.create(db, current_user, data)


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> CategoryResponse:
    return await category_service.update(db, current_user, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> Response:
    await category_service.delete(db, current_user, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionStats,
    InstitutionUpdate,
    Page,
)
from app.db.database import get_db
from app.db.models import User
from app.dependencies.auth import require_permission
from app.services.institution_services import institution_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/institutions", tags=["Institutions"])


@router.post(
    "",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Resursa nu a fost găsită."},
        409: {"description": "Denumire sau cod deja existente."},
    },
)
async def create_institution(
    data: InstitutionCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> InstitutionResponse:
    return await institution_service.create(db, data)


@router.get("", response_model=Page[InstitutionResponse])
async def list_institutions(
    search: Optional[str] = Query(default=None, max_length=100),
    is_active: Optional[bool] = Query(default=None),
    oras: Optional[str] = Query(default=None, max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> Page[InstitutionResponse]:
    return await institution_service.list_page(db, current_user, search, is_active, oras, skip, limit)


@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(
    institution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> InstitutionResponse:
    return await institution_service.get(db, current_user, institution_id)


@router.get("/{institution_id}/stats", response_model=InstitutionStats)
async def get_institution_stats(
    institution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> InstitutionStats:
    return await institution_service.stats(db, current_user, institution_id)


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: int,
    data: InstitutionUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> InstitutionResponse:
    return await institution_service.update(db, institution_id, data)


@router.post("/{institution_id}/activate", response_model=InstitutionResponse)
async def activate_institution(
    institution_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> InstitutionResponse:
    return await institution_service.activate(db, institution_id)


@router.post("/{institution_id}/deactivate", response_model=InstitutionResponse)
async def deactivate_institution(
    institution_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> InstitutionResponse:
    return await institution_service.deactivate(db, institution_id)


@router.delete("/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(
    institution_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> Response:
    await institution_service.delete(db, institution_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

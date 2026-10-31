from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import FacultyCreate, FacultyResponse, FacultyUpdate, Page
from app.db.database import get_db
from app.db.models import User
from app.dependencies.auth import require_permission
from app.services.faculty_services import faculty_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/faculties", tags=["Faculties"])


@router.post(
    "",
    response_model=FacultyResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Instituția nu a fost găsită."},
        409: {"description": "Instituție inactivă sau denumire/cod deja existente."},
    },
)
async def create_faculty(
    data: FacultyCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> FacultyResponse:
    return await faculty_service.create(db, data)


@router.get("", response_model=Page[FacultyResponse])
async def list_faculties(
    institutie_id: Optional[int] = Query(default=None, gt=0),
    search: Optional[str] = Query(default=None, max_length=100),
    is_active: Optional[bool] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> Page[FacultyResponse]:
    return await faculty_service.list_page(db, current_user, institutie_id, search, is_active, skip, limit)


@router.get("/{faculty_id}", response_model=FacultyResponse)
async def get_faculty(
    faculty_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> FacultyResponse:
    return await faculty_service.get(db, current_user, faculty_id)


@router.patch("/{faculty_id}", response_model=FacultyResponse)
async def update_faculty(
    faculty_id: int,
    data: FacultyUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> FacultyResponse:
    return await faculty_service.update(db, faculty_id, data)


@router.post("/{faculty_id}/activate", response_model=FacultyResponse)
async def activate_faculty(
    faculty_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> FacultyResponse:
    return await faculty_service.activate(db, faculty_id)


@router.post("/{faculty_id}/deactivate", response_model=FacultyResponse)
async def deactivate_faculty(
    faculty_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> FacultyResponse:
    return await faculty_service.deactivate(db, faculty_id)


@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faculty(
    faculty_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> Response:
    await faculty_service.delete(db, faculty_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

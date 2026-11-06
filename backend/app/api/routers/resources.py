from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)
from app.db.database import get_db
from app.db.models import StareTehnica, User
from app.dependencies.auth import get_current_user, require_permission
from app.services.resource_services import resource_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=PaginatedResponse[ResourceResponse])
async def list_resources(
    categorie_id: Optional[int] = Query(default=None, gt=0),
    sala_id: Optional[int] = Query(default=None, gt=0),
    departament_id: Optional[int] = Query(default=None, gt=0),
    facultate_id: Optional[int] = Query(default=None, gt=0),
    institutie_id: Optional[int] = Query(default=None, gt=0),
    stare_tehnica: Optional[StareTehnica] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.RESOURCES_READ)),
) -> PaginatedResponse[ResourceResponse]:
    return await resource_service.list_page(
        db,
        actor=current_user,
        categorie_id=categorie_id,
        sala_id=sala_id,
        departament_id=departament_id,
        facultate_id=facultate_id,
        institutie_id=institutie_id,
        stare_tehnica=stare_tehnica,
        is_active=is_active,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.RESOURCES_READ)),
) -> ResourceResponse:
    res = await resource_service.get_by_id(db, resource_id, actor=current_user)
    return resource_service._to_response(res)


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    data: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.RESOURCES_CREATE)),
) -> ResourceResponse:
    return await resource_service.create(db, current_user, data)


@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int,
    data: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.RESOURCES_UPDATE)),
) -> ResourceResponse:
    return await resource_service.update(db, current_user, resource_id, data)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.RESOURCES_DELETE)),
) -> Response:
    await resource_service.delete(db, current_user, resource_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import Page, RoomCreate, RoomResponse, RoomResponsibleAssign, RoomUpdate
from app.db.database import get_db
from app.db.models import TipSala, User
from app.dependencies.auth import require_permission
from app.services.room_services import room_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.post(
    "",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Responsabil invalid sau capacitate în afara limitelor tipului de sală."},
        404: {"description": "Departamentul sau responsabilul nu au fost găsiți."},
        409: {"description": "Departament inactiv, duplicat sau limită de săli per responsabil depășită."},
    },
)
async def create_room(
    data: RoomCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> RoomResponse:
    return await room_service.create(db, data)


@router.get("", response_model=Page[RoomResponse])
async def list_rooms(
    departament_id: Optional[int] = Query(default=None, gt=0),
    facultate_id: Optional[int] = Query(default=None, gt=0),
    institutie_id: Optional[int] = Query(default=None, gt=0),
    responsabil_id: Optional[int] = Query(default=None, gt=0),
    tip_sala: Optional[TipSala] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    min_capacitate: Optional[int] = Query(default=None, ge=1, le=200),
    search: Optional[str] = Query(default=None, max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> Page[RoomResponse]:
    return await room_service.list_page(
        db,
        current_user,
        departament_id,
        facultate_id,
        institutie_id,
        responsabil_id,
        tip_sala,
        is_active,
        min_capacitate,
        search,
        skip,
        limit,
    )


@router.get("/my", response_model=Page[RoomResponse])
async def list_my_rooms(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> Page[RoomResponse]:
    return await room_service.list_mine(db, current_user, skip, limit)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> RoomResponse:
    return await room_service.get(db, current_user, room_id)


@router.patch(
    "/{room_id}",
    response_model=RoomResponse,
    responses={
        403: {"description": "Doar administratorul sau responsabilul sălii poate modifica sala."},
    },
)
async def update_room(
    room_id: int,
    data: RoomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> RoomResponse:
    return await room_service.update(db, current_user, room_id, data)


@router.put("/{room_id}/responsible", response_model=RoomResponse)
async def assign_room_responsible(
    room_id: int,
    data: RoomResponsibleAssign,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> RoomResponse:
    return await room_service.assign_responsible(db, room_id, data.responsabil_id)


@router.post("/{room_id}/activate", response_model=RoomResponse)
async def activate_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> RoomResponse:
    return await room_service.activate(db, room_id)


@router.post("/{room_id}/deactivate", response_model=RoomResponse)
async def deactivate_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> RoomResponse:
    return await room_service.deactivate(db, room_id)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> Response:
    await room_service.delete(db, room_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

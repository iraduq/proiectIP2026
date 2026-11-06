from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    ReservationCreate,
    ReservationResponse,
    ReservationStatusUpdate,
    StudentQuotaResponse,
)
from app.db.database import get_db
from app.db.models import StareRezervare, User
from app.dependencies.auth import get_current_user, require_permission
from app.services.reservation_services import reservation_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.get("/quota", response_model=StudentQuotaResponse)
async def get_my_quota(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentQuotaResponse:
    return await reservation_service.get_student_quota(db, current_user)


@router.get("", response_model=PaginatedResponse[ReservationResponse])
async def list_reservations(
    utilizator_id: Optional[int] = Query(default=None, gt=0),
    resursa_id: Optional[int] = Query(default=None, gt=0),
    stare: Optional[StareRezervare] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_READ)),
) -> PaginatedResponse[ReservationResponse]:
    return await reservation_service.list_page(
        db,
        actor=current_user,
        utilizator_id=utilizator_id,
        resursa_id=resursa_id,
        stare=stare,
        skip=skip,
        limit=limit,
    )


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_READ)),
) -> ReservationResponse:
    res = await reservation_service.get_by_id(db, reservation_id, actor=current_user)
    return reservation_service._to_response(res)


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_CREATE)),
) -> ReservationResponse:
    return await reservation_service.create(db, current_user, data)


@router.patch("/{reservation_id}/status", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: int,
    data: ReservationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReservationResponse:
    return await reservation_service.update_status(db, current_user, reservation_id, data)


@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_CANCEL)),
) -> ReservationResponse:
    return await reservation_service.update_status(
        db, current_user, reservation_id, ReservationStatusUpdate(stare=StareRezervare.ANULATA)
    )


@router.post("/{reservation_id}/approve", response_model=ReservationResponse)
async def approve_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_APPROVE)),
) -> ReservationResponse:
    return await reservation_service.update_status(
        db, current_user, reservation_id, ReservationStatusUpdate(stare=StareRezervare.APROBATA)
    )


@router.post("/{reservation_id}/reject", response_model=ReservationResponse)
async def reject_reservation(
    reservation_id: int,
    reason: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_APPROVE)),
) -> ReservationResponse:
    return await reservation_service.update_status(
        db,
        current_user,
        reservation_id,
        ReservationStatusUpdate(stare=StareRezervare.RESPINSA, motiv_respingere=reason),
    )


@router.post("/{reservation_id}/return", response_model=ReservationResponse)
async def return_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.BOOKINGS_RETURN)),
) -> ReservationResponse:
    return await reservation_service.update_status(
        db, current_user, reservation_id, ReservationStatusUpdate(stare=StareRezervare.FINALIZATA)
    )

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    TechnicalHistoryCreate,
    TechnicalHistoryResponse,
)
from app.db.database import get_db
from app.db.models import User
from app.dependencies.auth import require_permission
from app.services.technical_history_services import technical_history_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/technical-history", tags=["Technical History"])


@router.get("", response_model=PaginatedResponse[TechnicalHistoryResponse])
async def list_technical_history(
    resursa_id: Optional[int] = Query(default=None, gt=0),
    utilizator_id: Optional[int] = Query(default=None, gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.TECHNICAL_HISTORY_READ)),
) -> PaginatedResponse[TechnicalHistoryResponse]:
    return await technical_history_service.list_page(
        db, resursa_id=resursa_id, utilizator_id=utilizator_id, skip=skip, limit=limit
    )


@router.get("/{history_id}", response_model=TechnicalHistoryResponse)
async def get_technical_history(
    history_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.TECHNICAL_HISTORY_READ)),
) -> TechnicalHistoryResponse:
    item = await technical_history_service.get_by_id(db, history_id)
    return technical_history_service._to_response(item)


@router.post("", response_model=TechnicalHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_technical_history(
    data: TechnicalHistoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.TECHNICAL_HISTORY_CREATE)),
) -> TechnicalHistoryResponse:
    return await technical_history_service.create(db, current_user, data)

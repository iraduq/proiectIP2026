from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.academic import DepartmentCreate, DepartmentResponse, DepartmentUpdate, Page
from app.db.database import get_db
from app.db.models import User
from app.dependencies.auth import require_permission
from app.services.department_services import department_service
from app.utils.roles import PermissionCode

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Facultatea sau șeful de departament nu au fost găsiți."},
        409: {"description": "Facultate inactivă, duplicat sau limită de departamente depășită."},
    },
)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> DepartmentResponse:
    return await department_service.create(db, data)


@router.get("", response_model=Page[DepartmentResponse])
async def list_departments(
    facultate_id: Optional[int] = Query(default=None, gt=0),
    institutie_id: Optional[int] = Query(default=None, gt=0),
    sef_departament_id: Optional[int] = Query(default=None, gt=0),
    search: Optional[str] = Query(default=None, max_length=100),
    is_active: Optional[bool] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> Page[DepartmentResponse]:
    return await department_service.list_page(
        db, current_user, facultate_id, institutie_id, sef_departament_id, search, is_active, skip, limit
    )


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission(PermissionCode.STRUCTURE_READ)),
) -> DepartmentResponse:
    return await department_service.get(db, current_user, department_id)


@router.patch("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> DepartmentResponse:
    return await department_service.update(db, department_id, data)


@router.post("/{department_id}/activate", response_model=DepartmentResponse)
async def activate_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> DepartmentResponse:
    return await department_service.activate(db, department_id)


@router.post("/{department_id}/deactivate", response_model=DepartmentResponse)
async def deactivate_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> DepartmentResponse:
    return await department_service.deactivate(db, department_id)


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_permission(PermissionCode.STRUCTURE_MANAGE)),
) -> Response:
    await department_service.delete(db, department_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

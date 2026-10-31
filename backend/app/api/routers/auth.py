from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.auth import Token
from app.api.schemas.users import LoginSchema, UserCreate, UserResponse
from app.config import settings
from app.db.database import get_db
from app.db.models import User, UserRole
from app.dependencies.auth import get_current_user
from app.services.auth_services import auth_service
from app.utils.roles import get_role_permissions

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Parolă invalidă sau date incorecte."},
        409: {"description": "Adresa de email este deja înregistrată."},
    },
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    return await auth_service.register(db, user_data)


@router.post(
    "/login",
    response_model=Token,
    responses={
        401: {"description": "Credențiale incorecte."},
    },
)
async def login(
    credentials: LoginSchema,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Token:
    token_data = await auth_service.login(db, credentials)
    is_secure = settings.environment.lower() == "production"
    response.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        path="/",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return token_data


@router.post("/token", response_model=Token, include_in_schema=False)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    token_data = await auth_service.login(db, LoginSchema(email=form_data.username, password=form_data.password))
    is_secure = settings.environment.lower() == "production"
    response.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        path="/",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return token_data


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Deconectare realizată cu succes."},
    },
)
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Deconectare realizată cu succes"}


@router.get(
    "/me",
    response_model=UserResponse,
    responses={
        401: {"description": "Neautorizat."},
    },
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    permissions = [p.code for p in current_user.role_rel.permissions] if current_user.role_rel else []
    resolved_role = UserRole(current_user.role_rel.name) if current_user.role_rel else UserRole.STUDENT
    return UserResponse(
        id_utilizator=current_user.id_utilizator,
        nume=current_user.nume,
        email=current_user.email,
        rol=resolved_role,
        numar_matricol=current_user.numar_matricol,
        id_angajat=current_user.id_angajat,
        is_active=current_user.is_active,
        permissions=permissions,
        created_at=current_user.created_at,
    )

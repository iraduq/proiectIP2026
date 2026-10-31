from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.auth import Token
from app.api.schemas.users import LoginSchema, UserCreate, UserResponse
from app.db.models import UserRole
from app.exceptions.exceptions import (
    InvalidCredentialsError,
    PasswordValidationError,
    UnauthorizedAccessError,
    UserEmailAlreadyExistsError,
)
from app.repositories.auth_repository import auth_repository
from app.utils.security import create_access_token, get_password_hash, is_password_strong, verify_password


class AuthService:
    async def register(self, db: AsyncSession, data: UserCreate) -> UserResponse:
        if not is_password_strong(data.password):
            raise PasswordValidationError()

        existing_user = await auth_repository.get_by_email(db, data.email)
        if existing_user:
            raise UserEmailAlreadyExistsError(data.email)

        hashed_pw = get_password_hash(data.password)
        user = await auth_repository.create(db, data, hashed_pw)
        permissions = [p.code for p in user.role_rel.permissions] if user.role_rel else []
        resolved_role = UserRole(user.role_rel.name) if user.role_rel else data.rol

        return UserResponse(
            id_utilizator=user.id_utilizator,
            nume=user.nume,
            email=user.email,
            rol=resolved_role,
            numar_matricol=user.numar_matricol,
            id_angajat=user.id_angajat,
            facultate_id=user.facultate_id,
            facultate_nume=user.faculty.nume if user.faculty else None,
            facultate_cod=user.faculty.cod if user.faculty else None,
            is_active=user.is_active,
            permissions=permissions,
            created_at=user.created_at,
        )

    async def login(self, db: AsyncSession, data: LoginSchema) -> Token:
        user = await auth_repository.get_by_email(db, data.email)
        if not user or not verify_password(data.password, user.parola_hash):
            raise InvalidCredentialsError()

        if not user.is_active:
            raise UnauthorizedAccessError("Contul tău a fost dezactivat. Contactează administratorul.")

        permissions = [p.code for p in user.role_rel.permissions] if user.role_rel else []
        role_name = user.role_rel.name if user.role_rel else UserRole.STUDENT.value

        token_payload = {
            "sub": str(user.id_utilizator),
            "email": user.email,
            "role": role_name,
            "permissions": permissions,
        }
        access_token = create_access_token(token_payload)
        return Token(access_token=access_token)


auth_service = AuthService()

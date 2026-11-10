from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from app.api.schemas.users import UserCreate
from app.db.models import Faculty, Role, User, UserRole


class AuthRepository:
    async def get_role_by_name(self, db: AsyncSession, role_name: str) -> Optional[Role]:
        result = await db.execute(select(Role).where(Role.nume == role_name))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(
                joinedload(User.role_rel).selectinload(Role.permissions),
                joinedload(User.faculty),
            )
            .where(User.email == email)
        )
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(
                joinedload(User.role_rel).selectinload(Role.permissions),
                joinedload(User.faculty),
            )
            .where(User.id_utilizator == user_id)
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, user_data: UserCreate, password_hash: str) -> User:
        role = await self.get_role_by_name(db, user_data.rol.value)
        if not role:
            role = Role(nume=user_data.rol.value, descriere=f"Rol {user_data.rol.value}")
            db.add(role)
            await db.flush()

        resolved_facultate_id = user_data.facultate_id
        if resolved_facultate_id is None and user_data.rol == UserRole.STUDENT:
            first_fac = (await db.execute(select(Faculty).order_by(Faculty.id.asc()))).scalars().first()
            if first_fac:
                resolved_facultate_id = first_fac.id

        full_name = f"{user_data.first_name} {user_data.last_name}"
        user = User(
            nume=full_name,
            email=user_data.email,
            parola_hash=password_hash,
            rol_id=role.id,
            numar_matricol=user_data.numar_matricol,
            id_angajat=user_data.id_angajat,
            facultate_id=resolved_facultate_id,
            este_activ=True,
        )
        db.add(user)
        await db.flush()
        return await self.get_by_id(db, user.id_utilizator)


auth_repository = AuthRepository()

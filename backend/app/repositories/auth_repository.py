from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from app.api.schemas.users import UserCreate
from app.db.models import Role, User


class AuthRepository:
    async def get_role_by_name(self, db: AsyncSession, role_name: str) -> Optional[Role]:
        result = await db.execute(select(Role).where(Role.name == role_name))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(joinedload(User.role_rel).selectinload(Role.permissions))
            .where(User.email == email)
        )
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(joinedload(User.role_rel).selectinload(Role.permissions))
            .where(User.id_utilizator == user_id)
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, user_data: UserCreate, password_hash: str) -> User:
        role = await self.get_role_by_name(db, user_data.rol.value)
        if not role:
            role = Role(name=user_data.rol.value, description=f"Rol {user_data.rol.value}")
            db.add(role)
            await db.flush()

        full_name = f"{user_data.first_name} {user_data.last_name}"
        user = User(
            nume=full_name,
            email=user_data.email,
            parola_hash=password_hash,
            role_id=role.id,
            numar_matricol=user_data.numar_matricol,
            id_angajat=user_data.id_angajat,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        return await self.get_by_id(db, user.id_utilizator)


auth_repository = AuthRepository()

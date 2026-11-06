from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)
from app.db.models import Resource, StareTehnica, User, UserRole
from app.exceptions.academic_exceptions import RoomInactiveError
from app.exceptions.exceptions import (
    AppException,
    CategoryNotFoundError,
    ResourceNotFoundError,
    RoomNotFoundError,
    UnauthorizedAccessError,
)
from app.repositories.category_repository import CategoryRepository
from app.repositories.resource_repository import ResourceRepository
from app.repositories.room_repository import room_repository
from app.utils.access import is_structure_admin, is_student

resource_repository = ResourceRepository()
category_repository = CategoryRepository()


class ResourceCodeAlreadyExistsError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Există deja o resursă cu codul de inventar '{code}'.",
            status_code=409,
            code="resource_code_already_exists",
        )


class ResourceService:
    def _to_response(self, res: Resource) -> ResourceResponse:
        room = res.room
        dept = room.department if room else None
        faculty = dept.faculty if dept else None
        institution = faculty.institution if faculty else None

        return ResourceResponse(
            id=res.id,
            nume=res.nume,
            cod_inventar=res.cod_inventar,
            categorie_id=res.categorie_id,
            categorie_nume=res.category.nume if res.category else None,
            sala_id=res.sala_id,
            sala_cod=room.cod if room else None,
            sala_nume=room.nume if room else None,
            departament_id=dept.id if dept else None,
            departament_nume=dept.nume if dept else None,
            facultate_id=faculty.id if faculty else None,
            facultate_nume=faculty.nume if faculty else None,
            institutie_id=institution.id if institution else None,
            institutie_nume=institution.nume if institution else None,
            stare_tehnica=res.stare_tehnica,
            descriere=res.descriere,
            specificatii=res.specificatii,
            is_active=res.is_active,
            created_at=res.created_at,
            updated_at=res.updated_at,
        )

    async def get_by_id(self, db: AsyncSession, resource_id: int, actor: Optional[User] = None) -> Resource:
        res = await resource_repository.get_detailed(db, resource_id)
        if not res:
            raise ResourceNotFoundError(resource_id)

        # Scoping check for students
        if actor and is_student(actor):
            room = res.room
            dept = room.department if room else None
            fac_id = dept.facultate_id if dept else None
            if fac_id != actor.facultate_id:
                raise ResourceNotFoundError(resource_id)

        return res

    async def list_page(
        self,
        db: AsyncSession,
        actor: Optional[User] = None,
        categorie_id: Optional[int] = None,
        sala_id: Optional[int] = None,
        departament_id: Optional[int] = None,
        facultate_id: Optional[int] = None,
        institutie_id: Optional[int] = None,
        stare_tehnica: Optional[StareTehnica] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> PaginatedResponse[ResourceResponse]:
        effective_active = is_active
        effective_facultate_id = facultate_id

        if actor and is_student(actor):
            effective_active = True
            effective_facultate_id = actor.facultate_id
        elif actor and not is_structure_admin(actor):
            if is_active is None:
                effective_active = True

        items, total = await resource_repository.list_page(
            db,
            categorie_id=categorie_id,
            sala_id=sala_id,
            departament_id=departament_id,
            facultate_id=effective_facultate_id,
            institutie_id=institutie_id,
            stare_tehnica=stare_tehnica,
            is_active=effective_active,
            search=search.strip() if search else None,
            skip=skip,
            limit=limit,
        )

        return PaginatedResponse(
            items=[self._to_response(item) for item in items],
            total=total,
            skip=skip,
            limit=limit,
        )

    async def create(self, db: AsyncSession, actor: User, data: ResourceCreate) -> ResourceResponse:
        existing_code = await resource_repository.get_by_cod_inventar(db, data.cod_inventar)
        if existing_code:
            raise ResourceCodeAlreadyExistsError(data.cod_inventar)

        category = await category_repository.get_by_id(db, data.categorie_id)
        if not category:
            raise CategoryNotFoundError(data.categorie_id)

        room = await room_repository.get_by_id(db, data.sala_id)
        if not room:
            raise RoomNotFoundError(data.sala_id)
        if not room.is_active:
            raise RoomInactiveError(room.cod)

        res = Resource(
            nume=data.nume.strip(),
            cod_inventar=data.cod_inventar.strip(),
            categorie_id=data.categorie_id,
            sala_id=data.sala_id,
            descriere=data.descriere.strip() if data.descriere else None,
            specificatii=data.specificatii.strip() if data.specificatii else None,
            stare_tehnica=data.stare_tehnica,
            is_active=True,
        )
        await resource_repository.add(db, res)
        await db.commit()

        detailed = await resource_repository.get_detailed(db, res.id)
        return self._to_response(detailed or res)

    async def update(
        self, db: AsyncSession, actor: User, resource_id: int, data: ResourceUpdate
    ) -> ResourceResponse:
        res = await self.get_by_id(db, resource_id)
        changes = data.model_dump(exclude_unset=True)

        if "cod_inventar" in changes and changes["cod_inventar"]:
            new_code = changes["cod_inventar"].strip()
            existing = await resource_repository.get_by_cod_inventar(db, new_code)
            if existing and existing.id != resource_id:
                raise ResourceCodeAlreadyExistsError(new_code)
            res.cod_inventar = new_code

        if "nume" in changes and changes["nume"]:
            res.nume = changes["nume"].strip()

        if "categorie_id" in changes and changes["categorie_id"]:
            cat = await category_repository.get_by_id(db, changes["categorie_id"])
            if not cat:
                raise CategoryNotFoundError(changes["categorie_id"])
            res.categorie_id = changes["categorie_id"]

        if "sala_id" in changes and changes["sala_id"]:
            new_room = await room_repository.get_by_id(db, changes["sala_id"])
            if not new_room:
                raise RoomNotFoundError(changes["sala_id"])
            if new_room.id != res.sala_id:
                old_room = await room_repository.get_by_id(db, res.sala_id)
                res.sala_id = new_room.id
                from app.db.models import TechnicalHistory
                from app.repositories.technical_history_repository import TechnicalHistoryRepository
                tech_repo = TechnicalHistoryRepository()
                old_code = old_room.cod if old_room else str(res.sala_id)
                th = TechnicalHistory(
                    resursa_id=res.id,
                    utilizator_id=actor.id_utilizator,
                    tip_interventie="TRANSFER_SALA",
                    descriere=f"Echipament transferat din sala {old_code} in sala {new_room.cod} de catre {actor.nume}.",
                    stare_anterioara=res.stare_tehnica,
                    stare_noua=res.stare_tehnica,
                )
                await tech_repo.add(db, th)

        if "descriere" in changes:
            res.descriere = changes["descriere"].strip() if changes["descriere"] else None

        if "specificatii" in changes:
            res.specificatii = changes["specificatii"].strip() if changes["specificatii"] else None

        if "stare_tehnica" in changes and changes["stare_tehnica"]:
            stare_veche = res.stare_tehnica
            stare_noua = changes["stare_tehnica"]
            if stare_noua != stare_veche:
                res.stare_tehnica = stare_noua
                from app.db.models import TechnicalHistory
                from app.repositories.technical_history_repository import TechnicalHistoryRepository
                tech_repo = TechnicalHistoryRepository()
                th = TechnicalHistory(
                    resursa_id=res.id,
                    utilizator_id=actor.id_utilizator,
                    tip_interventie="MODIFICARE_STARE_TEHNICA",
                    descriere=f"Stare modificata din {stare_veche.value} in {stare_noua.value} de catre {actor.nume}.",
                    stare_anterioara=stare_veche,
                    stare_noua=stare_noua,
                )
                await tech_repo.add(db, th)

                if stare_noua in [StareTehnica.DEFECTA, StareTehnica.IN_MENTENANTA]:
                    from app.db.models import Reservation, StareRezervare
                    from sqlalchemy import select
                    pending_query = select(Reservation).where(
                        Reservation.resursa_id == res.id,
                        Reservation.stare == StareRezervare.IN_ASTEPTARE,
                    )
                    pending_items = (await db.execute(pending_query)).scalars().all()
                    for pres in pending_items:
                        pres.stare = StareRezervare.RESPINSA
                        pres.motiv_respingere = f"Resursa a devenit indisponibila: {stare_noua.value}."
            else:
                res.stare_tehnica = stare_noua

        if "is_active" in changes and changes["is_active"] is not None:
            res.is_active = changes["is_active"]

        await db.commit()
        detailed = await resource_repository.get_detailed(db, res.id)
        return self._to_response(detailed or res)

    async def delete(self, db: AsyncSession, actor: User, resource_id: int) -> None:
        res = await self.get_by_id(db, resource_id)
        # Soft-delete resource to preserve reservation and technical history integrity
        res.is_active = False
        await db.commit()


resource_service = ResourceService()

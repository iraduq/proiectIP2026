from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    DayAvailability,
    HourlySlot,
    PaginatedResponse,
    ResourceAvailabilityResponse,
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
        res.is_active = False
        await db.commit()

    async def get_availability(
        self,
        db: AsyncSession,
        resource_id: int,
        start_date: Optional[str] = None,
        days_count: int = 5,
    ) -> ResourceAvailabilityResponse:
        res = await self.get_by_id(db, resource_id)
        from datetime import datetime, date, time, timedelta, timezone
        from sqlalchemy import select
        from app.db.models import Reservation, StareRezervare

        if start_date:
            base_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        else:
            base_date = datetime.now(timezone.utc).date()

        ro_days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"]
        hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

        window_start = datetime.combine(base_date, time(0, 0), tzinfo=timezone.utc)
        window_end = datetime.combine(base_date + timedelta(days=days_count), time(23, 59), tzinfo=timezone.utc)

        stmt = select(Reservation).where(
            Reservation.resursa_id == resource_id,
            Reservation.stare.in_([StareRezervare.IN_ASTEPTARE, StareRezervare.APROBATA]),
            Reservation.data_inceput < window_end,
            Reservation.data_sfarsit > window_start,
        )
        existing_res = (await db.execute(stmt)).scalars().all()

        zile: list[DayAvailability] = []
        for d in range(days_count):
            cur_date = base_date + timedelta(days=d)
            weekday_idx = cur_date.weekday()
            zi_nume = ro_days[weekday_idx]

            slots: list[HourlySlot] = []
            for h in hours:
                h_val = int(h.split(":")[0])
                slot_start = datetime.combine(cur_date, time(h_val, 0), tzinfo=timezone.utc)
                slot_end = datetime.combine(cur_date, time(h_val + 1, 0), tzinfo=timezone.utc)

                status_slot = "LIBER"
                matched_id = None

                if res.stare_tehnica in [StareTehnica.DEFECTA, StareTehnica.IN_MENTENANTA]:
                    status_slot = "MENTENANTA"
                else:
                    for er in existing_res:
                        er_start = er.data_inceput if er.data_inceput.tzinfo else er.data_inceput.replace(tzinfo=timezone.utc)
                        er_end = er.data_sfarsit if er.data_sfarsit.tzinfo else er.data_sfarsit.replace(tzinfo=timezone.utc)
                        if er_start < slot_end and er_end > slot_start:
                            status_slot = "OCUPAT"
                            matched_id = er.id
                            break

                slots.append(HourlySlot(ora=h, status=status_slot, rezervare_id=matched_id))

            zile.append(DayAvailability(data=cur_date.isoformat(), zi_nume=zi_nume, slots=slots))

        return ResourceAvailabilityResponse(resursa_id=res.id, stare_tehnica=res.stare_tehnica, zile=zile)


resource_service = ResourceService()

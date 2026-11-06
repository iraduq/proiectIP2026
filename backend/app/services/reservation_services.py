from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    ReservationCreate,
    ReservationResponse,
    ReservationStatusUpdate,
    StudentQuotaResponse,
)
from app.db.models import (
    Reservation,
    Resource,
    StareRezervare,
    StareTehnica,
    User,
    UserRole,
)
from app.exceptions.exceptions import (
    DuplicateCategoryReservationError,
    InvalidReservationIntervalError,
    ReservationConflictError,
    ReservationLimitExceededError,
    ReservationNotFoundError,
    ReservationStateTransitionError,
    ResourceDefectiveError,
    ResourceInMaintenanceError,
    ResourceNotFoundError,
    ResourceUnavailableError,
    SpecializationAccessDeniedError,
    StudentMatricolRequiredError,
    UnauthorizedAccessError,
)
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.resource_repository import ResourceRepository
from app.utils.access import is_structure_admin, is_student

reservation_repository = ReservationRepository()
resource_repository = ResourceRepository()


class ReservationService:
    def _to_response(self, r: Reservation) -> ReservationResponse:
        res = r.resource
        cat = res.category if res else None
        room = res.room if res else None
        dept = room.department if room else None
        faculty = dept.faculty if dept else None
        user = r.user

        return ReservationResponse(
            id=r.id,
            resursa_id=r.resursa_id,
            resursa_nume=res.nume if res else None,
            resursa_cod=res.cod_inventar if res else None,
            categorie_id=res.categorie_id if res else None,
            categorie_nume=cat.nume if cat else None,
            sala_id=res.sala_id if res else None,
            sala_nume=room.nume if room else None,
            facultate_id=faculty.id if faculty else None,
            facultate_nume=faculty.nume if faculty else None,
            utilizator_id=r.utilizator_id,
            utilizator_nume=user.nume if user else None,
            utilizator_email=user.email if user else None,
            utilizator_rol=user.role_rel.name if user and user.role_rel else None,
            numar_matricol=user.numar_matricol if user else None,
            data_inceput=r.data_inceput,
            data_sfarsit=r.data_sfarsit,
            stare=r.stare,
            scop=r.scop,
            motiv_respingere=r.motiv_respingere,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )

    async def get_by_id(self, db: AsyncSession, reservation_id: int, actor: Optional[User] = None) -> Reservation:
        res = await reservation_repository.get_detailed(db, reservation_id)
        if not res:
            raise ReservationNotFoundError(reservation_id)

        if actor and is_student(actor) and res.utilizator_id != actor.id_utilizator:
            raise UnauthorizedAccessError("Puteți vizualiza doar propriile rezervări.")

        return res

    async def get_student_quota(self, db: AsyncSession, actor: User) -> StudentQuotaResponse:
        active_reservations = await reservation_repository.get_active_by_user(db, actor.id_utilizator)
        active_count = len(active_reservations)
        return StudentQuotaResponse(
            active_count=active_count,
            max_limit=4,
            can_reserve=active_count < 4,
            active_reservations=[self._to_response(r) for r in active_reservations],
        )

    async def create(self, db: AsyncSession, actor: User, data: ReservationCreate) -> ReservationResponse:
        # 1. Verify resource exists and load full hierarchy
        resource = await resource_repository.get_detailed(db, data.resursa_id)
        if not resource:
            raise ResourceNotFoundError(data.resursa_id)

        if not resource.is_active:
            raise ResourceUnavailableError("Resursă inactivă")

        if resource.stare_tehnica == StareTehnica.DEFECTA:
            raise ResourceDefectiveError(resource.id)

        if resource.stare_tehnica == StareTehnica.IN_MENTENANTA:
            raise ResourceInMaintenanceError(resource.id)

        # 2. Time interval validation
        if data.data_sfarsit <= data.data_inceput:
            raise InvalidReservationIntervalError("Data de sfârșit trebuie să fie ulterioară datei de început.")

        # 3. Student specific checks
        if is_student(actor):
            # Matricol check
            if not actor.numar_matricol or not actor.numar_matricol.strip():
                raise StudentMatricolRequiredError()

            # Faculty scoping check
            room = resource.room
            dept = room.department if room else None
            fac_id = dept.facultate_id if dept else None
            if actor.facultate_id and fac_id != actor.facultate_id:
                raise SpecializationAccessDeniedError(
                    f"Resursa aparține altei facultăți. Sunteți înrolat la facultatea ID {actor.facultate_id}."
                )

            # Limit: max 4 active reservations
            active_count = await reservation_repository.count_active_by_user(db, actor.id_utilizator)
            if active_count >= 4:
                raise ReservationLimitExceededError(4)

            # Duplicate category check
            user_active_bookings = await reservation_repository.get_active_by_user(db, actor.id_utilizator)
            for existing_b in user_active_bookings:
                if (
                    existing_b.resource
                    and existing_b.resource.categorie_id == resource.categorie_id
                ):
                    cat_name = resource.category.nume if resource.category else "aceeași categorie"
                    raise DuplicateCategoryReservationError(cat_name)

        # 4. Overlap / Conflict check
        conflicts = await reservation_repository.find_conflicts(
            db, data.resursa_id, data.data_inceput, data.data_sfarsit
        )
        if conflicts:
            raise ReservationConflictError(
                data.resursa_id, conflicts[0].data_inceput, conflicts[0].data_sfarsit
            )

        # 5. Create reservation
        reservation = Reservation(
            resursa_id=data.resursa_id,
            utilizator_id=actor.id_utilizator,
            data_inceput=data.data_inceput,
            data_sfarsit=data.data_sfarsit,
            stare=StareRezervare.IN_ASTEPTARE,
            scop=data.scop.strip(),
        )
        await reservation_repository.add(db, reservation)
        await db.commit()

        detailed = await reservation_repository.get_detailed(db, reservation.id)
        return self._to_response(detailed or reservation)

    async def list_page(
        self,
        db: AsyncSession,
        actor: User,
        utilizator_id: Optional[int] = None,
        resursa_id: Optional[int] = None,
        stare: Optional[StareRezervare] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> PaginatedResponse[ReservationResponse]:
        effective_user_id = utilizator_id
        effective_facultate_id = None

        if is_student(actor):
            # Students can ONLY see their own reservations
            effective_user_id = actor.id_utilizator
        elif not is_structure_admin(actor):
            # Teachers and Lab Managers see reservations for their faculty
            effective_facultate_id = actor.facultate_id

        items, total = await reservation_repository.list_page(
            db,
            utilizator_id=effective_user_id,
            resursa_id=resursa_id,
            facultate_id=effective_facultate_id,
            stare=stare,
            skip=skip,
            limit=limit,
        )

        return PaginatedResponse(
            items=[self._to_response(item) for item in items],
            total=total,
            skip=skip,
            limit=limit,
        )

    async def update_status(
        self, db: AsyncSession, actor: User, reservation_id: int, data: ReservationStatusUpdate
    ) -> ReservationResponse:
        reservation = await self.get_by_id(db, reservation_id)
        current_state = reservation.stare
        new_state = data.stare

        if current_state == new_state:
            return self._to_response(reservation)

        is_owner = reservation.utilizator_id == actor.id_utilizator
        is_staff = actor.role_rel.name in [
            UserRole.ADMINISTRATOR.value,
            UserRole.PROFESOR.value,
            UserRole.RESPONSABIL_LABORATOR.value,
        ]

        # Cancellation rules:
        if new_state == StareRezervare.ANULATA:
            if not is_owner and not is_structure_admin(actor):
                raise UnauthorizedAccessError("Doar titularul rezervării sau un administrator o poate anula.")
            if current_state not in [StareRezervare.IN_ASTEPTARE, StareRezervare.APROBATA]:
                raise ReservationStateTransitionError(current_state.value, new_state.value)

        # Approval rules:
        elif new_state == StareRezervare.APROBATA:
            if not is_staff:
                raise UnauthorizedAccessError("Doar personalul didactic sau administratorul poate aproba rezervări.")
            if current_state != StareRezervare.IN_ASTEPTARE:
                raise ReservationStateTransitionError(current_state.value, new_state.value)

        # Rejection rules:
        elif new_state == StareRezervare.RESPINSA:
            if not is_staff:
                raise UnauthorizedAccessError("Doar personalul didactic sau administratorul poate respinge rezervări.")
            if current_state != StareRezervare.IN_ASTEPTARE:
                raise ReservationStateTransitionError(current_state.value, new_state.value)
            reservation.motiv_respingere = (
                data.motiv_respingere.strip() if data.motiv_respingere else "Respinsă de către responsabil."
            )

        # Finalized / Return rules:
        elif new_state == StareRezervare.FINALIZATA:
            if not is_staff:
                raise UnauthorizedAccessError("Doar personalul didactic sau administratorul poate finaliza rezervări.")
            if current_state != StareRezervare.APROBATA:
                raise ReservationStateTransitionError(current_state.value, new_state.value)

        else:
            raise ReservationStateTransitionError(current_state.value, new_state.value)

        reservation.stare = new_state
        await db.commit()

        detailed = await reservation_repository.get_detailed(db, reservation.id)
        return self._to_response(detailed or reservation)


reservation_service = ReservationService()

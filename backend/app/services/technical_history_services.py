from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.schemas.resources import (
    PaginatedResponse,
    TechnicalHistoryCreate,
    TechnicalHistoryResponse,
)
from app.db.models import StareTehnica, TechnicalHistory, User
from app.exceptions.exceptions import (
    ResourceNotFoundError,
    TechnicalHistoryNotFoundError,
)
from app.repositories.resource_repository import ResourceRepository
from app.repositories.technical_history_repository import TechnicalHistoryRepository

technical_history_repository = TechnicalHistoryRepository()
resource_repository = ResourceRepository()


class TechnicalHistoryService:
    def _to_response(self, h: TechnicalHistory) -> TechnicalHistoryResponse:
        res = h.resource
        user = h.user
        return TechnicalHistoryResponse(
            id=h.id,
            resursa_id=h.resursa_id,
            resursa_nume=res.nume if res else None,
            resursa_cod=res.cod_inventar if res else None,
            utilizator_id=h.utilizator_id,
            utilizator_nume=user.nume if user else None,
            tip_interventie=h.tip_interventie,
            descriere=h.descriere,
            stare_anterioara=h.stare_anterioara,
            stare_noua=h.stare_noua,
            created_at=h.created_at,
        )

    async def get_by_id(self, db: AsyncSession, history_id: int) -> TechnicalHistory:
        item = await technical_history_repository.get_detailed(db, history_id)
        if not item:
            raise TechnicalHistoryNotFoundError(history_id)
        return item

    async def list_page(
        self,
        db: AsyncSession,
        resursa_id: Optional[int] = None,
        utilizator_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> PaginatedResponse[TechnicalHistoryResponse]:
        items, total = await technical_history_repository.list_page(
            db, resursa_id=resursa_id, utilizator_id=utilizator_id, skip=skip, limit=limit
        )
        return PaginatedResponse(
            items=[self._to_response(item) for item in items],
            total=total,
            skip=skip,
            limit=limit,
        )

    async def create(
        self, db: AsyncSession, actor: User, data: TechnicalHistoryCreate
    ) -> TechnicalHistoryResponse:
        resource = await resource_repository.get_by_id(db, data.resursa_id)
        if not resource:
            raise ResourceNotFoundError(data.resursa_id)

        stare_anterioara = resource.stare_tehnica
        stare_noua = data.stare_noua

        # Update resource state
        resource.stare_tehnica = stare_noua

        history_entry = TechnicalHistory(
            resursa_id=data.resursa_id,
            utilizator_id=actor.id_utilizator,
            tip_interventie=data.tip_interventie.strip(),
            descriere=data.descriere.strip(),
            stare_anterioara=stare_anterioara,
            stare_noua=stare_noua,
        )
        await technical_history_repository.add(db, history_entry)

        if stare_noua in [StareTehnica.DEFECTA, StareTehnica.IN_MENTENANTA]:
            from app.db.models import Reservation, StareRezervare
            from sqlalchemy import select
            pending_query = select(Reservation).where(
                Reservation.resursa_id == data.resursa_id,
                Reservation.stare == StareRezervare.IN_ASTEPTARE,
            )
            pending_items = (await db.execute(pending_query)).scalars().all()
            for pres in pending_items:
                pres.stare = StareRezervare.RESPINSA
                pres.motiv_respingere = f"Resursa a devenit indisponibila: {stare_noua.value}."

        await db.commit()

        detailed = await technical_history_repository.get_detailed(db, history_entry.id)
        return self._to_response(detailed or history_entry)


technical_history_service = TechnicalHistoryService()

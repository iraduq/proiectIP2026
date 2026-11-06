from datetime import datetime
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field
from app.db.models import StareRezervare, StareTehnica

ItemT = TypeVar("ItemT")


class PaginatedResponse(BaseModel, Generic[ItemT]):
    items: list[ItemT]
    total: int
    skip: int
    limit: int


# ===================== CATEGORIES =====================
class CategoryCreate(BaseModel):
    nume: str = Field(..., min_length=2, max_length=100)
    descriere: Optional[str] = Field(None, max_length=500)


class CategoryUpdate(BaseModel):
    nume: Optional[str] = Field(None, min_length=2, max_length=100)
    descriere: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nume: str
    descriere: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    resources_count: int = 0


# ===================== RESOURCES =====================
class ResourceCreate(BaseModel):
    nume: str = Field(..., min_length=2, max_length=255)
    cod_inventar: str = Field(..., min_length=2, max_length=50)
    categorie_id: int = Field(..., gt=0)
    sala_id: int = Field(..., gt=0)
    descriere: Optional[str] = Field(None, max_length=500)
    specificatii: Optional[str] = Field(None, max_length=1000)
    stare_tehnica: StareTehnica = StareTehnica.DISPONIBILA


class ResourceUpdate(BaseModel):
    nume: Optional[str] = Field(None, min_length=2, max_length=255)
    cod_inventar: Optional[str] = Field(None, min_length=2, max_length=50)
    categorie_id: Optional[int] = Field(None, gt=0)
    sala_id: Optional[int] = Field(None, gt=0)
    descriere: Optional[str] = Field(None, max_length=500)
    specificatii: Optional[str] = Field(None, max_length=1000)
    stare_tehnica: Optional[StareTehnica] = None
    is_active: Optional[bool] = None


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nume: str
    cod_inventar: str
    categorie_id: int
    categorie_nume: Optional[str] = None
    sala_id: int
    sala_cod: Optional[str] = None
    sala_nume: Optional[str] = None
    departament_id: Optional[int] = None
    departament_nume: Optional[str] = None
    facultate_id: Optional[int] = None
    facultate_nume: Optional[str] = None
    institutie_id: Optional[int] = None
    institutie_nume: Optional[str] = None
    stare_tehnica: StareTehnica
    descriere: Optional[str] = None
    specificatii: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ===================== RESERVATIONS =====================
class ReservationCreate(BaseModel):
    resursa_id: int = Field(..., gt=0)
    data_inceput: datetime
    data_sfarsit: datetime
    scop: str = Field(..., min_length=3, max_length=500)


class ReservationStatusUpdate(BaseModel):
    stare: StareRezervare
    motiv_respingere: Optional[str] = Field(None, max_length=500)


class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resursa_id: int
    resursa_nume: Optional[str] = None
    resursa_cod: Optional[str] = None
    categorie_id: Optional[int] = None
    categorie_nume: Optional[str] = None
    sala_id: Optional[int] = None
    sala_nume: Optional[str] = None
    facultate_id: Optional[int] = None
    facultate_nume: Optional[str] = None
    utilizator_id: int
    utilizator_nume: Optional[str] = None
    utilizator_email: Optional[str] = None
    utilizator_rol: Optional[str] = None
    numar_matricol: Optional[str] = None
    data_inceput: datetime
    data_sfarsit: datetime
    stare: StareRezervare
    scop: str
    motiv_respingere: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StudentQuotaResponse(BaseModel):
    active_count: int
    max_limit: int = 4
    can_reserve: bool
    active_reservations: list[ReservationResponse] = []


# ===================== TECHNICAL HISTORY =====================
class TechnicalHistoryCreate(BaseModel):
    resursa_id: int = Field(..., gt=0)
    tip_interventie: str = Field(..., min_length=2, max_length=100)
    descriere: str = Field(..., min_length=3, max_length=1000)
    stare_noua: StareTehnica


class TechnicalHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resursa_id: int
    resursa_nume: Optional[str] = None
    resursa_cod: Optional[str] = None
    utilizator_id: int
    utilizator_nume: Optional[str] = None
    tip_interventie: str
    descriere: str
    stare_anterioara: StareTehnica
    stare_noua: StareTehnica
    created_at: datetime

from datetime import datetime
from typing import Annotated, ClassVar, Generic, Optional, TypeVar
from pydantic import AfterValidator, BaseModel, BeforeValidator, ConfigDict, EmailStr, Field, model_validator
from app.db.models import Department, Faculty, Institution, Room, TipSala, User
from app.utils.structure_rules import ROOM_FLOOR_MAX, ROOM_FLOOR_MIN
from app.utils.validators import (
    validate_contact_phone,
    validate_free_text,
    validate_structure_code,
    validate_structure_name,
    validate_website,
)

ItemT = TypeVar("ItemT")


def _lowercase_email(value: object) -> object:
    if isinstance(value, str):
        stripped = value.strip().lower()
        if len(stripped) > 255:
            raise ValueError("Adresa de email poate avea maxim 255 de caractere.")
        return stripped or None
    return value


def _entity_name(value: object) -> str:
    return validate_structure_name(value, "Denumirea", 3, 150)


def _city_name(value: object) -> str:
    return validate_structure_name(value, "Orașul", 2, 100)


def _address_text(value: object) -> str:
    return validate_structure_name(value, "Adresa", 5, 255)


def _room_name(value: object) -> str:
    return validate_structure_name(value, "Denumirea sălii", 2, 100)


def _entity_code(value: object) -> str:
    return validate_structure_code(value, "Codul")


def _description(value: object) -> Optional[str]:
    return validate_free_text(value, "Descrierea", 500)


def _positive_id(value: int) -> int:
    if value <= 0:
        raise ValueError("Identificatorul trebuie să fie un număr întreg pozitiv.")
    return value


EntityName = Annotated[str, BeforeValidator(_entity_name)]
CityName = Annotated[str, BeforeValidator(_city_name)]
AddressText = Annotated[str, BeforeValidator(_address_text)]
RoomName = Annotated[str, BeforeValidator(_room_name)]
EntityCode = Annotated[str, BeforeValidator(_entity_code)]
Description = Annotated[Optional[str], BeforeValidator(_description)]
ContactPhone = Annotated[Optional[str], BeforeValidator(validate_contact_phone)]
WebsiteUrl = Annotated[Optional[str], BeforeValidator(validate_website)]
ContactEmail = Annotated[Optional[EmailStr], BeforeValidator(_lowercase_email)]
EntityId = Annotated[int, AfterValidator(_positive_id)]
Floor = Annotated[int, Field(ge=ROOM_FLOOR_MIN, le=ROOM_FLOOR_MAX)]
Capacity = Annotated[int, Field(ge=1, le=200)]


class Page(BaseModel, Generic[ItemT]):
    items: list[ItemT]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def build(cls, items: list[ItemT], total: int, skip: int, limit: int) -> "Page[ItemT]":
        return cls(items=items, total=total, skip=skip, limit=limit, has_more=skip + len(items) < total)


class StrictSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PartialUpdateSchema(StrictSchema):
    non_nullable_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def reject_null_for_required_fields(self) -> "PartialUpdateSchema":
        for field_name in self.model_fields_set & self.non_nullable_fields:
            if getattr(self, field_name) is None:
                raise ValueError(f"Câmpul '{field_name}' nu poate fi null.")
        return self


class UserBrief(BaseModel):
    id_utilizator: int
    nume: str
    email: str
    rol: Optional[str] = None

    @classmethod
    def from_model(cls, user: Optional[User]) -> Optional["UserBrief"]:
        if user is None:
            return None
        return cls(
            id_utilizator=user.id_utilizator,
            nume=user.nume,
            email=user.email,
            rol=user.role_rel.name if user.role_rel else None,
        )


class InstitutionCreate(StrictSchema):
    nume: EntityName
    cod: EntityCode
    oras: CityName
    adresa: AddressText
    email_contact: ContactEmail = None
    telefon: ContactPhone = None
    website: WebsiteUrl = None


class InstitutionUpdate(PartialUpdateSchema):
    non_nullable_fields: ClassVar[frozenset[str]] = frozenset({"nume", "cod", "oras", "adresa"})

    nume: Optional[EntityName] = None
    cod: Optional[EntityCode] = None
    oras: Optional[CityName] = None
    adresa: Optional[AddressText] = None
    email_contact: ContactEmail = None
    telefon: ContactPhone = None
    website: WebsiteUrl = None


class InstitutionResponse(BaseModel):
    id: int
    nume: str
    cod: str
    oras: str
    adresa: str
    email_contact: Optional[str] = None
    telefon: Optional[str] = None
    website: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, institution: Institution) -> "InstitutionResponse":
        return cls(
            id=institution.id,
            nume=institution.nume,
            cod=institution.cod,
            oras=institution.oras,
            adresa=institution.adresa,
            email_contact=institution.email_contact,
            telefon=institution.telefon,
            website=institution.website,
            is_active=institution.is_active,
            created_at=institution.created_at,
            updated_at=institution.updated_at,
        )


class InstitutionStats(BaseModel):
    institutie_id: int
    institutie_nume: str
    numar_facultati: int
    numar_departamente: int
    numar_sali: int
    numar_sali_active: int


class FacultyCreate(StrictSchema):
    institutie_id: EntityId
    nume: EntityName
    cod: EntityCode
    descriere: Description = None


class FacultyUpdate(PartialUpdateSchema):
    non_nullable_fields: ClassVar[frozenset[str]] = frozenset({"nume", "cod"})

    nume: Optional[EntityName] = None
    cod: Optional[EntityCode] = None
    descriere: Description = None


class FacultyResponse(BaseModel):
    id: int
    institutie_id: int
    institutie_nume: str
    nume: str
    cod: str
    descriere: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, faculty: Faculty) -> "FacultyResponse":
        return cls(
            id=faculty.id,
            institutie_id=faculty.institutie_id,
            institutie_nume=faculty.institution.nume,
            nume=faculty.nume,
            cod=faculty.cod,
            descriere=faculty.descriere,
            is_active=faculty.is_active,
            created_at=faculty.created_at,
            updated_at=faculty.updated_at,
        )


class DepartmentCreate(StrictSchema):
    facultate_id: EntityId
    nume: EntityName
    cod: EntityCode
    descriere: Description = None
    sef_departament_id: Optional[EntityId] = None


class DepartmentUpdate(PartialUpdateSchema):
    non_nullable_fields: ClassVar[frozenset[str]] = frozenset({"nume", "cod"})

    nume: Optional[EntityName] = None
    cod: Optional[EntityCode] = None
    descriere: Description = None
    sef_departament_id: Optional[EntityId] = None


class DepartmentResponse(BaseModel):
    id: int
    facultate_id: int
    facultate_nume: str
    institutie_id: int
    institutie_nume: str
    nume: str
    cod: str
    descriere: Optional[str] = None
    sef_departament: Optional[UserBrief] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, department: Department) -> "DepartmentResponse":
        faculty = department.faculty
        return cls(
            id=department.id,
            facultate_id=department.facultate_id,
            facultate_nume=faculty.nume,
            institutie_id=faculty.institutie_id,
            institutie_nume=faculty.institution.nume,
            nume=department.nume,
            cod=department.cod,
            descriere=department.descriere,
            sef_departament=UserBrief.from_model(department.sef),
            is_active=department.is_active,
            created_at=department.created_at,
            updated_at=department.updated_at,
        )


class RoomCreate(StrictSchema):
    departament_id: EntityId
    cod: EntityCode
    nume: RoomName
    tip_sala: TipSala
    etaj: Floor = 0
    capacitate: Capacity
    descriere: Description = None
    responsabil_id: EntityId


class RoomUpdate(PartialUpdateSchema):
    non_nullable_fields: ClassVar[frozenset[str]] = frozenset({"nume", "cod", "tip_sala", "etaj", "capacitate"})

    nume: Optional[RoomName] = None
    cod: Optional[EntityCode] = None
    tip_sala: Optional[TipSala] = None
    etaj: Optional[Floor] = None
    capacitate: Optional[Capacity] = None
    descriere: Description = None


class RoomResponsibleAssign(StrictSchema):
    responsabil_id: EntityId


class RoomResponse(BaseModel):
    id: int
    cod: str
    nume: str
    tip_sala: TipSala
    etaj: int
    capacitate: int
    descriere: Optional[str] = None
    departament_id: int
    departament_nume: str
    facultate_id: int
    facultate_nume: str
    institutie_id: int
    institutie_nume: str
    responsabil: UserBrief
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, room: Room) -> "RoomResponse":
        department = room.department
        faculty = department.faculty
        return cls(
            id=room.id,
            cod=room.cod,
            nume=room.nume,
            tip_sala=room.tip_sala,
            etaj=room.etaj,
            capacitate=room.capacitate,
            descriere=room.descriere,
            departament_id=room.departament_id,
            departament_nume=department.nume,
            facultate_id=department.facultate_id,
            facultate_nume=faculty.nume,
            institutie_id=faculty.institutie_id,
            institutie_nume=faculty.institution.nume,
            responsabil=UserBrief.from_model(room.responsabil),
            is_active=room.is_active,
            created_at=room.created_at,
            updated_at=room.updated_at,
        )

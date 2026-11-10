import enum
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import declared_attr, relationship, synonym
from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMINISTRATOR = "ADMINISTRATOR"
    PROFESOR = "PROFESOR"
    STUDENT = "STUDENT"
    RESPONSABIL_LABORATOR = "RESPONSABIL_LABORATOR"


class StareRezervare(str, enum.Enum):
    IN_ASTEPTARE = "IN_ASTEPTARE"
    APROBATA = "APROBATA"
    ANULATA = "ANULATA"
    RESPINSA = "RESPINSA"
    FINALIZATA = "FINALIZATA"


class StareTehnica(str, enum.Enum):
    DISPONIBILA = "DISPONIBILA"
    DEFECTA = "DEFECTA"
    IN_MENTENANTA = "IN_MENTENANTA"


class TipSala(str, enum.Enum):
    LABORATOR = "LABORATOR"
    SALA_CERCETARE = "SALA_CERCETARE"
    ATELIER = "ATELIER"
    SALA_SERVERE = "SALA_SERVERE"
    DEPOZIT = "DEPOZIT"


class TimestampMixin:
    creat_la = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    actualizat_la = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    @declared_attr
    def created_at(cls):
        return synonym("creat_la")

    @declared_attr
    def updated_at(cls):
        return synonym("actualizat_la")


roluri_permisiuni = Table(
    "roluri_permisiuni",
    Base.metadata,
    Column("rol_id", Integer, ForeignKey("roluri.id", ondelete="CASCADE"), primary_key=True),
    Column("permisiune_id", Integer, ForeignKey("permisiuni.id", ondelete="CASCADE"), primary_key=True),
)

role_permissions = roluri_permisiuni


class Role(Base):
    __tablename__ = "roluri"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nume = Column(String(50), unique=True, nullable=False, index=True)
    descriere = Column(String(255), nullable=True)

    name = synonym("nume")
    description = synonym("descriere")

    permissions = relationship("Permission", secondary=roluri_permisiuni, back_populates="roles", lazy="selectin")
    users = relationship("User", back_populates="role_rel")


class Permission(Base):
    __tablename__ = "permisiuni"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cod = Column(String(100), unique=True, nullable=False, index=True)
    descriere = Column(String(255), nullable=True)

    code = synonym("cod")
    description = synonym("descriere")

    roles = relationship("Role", secondary=roluri_permisiuni, back_populates="permissions")


class User(Base):
    __tablename__ = "utilizatori"

    id_utilizator = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nume = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    parola_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roluri.id"), nullable=False)
    numar_matricol = Column(String(100), nullable=True)
    id_angajat = Column(Integer, nullable=True)
    facultate_id = Column(Integer, ForeignKey("facultati.id", ondelete="SET NULL"), nullable=True, index=True)
    este_activ = Column(Boolean, default=True, nullable=False)
    creat_la = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    actualizat_la = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    role_id = synonym("rol_id")
    is_active = synonym("este_activ")
    created_at = synonym("creat_la")
    updated_at = synonym("actualizat_la")

    role_rel = relationship("Role", back_populates="users", lazy="joined")
    faculty = relationship("Faculty", lazy="joined")


class Institution(TimestampMixin, Base):
    __tablename__ = "institutii"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nume = Column(String(255), nullable=False, unique=True, index=True)
    cod = Column(String(30), nullable=False, unique=True, index=True)
    oras = Column(String(100), nullable=False)
    adresa = Column(String(255), nullable=False)
    email_contact = Column(String(255), nullable=True)
    telefon = Column(String(20), nullable=True)
    site_web = Column(String(255), nullable=True)
    este_activ = Column(Boolean, default=True, nullable=False)

    website = synonym("site_web")
    is_active = synonym("este_activ")

    faculties = relationship("Faculty", back_populates="institution")


class Faculty(TimestampMixin, Base):
    __tablename__ = "facultati"
    __table_args__ = (
        UniqueConstraint("institutie_id", "nume", name="uq_facultati_institutie_nume"),
        UniqueConstraint("institutie_id", "cod", name="uq_facultati_institutie_cod"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    institutie_id = Column(Integer, ForeignKey("institutii.id", ondelete="RESTRICT"), nullable=False, index=True)
    nume = Column(String(255), nullable=False)
    cod = Column(String(30), nullable=False)
    descriere = Column(String(500), nullable=True)
    este_activ = Column(Boolean, default=True, nullable=False)

    is_active = synonym("este_activ")

    institution = relationship("Institution", back_populates="faculties")
    departments = relationship("Department", back_populates="faculty")


class Department(TimestampMixin, Base):
    __tablename__ = "departamente"
    __table_args__ = (
        UniqueConstraint("facultate_id", "nume", name="uq_departamente_facultate_nume"),
        UniqueConstraint("facultate_id", "cod", name="uq_departamente_facultate_cod"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    facultate_id = Column(Integer, ForeignKey("facultati.id", ondelete="RESTRICT"), nullable=False, index=True)
    nume = Column(String(255), nullable=False)
    cod = Column(String(30), nullable=False)
    descriere = Column(String(500), nullable=True)
    sef_departament_id = Column(
        Integer, ForeignKey("utilizatori.id_utilizator", ondelete="SET NULL"), nullable=True, index=True
    )
    este_activ = Column(Boolean, default=True, nullable=False)

    is_active = synonym("este_activ")

    faculty = relationship("Faculty", back_populates="departments")
    sef = relationship("User", foreign_keys=[sef_departament_id])
    rooms = relationship("Room", back_populates="department")


class Room(TimestampMixin, Base):
    __tablename__ = "sali"
    __table_args__ = (
        UniqueConstraint("departament_id", "nume", name="uq_sali_departament_nume"),
        CheckConstraint("capacitate > 0", name="ck_sali_capacitate_pozitiva"),
        CheckConstraint("etaj >= -3 AND etaj <= 30", name="ck_sali_etaj_valid"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    departament_id = Column(Integer, ForeignKey("departamente.id", ondelete="RESTRICT"), nullable=False, index=True)
    cod = Column(String(30), nullable=False, unique=True, index=True)
    nume = Column(String(255), nullable=False)
    tip_sala = Column(SAEnum(TipSala, name="tip_sala_enum"), nullable=False)
    etaj = Column(Integer, nullable=False, default=0)
    capacitate = Column(Integer, nullable=False)
    descriere = Column(String(500), nullable=True)
    responsabil_id = Column(
        Integer, ForeignKey("utilizatori.id_utilizator", ondelete="RESTRICT"), nullable=False, index=True
    )
    este_activ = Column(Boolean, default=True, nullable=False)

    is_active = synonym("este_activ")

    department = relationship("Department", back_populates="rooms")
    responsabil = relationship("User", foreign_keys=[responsabil_id])
    resources = relationship("Resource", back_populates="room")


class Category(TimestampMixin, Base):
    __tablename__ = "categorii_resurse"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nume = Column(String(100), nullable=False, unique=True, index=True)
    descriere = Column(String(500), nullable=True)
    este_activ = Column(Boolean, default=True, nullable=False)

    is_active = synonym("este_activ")

    resources = relationship("Resource", back_populates="category")


class Resource(TimestampMixin, Base):
    __tablename__ = "resurse"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nume = Column(String(255), nullable=False, index=True)
    cod_inventar = Column(String(50), nullable=False, unique=True, index=True)
    descriere = Column(String(500), nullable=True)
    categorie_id = Column(Integer, ForeignKey("categorii_resurse.id", ondelete="RESTRICT"), nullable=False, index=True)
    sala_id = Column(Integer, ForeignKey("sali.id", ondelete="RESTRICT"), nullable=False, index=True)
    stare_tehnica = Column(
        SAEnum(StareTehnica, name="stare_tehnica_enum"), default=StareTehnica.DISPONIBILA, nullable=False
    )
    specificatii = Column(String(1000), nullable=True)
    imagine_url = Column(String(500), nullable=True)
    este_activ = Column(Boolean, default=True, nullable=False)

    is_active = synonym("este_activ")

    category = relationship("Category", back_populates="resources", lazy="joined")
    room = relationship("Room", back_populates="resources", lazy="joined")
    reservations = relationship("Reservation", back_populates="resource", cascade="all, delete-orphan")
    technical_history = relationship("TechnicalHistory", back_populates="resource", cascade="all, delete-orphan")


class Reservation(TimestampMixin, Base):
    __tablename__ = "rezervari"

    id = Column(Integer, primary_key=True, autoincrement=True)
    resursa_id = Column(Integer, ForeignKey("resurse.id", ondelete="CASCADE"), nullable=False, index=True)
    utilizator_id = Column(Integer, ForeignKey("utilizatori.id_utilizator", ondelete="CASCADE"), nullable=False, index=True)
    data_inceput = Column(DateTime(timezone=True), nullable=False, index=True)
    data_sfarsit = Column(DateTime(timezone=True), nullable=False, index=True)
    stare = Column(
        SAEnum(StareRezervare, name="stare_rezervare_enum"),
        default=StareRezervare.IN_ASTEPTARE,
        nullable=False,
        index=True,
    )
    scop = Column(String(500), nullable=False)
    motiv_respingere = Column(String(500), nullable=True)

    resource = relationship("Resource", back_populates="reservations", lazy="joined")
    user = relationship("User", lazy="joined")


class TechnicalHistory(Base):
    __tablename__ = "jurnal_tehnic"

    id = Column(Integer, primary_key=True, autoincrement=True)
    resursa_id = Column(Integer, ForeignKey("resurse.id", ondelete="CASCADE"), nullable=False, index=True)
    utilizator_id = Column(Integer, ForeignKey("utilizatori.id_utilizator", ondelete="RESTRICT"), nullable=False, index=True)
    tip_interventie = Column(String(100), nullable=False)
    descriere = Column(String(1000), nullable=False)
    stare_anterioara = Column(SAEnum(StareTehnica, name="stare_tehnica_enum"), nullable=False)
    stare_noua = Column(SAEnum(StareTehnica, name="stare_tehnica_enum"), nullable=False)
    creat_la = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    created_at = synonym("creat_la")

    resource = relationship("Resource", back_populates="technical_history", lazy="joined")
    user = relationship("User", lazy="joined")

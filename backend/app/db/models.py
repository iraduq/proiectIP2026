import enum
from datetime import datetime
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
from sqlalchemy.orm import relationship
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
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles", lazy="selectin")
    users = relationship("User", back_populates="role_rel")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class User(Base):
    __tablename__ = "utilizatori"

    id_utilizator = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nume = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    parola_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    numar_matricol = Column(String(100), nullable=True)
    id_angajat = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    role_rel = relationship("Role", back_populates="users", lazy="joined")


class Institution(TimestampMixin, Base):
    __tablename__ = "institutii"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nume = Column(String(255), nullable=False, unique=True, index=True)
    cod = Column(String(30), nullable=False, unique=True, index=True)
    oras = Column(String(100), nullable=False)
    adresa = Column(String(255), nullable=False)
    email_contact = Column(String(255), nullable=True)
    telefon = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

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
    is_active = Column(Boolean, default=True, nullable=False)

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
    is_active = Column(Boolean, default=True, nullable=False)

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
    is_active = Column(Boolean, default=True, nullable=False)

    department = relationship("Department", back_populates="rooms")
    responsabil = relationship("User", foreign_keys=[responsabil_id])

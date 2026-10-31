import re
from datetime import datetime
from typing import Annotated, Optional
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    ValidationInfo,
    field_validator,
)
from app.db.models import UserRole
from app.utils.validators import validate_romanian_name_rules

SafeEmail = Annotated[EmailStr, Field(..., max_length=100)]


class BaseEmailSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: SafeEmail

    @field_validator("email", mode="before")
    @classmethod
    def sanitize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class UserCreate(BaseEmailSchema):
    password: str = Field(..., min_length=8, max_length=64)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    rol: UserRole = UserRole.STUDENT
    numar_matricol: Optional[str] = Field(default=None, max_length=50)
    id_angajat: Optional[int] = Field(default=None)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Parola trebuie să aibă minim 8 caractere.")
        if len(value) > 64:
            raise ValueError("Parola trebuie să aibă maxim 64 caractere.")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Parola trebuie să conțină cel puțin o literă mare.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Parola trebuie să conțină cel puțin o literă mică.")
        if not re.search(r"\d", value):
            raise ValueError("Parola trebuie să conțină cel puțin o cifră.")
        if not re.search(r"[@$!%*?&_\-#^+=()]", value):
            raise ValueError("Parola trebuie să conțină cel puțin un caracter special.")
        return value

    @field_validator("first_name", mode="before")
    @classmethod
    def validate_first_name(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Prenumele trebuie să fie un șir de caractere.")
        return validate_romanian_name_rules(v, "Prenumele")

    @field_validator("last_name", mode="before")
    @classmethod
    def validate_last_name(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Numele de familie trebuie să fie un șir de caractere.")
        return validate_romanian_name_rules(v, "Numele de familie")

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_full_name_combination(cls, v: str, info: ValidationInfo) -> str:
        if info.field_name == "last_name" and "first_name" in info.data:
            first = info.data["first_name"].lower().replace(" ", "").replace("-", "")
            last = v.lower().replace(" ", "").replace("-", "")

            if first == last:
                raise ValueError(
                    f"Numele de familie '{v}' nu poate fi identic cu prenumele '{info.data['first_name']}'."
                )

            total_chars = len(first) + len(last)
            if total_chars < 5:
                raise ValueError(
                    f"Prenumele '{info.data['first_name']}' și numele '{v}' au împreună {total_chars} caractere. Minimul este 5."
                )

        return v


class LoginSchema(BaseEmailSchema):
    password: str = Field(..., min_length=8, max_length=64)


class UserResponse(BaseModel):
    id_utilizator: int
    nume: str
    email: EmailStr
    rol: UserRole
    numar_matricol: Optional[str] = None
    id_angajat: Optional[int] = None
    is_active: bool = True
    permissions: list[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class UserFullResponse(UserResponse):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserUpdateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @field_validator("first_name", mode="before")
    @classmethod
    def validate_first_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if not isinstance(v, str):
            raise ValueError("Prenumele trebuie să fie un șir de caractere.")
        return validate_romanian_name_rules(v, "Prenumele")

    @field_validator("last_name", mode="before")
    @classmethod
    def validate_last_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if not isinstance(v, str):
            raise ValueError("Numele de familie trebuie să fie un șir de caractere.")
        return validate_romanian_name_rules(v, "Numele de familie")


class AdminUserUpdateSchema(UserUpdateSchema):
    rol: Optional[UserRole] = None
    is_active: Optional[bool] = None
    numar_matricol: Optional[str] = None
    id_angajat: Optional[int] = None

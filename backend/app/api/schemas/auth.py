from pydantic import BaseModel, ConfigDict
from app.api.schemas.users import (
    BaseEmailSchema,
    LoginSchema,
    UserCreate,
    UserFullResponse,
    UserResponse,
)


class Token(BaseModel):
    model_config = ConfigDict(extra="forbid")

    access_token: str
    token_type: str = "bearer"


UserRegister = UserCreate
UserLogin = LoginSchema

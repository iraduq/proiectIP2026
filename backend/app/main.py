from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.routers.auth import router as auth_router
from app.api.routers.departments import router as departments_router
from app.api.routers.faculties import router as faculties_router
from app.api.routers.health import router as health_router
from app.api.routers.institutions import router as institutions_router
from app.api.routers.rooms import router as rooms_router
from app.config import settings
from app.db.database import AsyncSessionLocal, engine
from app.db.seed import seed_all
from app.middleware.exception_handler import register_exception_handlers
from app.middleware.security import security_middleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with AsyncSessionLocal() as session:
        await seed_all(session)
    yield
    await engine.dispose()


app = FastAPI(
    title="Resource Research Manager API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


def custom_openapi() -> dict:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Resource Research Manager API",
        version="1.0.0",
        description="Documentație API pentru gestiunea resurselor de cercetare academice",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": "/api/auth/token",
                    "scopes": {},
                }
            },
        }
    }

    for path, methods in openapi_schema.get("paths", {}).items():
        for method, operation in methods.items():
            responses = operation.setdefault("responses", {})
            responses.setdefault("400", {"description": "Bad Request"})
            responses.setdefault("401", {"description": "Unauthorized"})
            responses.setdefault("403", {"description": "Forbidden"})
            responses.setdefault("404", {"description": "Not Found"})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

register_exception_handlers(app)
app.middleware("http")(security_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router, prefix="/api")
app.include_router(institutions_router, prefix="/api")
app.include_router(faculties_router, prefix="/api")
app.include_router(departments_router, prefix="/api")
app.include_router(rooms_router, prefix="/api")


@app.get("/", tags=["Root"])
async def read_root() -> dict[str, str]:
    return {
        "status": "online",
        "service": "Resource Research Manager API",
        "version": "1.0.0",
    }

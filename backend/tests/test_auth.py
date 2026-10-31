import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient):
    payload = {
        "first_name": "Ion",
        "last_name": "Popescu",
        "email": "ion.popescu@univ.ro",
        "password": "Password123!",
        "rol": "STUDENT",
        "numar_matricol": "CS123456",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["nume"] == "Ion Popescu"
    assert data["rol"] == "STUDENT"
    assert data["numar_matricol"] == "CS123456"
    assert "bookings:create" in data["permissions"]
    assert "id_utilizator" in data


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    payload = {
        "first_name": "Ion",
        "last_name": "Popescu",
        "email": "ion.weak@univ.ro",
        "password": "simple",
        "rol": "STUDENT",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code in (400, 422)


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {
        "first_name": "Ion",
        "last_name": "Popescu",
        "email": "ion.duplicate@univ.ro",
        "password": "Password123!",
        "rol": "STUDENT",
    }
    first_response = await client.post("/api/auth/register", json=payload)
    assert first_response.status_code == 201

    second_response = await client.post("/api/auth/register", json=payload)
    assert second_response.status_code == 409
    data = second_response.json()
    assert data["code"] == "user_email_already_exists"


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    register_payload = {
        "first_name": "Maria",
        "last_name": "Ionescu",
        "email": "maria.ionescu@univ.ro",
        "password": "SecurePassword123!",
        "rol": "PROFESOR",
        "id_angajat": 9876,
    }
    await client.post("/api/auth/register", json=register_payload)

    login_payload = {
        "email": "maria.ionescu@univ.ro",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    register_payload = {
        "first_name": "George",
        "last_name": "Dan",
        "email": "george.dan@univ.ro",
        "password": "CorrectPassword123!",
        "rol": "STUDENT",
    }
    await client.post("/api/auth/register", json=register_payload)

    login_payload = {
        "email": "george.dan@univ.ro",
        "password": "WrongPassword123!",
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["code"] == "invalid_credentials"


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    register_payload = {
        "first_name": "Elena",
        "last_name": "Radu",
        "email": "elena.radu@univ.ro",
        "password": "SecretPassword123!",
        "rol": "ADMINISTRATOR",
    }
    await client.post("/api/auth/register", json=register_payload)

    login_response = await client.post(
        "/api/auth/login",
        json={"email": "elena.radu@univ.ro", "password": "SecretPassword123!"},
    )
    token = login_response.json()["access_token"]

    me_response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "elena.radu@univ.ro"
    assert me_data["rol"] == "ADMINISTRATOR"
    assert "users:manage" in me_data["permissions"]


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["code"] == "invalid_token"


@pytest.mark.asyncio
async def test_security_headers_present(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Referrer-Policy") == "no-referrer"

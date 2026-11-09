import pytest
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import (
    Category,
    Faculty,
    Reservation,
    Resource,
    Room,
    StareRezervare,
    StareTehnica,
    User,
)
from app.db.seed import seed_all


async def get_auth_token(client: AsyncClient, email: str = "admin1@univ.ro", password: str = "Password123!") -> str:
    res = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_category_flow(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    admin_token = await get_auth_token(client, "admin1@univ.ro")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = await client.get("/api/categories", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 5

    res = await client.post(
        "/api/categories",
        headers=headers,
        json={"nume": "Echipamente Realitate Virtuală", "descriere": "Căști VR și senzori haptici"},
    )
    assert res.status_code == 201
    cat_id = res.json()["id"]

    res_dup = await client.post(
        "/api/categories",
        headers=headers,
        json={"nume": "Echipamente Realitate Virtuală"},
    )
    assert res_dup.status_code == 409

    res_up = await client.patch(
        f"/api/categories/{cat_id}",
        headers=headers,
        json={"descriere": "Căști VR, AR și senzori haptici actualizați"},
    )
    assert res_up.status_code == 200
    assert res_up.json()["descriere"] == "Căști VR, AR și senzori haptici actualizați"

    res_del = await client.delete(f"/api/categories/{cat_id}", headers=headers)
    assert res_del.status_code == 204


@pytest.mark.asyncio
async def test_resource_crud_and_moving_between_labs(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    admin_token = await get_auth_token(client, "admin1@univ.ro")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = await client.get("/api/resources", headers=headers)
    assert res.status_code == 200
    assert res.json()["total"] >= 5

    rooms = (await db_session.execute(select(Room).order_by(Room.id.asc()))).scalars().all()
    category = (await db_session.execute(select(Category).order_by(Category.id.asc()))).scalars().first()
    assert len(rooms) >= 2
    assert category is not None

    res_create = await client.post(
        "/api/resources",
        headers=headers,
        json={
            "nume": "Nvidia Jetson AGX Orin 64GB",
            "cod_inventar": "IOT-JETSON-ORIN-01",
            "categorie_id": category.id,
            "sala_id": rooms[0].id,
            "descriere": "Modul AI edge computing 275 TOPS",
            "specificatii": "GPU Ampere 2048 nuclee, CPU ARM Cortex-A78AE 12 nuclee, 64GB LPDDR5",
            "stare_tehnica": "DISPONIBILA",
        },
    )
    assert res_create.status_code == 201
    created_id = res_create.json()["id"]

    res_dup = await client.post(
        "/api/resources",
        headers=headers,
        json={
            "nume": "Duplicate Item",
            "cod_inventar": "IOT-JETSON-ORIN-01",
            "categorie_id": category.id,
            "sala_id": rooms[0].id,
        },
    )
    assert res_dup.status_code == 409

    lab_token = await get_auth_token(client, "lab1@univ.ro")
    lab_headers = {"Authorization": f"Bearer {lab_token}"}
    res_move = await client.patch(
        f"/api/resources/{created_id}",
        headers=lab_headers,
        json={"sala_id": rooms[1].id},
    )
    assert res_move.status_code == 200
    assert res_move.json()["sala_id"] == rooms[1].id

    res_logs = await client.get(f"/api/technical-history?resursa_id={created_id}", headers=lab_headers)
    assert res_logs.status_code == 200
    logs_data = res_logs.json()["items"]
    assert any(log["tip_interventie"] == "TRANSFER_SALA" for log in logs_data)

    student_token = await get_auth_token(client, "student1@univ.ro")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    res_student_get = await client.get(f"/api/resources/{created_id}", headers=student_headers)
    assert res_student_get.status_code == 200


@pytest.mark.asyncio
async def test_reservation_rules_and_lifecycle(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    student_token = await get_auth_token(client, "student1@univ.ro")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    prof_token = await get_auth_token(client, "prof1@univ.ro")
    prof_headers = {"Authorization": f"Bearer {prof_token}"}

    res_available = (
        await db_session.execute(
            select(Resource).where(
                Resource.stare_tehnica == StareTehnica.DISPONIBILA,
                Resource.cod_inventar == "MS-KEYSIGHT-1GHZ",
            )
        )
    ).scalars().first()
    assert res_available is not None

    res_defective = (
        await db_session.execute(
            select(Resource).where(
                Resource.stare_tehnica == StareTehnica.DEFECTA,
            )
        )
    ).scalars().first()
    assert res_defective is not None

    now = datetime.now(timezone.utc)
    res_bad = await client.post(
        "/api/reservations",
        headers=student_headers,
        json={
            "resursa_id": res_defective.id,
            "data_inceput": (now + timedelta(days=10)).isoformat(),
            "data_sfarsit": (now + timedelta(days=12)).isoformat(),
            "scop": "Test defecțiune",
        },
    )
    assert res_bad.status_code == 409

    start_time = now + timedelta(days=15)
    end_time = now + timedelta(days=17)
    res_ok = await client.post(
        "/api/reservations",
        headers=student_headers,
        json={
            "resursa_id": res_available.id,
            "data_inceput": start_time.isoformat(),
            "data_sfarsit": end_time.isoformat(),
            "scop": "Măsurare jitter și zgomot de fază pentru proiectul de diplomă.",
        },
    )
    assert res_ok.status_code == 201
    booking_id = res_ok.json()["id"]
    assert res_ok.json()["stare"] == "IN_ASTEPTARE"

    res_conflict = await client.post(
        "/api/reservations",
        headers=prof_headers,
        json={
            "resursa_id": res_available.id,
            "data_inceput": (start_time + timedelta(hours=5)).isoformat(),
            "data_sfarsit": (end_time + timedelta(hours=5)).isoformat(),
            "scop": "Conflict booking test",
        },
    )
    assert res_conflict.status_code == 409

    res_prof_approve = await client.post(f"/api/reservations/{booking_id}/approve", headers=prof_headers)
    assert res_prof_approve.status_code == 403

    room = await db_session.get(Room, res_available.sala_id)
    assert room is not None
    room_resp = await db_session.get(User, room.responsabil_id)
    assert room_resp is not None

    manager_token = await get_auth_token(client, room_resp.email)
    manager_headers = {"Authorization": f"Bearer {manager_token}"}

    res_approve = await client.post(f"/api/reservations/{booking_id}/approve", headers=manager_headers)
    assert res_approve.status_code == 200
    assert res_approve.json()["stare"] == "APROBATA"

    res_prof_return = await client.post(f"/api/reservations/{booking_id}/return", headers=prof_headers)
    assert res_prof_return.status_code == 403

    res_return = await client.post(f"/api/reservations/{booking_id}/return", headers=manager_headers)
    assert res_return.status_code == 200
    assert res_return.json()["stare"] == "FINALIZATA"


@pytest.mark.asyncio
async def test_technical_history_and_state_transition(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    prof_token = await get_auth_token(client, "prof1@univ.ro")
    prof_headers = {"Authorization": f"Bearer {prof_token}"}
    lab_token = await get_auth_token(client, "lab1@univ.ro")
    lab_headers = {"Authorization": f"Bearer {lab_token}"}

    res_item = (
        await db_session.execute(
            select(Resource).where(Resource.cod_inventar == "PRT-BAMBU-X1C")
        )
    ).scalars().first()
    assert res_item is not None
    assert res_item.stare_tehnica == StareTehnica.DISPONIBILA

    res_prof_forbidden = await client.post(
        "/api/technical-history",
        headers=prof_headers,
        json={
            "resursa_id": res_item.id,
            "tip_interventie": "DEFECTIUNE_EXTRUDER",
            "descriere": "Încercare neautorizată de creare fișă tehnică de către profesor.",
            "stare_noua": "DEFECTA",
        },
    )
    assert res_prof_forbidden.status_code == 403

    res_log = await client.post(
        "/api/technical-history",
        headers=lab_headers,
        json={
            "resursa_id": res_item.id,
            "tip_interventie": "DEFECTIUNE_EXTRUDER",
            "descriere": "Duza de 0.4mm s-a înfundat cu filament compozit din fibră de carbon. Necesită curățare cu acul termic.",
            "stare_noua": "DEFECTA",
        },
    )
    assert res_log.status_code == 201
    log_data = res_log.json()
    assert log_data["stare_anterioara"] == "DISPONIBILA"
    assert log_data["stare_noua"] == "DEFECTA"

    res_check = await client.get(f"/api/resources/{res_item.id}", headers=lab_headers)
    assert res_check.status_code == 200
    assert res_check.json()["stare_tehnica"] == "DEFECTA"


@pytest.mark.asyncio
async def test_resource_availability_endpoint(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    student_token = await get_auth_token(client, "student1@univ.ro")
    headers = {"Authorization": f"Bearer {student_token}"}

    res_item = (
        await db_session.execute(
            select(Resource).where(Resource.cod_inventar == "HPC-RTX-4090-01")
        )
    ).scalars().first()
    assert res_item is not None

    res_avail = await client.get(f"/api/resources/{res_item.id}/availability", headers=headers)
    assert res_avail.status_code == 200
    data = res_avail.json()
    assert data["resursa_id"] == res_item.id
    assert len(data["zile"]) == 5
    assert len(data["zile"][0]["slots"]) == 10
    assert data["zile"][0]["slots"][0]["status"] in ["LIBER", "OCUPAT", "MENTENANTA"]

@pytest.mark.asyncio
async def test_resource_image_url_population(client: AsyncClient, db_session: AsyncSession) -> None:
    await seed_all(db_session)
    student_token = await get_auth_token(client, "student1@univ.ro")
    headers = {"Authorization": f"Bearer {student_token}"}

    res_list = await client.get("/api/resources?limit=20", headers=headers)
    assert res_list.status_code == 200
    items = res_list.json()["items"]
    assert len(items) > 0
    with_images = [item for item in items if item.get("imagine_url")]
    assert len(with_images) > 0

from typing import Any
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.seed import seed_academic_structure
from app.db.models import Department, Faculty, Institution, Room

PASSWORD = "Password123!"


async def login_headers(client: AsyncClient, email: str) -> dict[str, str]:
    response = await client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
    assert response.status_code == 200
    client.cookies.clear()
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


async def user_id_of(client: AsyncClient, headers: dict[str, str]) -> int:
    response = await client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    return response.json()["id_utilizator"]


@pytest_asyncio.fixture
async def admin_headers(client: AsyncClient) -> dict[str, str]:
    return await login_headers(client, "admin1@univ.ro")


@pytest_asyncio.fixture
async def chain(client: AsyncClient, admin_headers: dict[str, str]) -> dict[str, Any]:
    lab_headers = await login_headers(client, "lab1@univ.ro")
    prof_headers = await login_headers(client, "prof1@univ.ro")
    lab_id = await user_id_of(client, lab_headers)
    prof_id = await user_id_of(client, prof_headers)

    institution = await client.post(
        "/api/institutions",
        headers=admin_headers,
        json={
            "nume": "Universitatea de Test",
            "cod": "uts",
            "oras": "Timișoara",
            "adresa": "Strada Testului nr. 1",
            "email_contact": "Contact@Test.ro",
            "telefon": "+40 256 123 456",
            "website": "https://www.test.ro",
        },
    )
    assert institution.status_code == 201
    institution_id = institution.json()["id"]

    faculty = await client.post(
        "/api/faculties",
        headers=admin_headers,
        json={"institutie_id": institution_id, "nume": "Facultatea de Test", "cod": "FT"},
    )
    assert faculty.status_code == 201
    faculty_id = faculty.json()["id"]

    department = await client.post(
        "/api/departments",
        headers=admin_headers,
        json={
            "facultate_id": faculty_id,
            "nume": "Departamentul de Test",
            "cod": "DT",
            "sef_departament_id": prof_id,
        },
    )
    assert department.status_code == 201
    department_id = department.json()["id"]

    room = await client.post(
        "/api/rooms",
        headers=admin_headers,
        json={
            "departament_id": department_id,
            "cod": "uts-ft-dt-l1",
            "nume": "Laborator Test",
            "tip_sala": "LABORATOR",
            "etaj": 1,
            "capacitate": 20,
            "responsabil_id": lab_id,
        },
    )
    assert room.status_code == 201
    return {
        "institution_id": institution_id,
        "faculty_id": faculty_id,
        "department_id": department_id,
        "room_id": room.json()["id"],
        "lab_id": lab_id,
        "prof_id": prof_id,
        "lab_headers": lab_headers,
        "prof_headers": prof_headers,
        "room": room.json(),
    }


@pytest.mark.asyncio
async def test_student_cannot_manage_structure(client: AsyncClient):
    headers = await login_headers(client, "student1@univ.ro")
    response = await client.post(
        "/api/institutions",
        headers=headers,
        json={"nume": "Universitate Noua", "cod": "UN", "oras": "Iași", "adresa": "Strada Noua nr. 5"},
    )
    assert response.status_code == 403
    assert response.json()["code"] == "forbidden_access"


@pytest.mark.asyncio
async def test_structure_requires_authentication(client: AsyncClient):
    response = await client.get("/api/institutions")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_institution_normalizes_fields(chain: dict[str, Any], client: AsyncClient, admin_headers):
    response = await client.get(f"/api/institutions/{chain['institution_id']}", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["cod"] == "UTS"
    assert data["email_contact"] == "contact@test.ro"
    assert data["telefon"] == "+40256123456"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_institution_duplicates_rejected(chain: dict[str, Any], client: AsyncClient, admin_headers):
    base = {"oras": "Iași", "adresa": "Strada Noua nr. 5"}
    same_name = await client.post(
        "/api/institutions", headers=admin_headers, json={**base, "nume": "UNIVERSITATEA DE TEST", "cod": "NEW"}
    )
    assert same_name.status_code == 409
    assert same_name.json()["code"] == "institution_name_already_exists"

    same_code = await client.post(
        "/api/institutions", headers=admin_headers, json={**base, "nume": "Alta Universitate", "cod": "uts"}
    )
    assert same_code.status_code == 409
    assert same_code.json()["code"] == "institution_code_already_exists"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "overrides",
    [
        {"cod": "A B"},
        {"cod": "X"},
        {"nume": "universitate cu litera mica"},
        {"nume": "Univ <script>"},
        {"website": "ftp://invalid.ro"},
        {"telefon": "123"},
        {"email_contact": "not-an-email"},
        {"unknown_field": "x"},
    ],
)
async def test_institution_validation_errors(client: AsyncClient, admin_headers, overrides):
    payload = {
        "nume": "Universitatea Valida",
        "cod": "UV",
        "oras": "Brașov",
        "adresa": "Strada Valida nr. 3",
        **overrides,
    }
    response = await client.post("/api/institutions", headers=admin_headers, json=payload)
    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.asyncio
async def test_empty_update_rejected(chain: dict[str, Any], client: AsyncClient, admin_headers):
    response = await client.patch(f"/api/institutions/{chain['institution_id']}", headers=admin_headers, json={})
    assert response.status_code == 400
    assert response.json()["code"] == "empty_update"


@pytest.mark.asyncio
async def test_update_required_field_to_null_rejected(chain: dict[str, Any], client: AsyncClient, admin_headers):
    response = await client.patch(
        f"/api/institutions/{chain['institution_id']}", headers=admin_headers, json={"nume": None}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_faculty_requires_existing_active_institution(chain: dict[str, Any], client: AsyncClient, admin_headers):
    missing = await client.post(
        "/api/faculties",
        headers=admin_headers,
        json={"institutie_id": 99999, "nume": "Facultatea Fantoma", "cod": "FF"},
    )
    assert missing.status_code == 404
    assert missing.json()["code"] == "institution_not_found"

    duplicate = await client.post(
        "/api/faculties",
        headers=admin_headers,
        json={"institutie_id": chain["institution_id"], "nume": "Facultatea de Test", "cod": "FX"},
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["code"] == "faculty_name_already_exists"


@pytest.mark.asyncio
async def test_department_head_must_be_professor(chain: dict[str, Any], client: AsyncClient, admin_headers):
    response = await client.post(
        "/api/departments",
        headers=admin_headers,
        json={
            "facultate_id": chain["faculty_id"],
            "nume": "Departament Invalid",
            "cod": "DI",
            "sef_departament_id": chain["lab_id"],
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_department_head"


@pytest.mark.asyncio
async def test_department_head_limit(chain: dict[str, Any], client: AsyncClient, admin_headers):
    for index in range(1, 3):
        response = await client.post(
            "/api/departments",
            headers=admin_headers,
            json={
                "facultate_id": chain["faculty_id"],
                "nume": f"Departament Extra {index}",
                "cod": f"DX{index}",
                "sef_departament_id": chain["prof_id"],
            },
        )
        if index == 1:
            assert response.status_code == 201
        else:
            assert response.status_code == 409
            assert response.json()["code"] == "department_head_limit_exceeded"


@pytest.mark.asyncio
async def test_room_responsible_must_be_staff(chain: dict[str, Any], client: AsyncClient, admin_headers):
    student_headers = await login_headers(client, "student2@univ.ro")
    student_id = await user_id_of(client, student_headers)
    response = await client.post(
        "/api/rooms",
        headers=admin_headers,
        json={
            "departament_id": chain["department_id"],
            "cod": "UTS-FT-DT-L2",
            "nume": "Laborator Doi",
            "tip_sala": "LABORATOR",
            "capacitate": 10,
            "responsabil_id": student_id,
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_room_responsible"

    missing = await client.post(
        "/api/rooms",
        headers=admin_headers,
        json={
            "departament_id": chain["department_id"],
            "cod": "UTS-FT-DT-L3",
            "nume": "Laborator Trei",
            "tip_sala": "LABORATOR",
            "capacitate": 10,
            "responsabil_id": 999999,
        },
    )
    assert missing.status_code == 404
    assert missing.json()["code"] == "user_not_found"


@pytest.mark.asyncio
async def test_room_capacity_limits_by_type(chain: dict[str, Any], client: AsyncClient, admin_headers):
    response = await client.post(
        "/api/rooms",
        headers=admin_headers,
        json={
            "departament_id": chain["department_id"],
            "cod": "UTS-FT-DT-SRV",
            "nume": "Sala Servere Test",
            "tip_sala": "SALA_SERVERE",
            "capacitate": 50,
            "responsabil_id": chain["lab_id"],
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "room_capacity_out_of_range"


@pytest.mark.asyncio
async def test_room_duplicate_code_and_name(chain: dict[str, Any], client: AsyncClient, admin_headers):
    base = {
        "departament_id": chain["department_id"],
        "tip_sala": "LABORATOR",
        "capacitate": 10,
        "responsabil_id": chain["lab_id"],
    }
    same_code = await client.post(
        "/api/rooms", headers=admin_headers, json={**base, "cod": "UTS-FT-DT-L1", "nume": "Alta Sala"}
    )
    assert same_code.status_code == 409
    assert same_code.json()["code"] == "room_code_already_exists"

    same_name = await client.post(
        "/api/rooms", headers=admin_headers, json={**base, "cod": "UTS-FT-DT-L9", "nume": "LABORATOR TEST"}
    )
    assert same_name.status_code == 409
    assert same_name.json()["code"] == "room_name_already_exists"


@pytest.mark.asyncio
async def test_room_responsible_can_edit_limited_fields(chain: dict[str, Any], client: AsyncClient):
    room_url = f"/api/rooms/{chain['room_id']}"
    allowed = await client.patch(
        room_url, headers=chain["lab_headers"], json={"descriere": "Echipat cu 20 de stații", "capacitate": 22}
    )
    assert allowed.status_code == 200
    assert allowed.json()["capacitate"] == 22

    restricted = await client.patch(room_url, headers=chain["lab_headers"], json={"nume": "Nume Nou", "etaj": 2})
    assert restricted.status_code == 403
    assert restricted.json()["code"] == "room_fields_restricted"

    stranger_headers = await login_headers(client, "lab2@univ.ro")
    stranger = await client.patch(room_url, headers=stranger_headers, json={"descriere": "Incercare"})
    assert stranger.status_code == 403
    assert stranger.json()["code"] == "not_room_responsible"


@pytest.mark.asyncio
async def test_assign_responsible_flow(chain: dict[str, Any], client: AsyncClient, admin_headers):
    url = f"/api/rooms/{chain['room_id']}/responsible"
    unchanged = await client.put(url, headers=admin_headers, json={"responsabil_id": chain["lab_id"]})
    assert unchanged.status_code == 409
    assert unchanged.json()["code"] == "room_responsible_unchanged"

    other_headers = await login_headers(client, "lab2@univ.ro")
    other_id = await user_id_of(client, other_headers)
    changed = await client.put(url, headers=admin_headers, json={"responsabil_id": other_id})
    assert changed.status_code == 200
    assert changed.json()["responsabil"]["id_utilizator"] == other_id
    assert changed.json()["responsabil"]["email"] == "lab2@univ.ro"


@pytest.mark.asyncio
async def test_hierarchy_delete_and_deactivate_rules(chain: dict[str, Any], client: AsyncClient, admin_headers):
    delete_institution = await client.delete(f"/api/institutions/{chain['institution_id']}", headers=admin_headers)
    assert delete_institution.status_code == 409
    assert delete_institution.json()["code"] == "institution_has_faculties"

    delete_faculty = await client.delete(f"/api/faculties/{chain['faculty_id']}", headers=admin_headers)
    assert delete_faculty.json()["code"] == "faculty_has_departments"

    delete_department = await client.delete(f"/api/departments/{chain['department_id']}", headers=admin_headers)
    assert delete_department.json()["code"] == "department_has_rooms"

    deactivate_department = await client.post(
        f"/api/departments/{chain['department_id']}/deactivate", headers=admin_headers
    )
    assert deactivate_department.json()["code"] == "department_has_active_rooms"

    deactivate_faculty = await client.post(f"/api/faculties/{chain['faculty_id']}/deactivate", headers=admin_headers)
    assert deactivate_faculty.json()["code"] == "faculty_has_active_departments"

    deactivate_institution = await client.post(
        f"/api/institutions/{chain['institution_id']}/deactivate", headers=admin_headers
    )
    assert deactivate_institution.json()["code"] == "institution_has_active_faculties"


@pytest.mark.asyncio
async def test_cascading_deactivation_and_cleanup(chain: dict[str, Any], client: AsyncClient, admin_headers):
    room_off = await client.post(f"/api/rooms/{chain['room_id']}/deactivate", headers=admin_headers)
    assert room_off.status_code == 200
    assert room_off.json()["is_active"] is False

    again = await client.post(f"/api/rooms/{chain['room_id']}/deactivate", headers=admin_headers)
    assert again.json()["code"] == "room_already_inactive"

    student_headers = await login_headers(client, "student1@univ.ro")
    hidden = await client.get(f"/api/rooms/{chain['room_id']}", headers=student_headers)
    assert hidden.status_code == 403
    assert hidden.json()["code"] == "inactive_entity_access_denied"

    owner_view = await client.get(f"/api/rooms/{chain['room_id']}", headers=chain["lab_headers"])
    assert owner_view.status_code == 200

    forbidden_filter = await client.get("/api/rooms?is_active=false", headers=student_headers)
    assert forbidden_filter.status_code == 403

    assert (await client.post(f"/api/departments/{chain['department_id']}/deactivate", headers=admin_headers)).status_code == 200
    blocked_activation = await client.post(f"/api/rooms/{chain['room_id']}/activate", headers=admin_headers)
    assert blocked_activation.json()["code"] == "department_inactive"

    assert (await client.post(f"/api/faculties/{chain['faculty_id']}/deactivate", headers=admin_headers)).status_code == 200
    assert (await client.post(f"/api/institutions/{chain['institution_id']}/deactivate", headers=admin_headers)).status_code == 200

    blocked_faculty = await client.post(f"/api/faculties/{chain['faculty_id']}/activate", headers=admin_headers)
    assert blocked_faculty.json()["code"] == "institution_inactive"

    assert (await client.delete(f"/api/rooms/{chain['room_id']}", headers=admin_headers)).status_code == 204
    assert (await client.delete(f"/api/departments/{chain['department_id']}", headers=admin_headers)).status_code == 204
    assert (await client.delete(f"/api/faculties/{chain['faculty_id']}", headers=admin_headers)).status_code == 204
    assert (await client.delete(f"/api/institutions/{chain['institution_id']}", headers=admin_headers)).status_code == 204
    missing = await client.get(f"/api/institutions/{chain['institution_id']}", headers=admin_headers)
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_seed_populates_expected_structure(db_session: AsyncSession):
    await seed_academic_structure(db_session)
    await seed_academic_structure(db_session)

    async def count(model) -> int:
        return (await db_session.execute(select(func.count()).select_from(model))).scalar_one()

    assert await count(Institution) == 3
    assert await count(Faculty) == 9
    assert await count(Department) == 54
    assert await count(Room) == 324

    unassigned = (
        await db_session.execute(select(func.count()).select_from(Room).where(Room.responsabil_id.is_(None)))
    ).scalar_one()
    assert unassigned == 0


@pytest.mark.asyncio
async def test_seeded_listing_filters_and_pagination(client: AsyncClient, db_session: AsyncSession):
    await seed_academic_structure(db_session)
    headers = await login_headers(client, "student1@univ.ro")

    page = await client.get("/api/rooms?limit=5&skip=0", headers=headers)
    assert page.status_code == 200
    body = page.json()
    assert body["total"] == 324
    assert len(body["items"]) == 5
    assert body["has_more"] is True

    servers = await client.get("/api/rooms?tip_sala=SALA_SERVERE&limit=100", headers=headers)
    assert servers.json()["total"] == 54

    institutions = await client.get("/api/institutions?search=politehnica", headers=headers)
    assert institutions.json()["total"] == 2

    departments = await client.get("/api/departments?limit=100&skip=0", headers=headers)
    assert departments.json()["total"] == 54

    lab_headers = await login_headers(client, "lab1@univ.ro")
    mine = await client.get("/api/rooms/my?limit=100", headers=lab_headers)
    assert mine.json()["total"] == 15
    assert all(item["responsabil"]["email"] == "lab1@univ.ro" for item in mine.json()["items"])

    invalid_limit = await client.get("/api/rooms?limit=1000", headers=headers)
    assert invalid_limit.status_code == 422

    unknown_department = await client.get("/api/rooms?departament_id=999999", headers=headers)
    assert unknown_department.status_code == 404
    assert unknown_department.json()["code"] == "department_not_found"


@pytest.mark.asyncio
async def test_institution_stats(client: AsyncClient, db_session: AsyncSession):
    await seed_academic_structure(db_session)
    headers = await login_headers(client, "admin1@univ.ro")
    listing = await client.get("/api/institutions?search=UPT", headers=headers)
    institution_id = listing.json()["items"][0]["id"]
    stats = await client.get(f"/api/institutions/{institution_id}/stats", headers=headers)
    assert stats.status_code == 200
    assert stats.json()["numar_facultati"] == 3
    assert stats.json()["numar_departamente"] == 18
    assert stats.json()["numar_sali"] == 108

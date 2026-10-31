import asyncio
from functools import lru_cache
from typing import Optional
from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import (
    Department,
    Faculty,
    Institution,
    Permission,
    Role,
    Room,
    TipSala,
    User,
    UserRole,
    role_permissions,
)
from app.utils.roles import PERMISSION_DESCRIPTIONS, ROLE_PERMISSIONS_MAP
from app.utils.security import get_password_hash

DEFAULT_PASSWORD = "Password123!"

BASE_USERS: list[tuple[str, str, str, UserRole, Optional[str], Optional[int]]] = [
    ("Andrei", "Popescu", "student1@univ.ro", UserRole.STUDENT, "CS100001", None),
    ("Elena", "Ionescu", "student2@univ.ro", UserRole.STUDENT, "CS100002", None),
    ("Mihai", "Radu", "student3@univ.ro", UserRole.STUDENT, "CS100003", None),
    ("Ioana", "Dumitrescu", "student4@univ.ro", UserRole.STUDENT, "CS100004", None),
    ("Cristian", "Stoica", "student5@univ.ro", UserRole.STUDENT, "CS100005", None),
    ("Diana", "Marin", "student6@univ.ro", UserRole.STUDENT, "CS100006", None),
    ("Alexandru", "Vasile", "admin1@univ.ro", UserRole.ADMINISTRATOR, None, 101),
    ("Simona", "Dobre", "admin2@univ.ro", UserRole.ADMINISTRATOR, None, 102),
    ("Dan", "Georgescu", "prof1@univ.ro", UserRole.PROFESOR, None, 201),
    ("Carmen", "Nistor", "prof2@univ.ro", UserRole.PROFESOR, None, 202),
    ("Sorin", "Enache", "lab1@univ.ro", UserRole.RESPONSABIL_LABORATOR, None, 301),
    ("Laura", "Voinea", "lab2@univ.ro", UserRole.RESPONSABIL_LABORATOR, None, 302),
]

ROOM_TEMPLATES: list[dict] = [
    {"cod": "L1", "nume": "Laborator 1", "tip": TipSala.LABORATOR, "etaj": 1, "capacitate": 24, "cercetare": False},
    {"cod": "L2", "nume": "Laborator 2", "tip": TipSala.LABORATOR, "etaj": 1, "capacitate": 24, "cercetare": False},
    {"cod": "L3", "nume": "Laborator 3", "tip": TipSala.LABORATOR, "etaj": 2, "capacitate": 30, "cercetare": False},
    {"cod": "CERC", "nume": "Sală de cercetare", "tip": TipSala.SALA_CERCETARE, "etaj": 2, "capacitate": 16, "cercetare": True},
    {"cod": "ATEL", "nume": "Atelier practic", "tip": TipSala.ATELIER, "etaj": 0, "capacitate": 20, "cercetare": False},
    {"cod": "SRV", "nume": "Sală servere", "tip": TipSala.SALA_SERVERE, "etaj": -1, "capacitate": 6, "cercetare": False},
]

FIRST_NAMES = [
    "Andrei", "Mihai", "Alexandru", "Cristian", "Radu", "Vlad", "Bogdan", "Ștefan", "Adrian", "Marius",
    "Elena", "Ioana", "Maria", "Diana", "Carmen", "Laura", "Simona", "Raluca", "Andreea", "Alina",
]
LAST_NAMES = [
    "Popa", "Constantin", "Munteanu", "Stan", "Toma", "Matei", "Rusu", "Dinu",
    "Preda", "Lazăr", "Moldovan", "Barbu", "Neagu", "Ilie", "Cojocaru", "Enache",
]

PROFESSORS_PER_FACULTY = 3
LAB_RESPONSIBLES_PER_FACULTY = 2

EXISTING_STAFF_BY_FACULTY: dict[str, dict[str, list[str]]] = {
    "UPT-AC": {
        "profesori": ["prof1@univ.ro", "prof2@univ.ro"],
        "responsabili": ["lab1@univ.ro", "lab2@univ.ro"],
    }
}

INSTITUTION_SEEDS: list[dict] = [
    {
        "nume": "Universitatea Politehnica Timișoara",
        "cod": "UPT",
        "oras": "Timișoara",
        "adresa": "Piața Victoriei nr. 2",
        "email_contact": "contact.upt@univ.ro",
        "telefon": "+40256000101",
        "website": "https://www.upt.univ.ro",
        "facultati": [
            {
                "nume": "Facultatea de Automatică și Calculatoare",
                "cod": "AC",
                "descriere": "Calculatoare, automatică, informatică aplicată și securitate cibernetică.",
                "departamente": [
                    ("CTI", "Calculatoare și Tehnologia Informației"),
                    ("AIA", "Automatică și Informatică Aplicată"),
                    ("MIT", "Matematică și Informatică Teoretică"),
                    ("ISC", "Inginerie Software și Cloud"),
                    ("SEC", "Securitate Cibernetică"),
                    ("SDA", "Știința Datelor și Inteligență Artificială"),
                ],
            },
            {
                "nume": "Facultatea de Electronică, Telecomunicații și Tehnologii Informaționale",
                "cod": "ETC",
                "descriere": "Electronică, telecomunicații și sisteme embedded.",
                "departamente": [
                    ("ELA", "Electronică Aplicată"),
                    ("TLC", "Telecomunicații"),
                    ("MIC", "Microsisteme și Nanotehnologii"),
                    ("ROB", "Robotică și Sisteme Embedded"),
                    ("OPT", "Optoelectronică"),
                    ("SPS", "Procesarea Semnalelor"),
                ],
            },
            {
                "nume": "Facultatea de Mecanică",
                "cod": "MEC",
                "descriere": "Mecanică, mecatronică și ingineria autovehiculelor.",
                "departamente": [
                    ("MFN", "Mecanică Fină"),
                    ("MUT", "Mașini și Utilaje"),
                    ("TER", "Termotehnică"),
                    ("MFB", "Materiale și Fabricație"),
                    ("MTR", "Mecatronică"),
                    ("AUT", "Ingineria Autovehiculelor"),
                ],
            },
        ],
    },
    {
        "nume": "Universitatea Tehnică din Cluj-Napoca",
        "cod": "UTCN",
        "oras": "Cluj-Napoca",
        "adresa": "Strada Memorandumului nr. 28",
        "email_contact": "contact.utcn@univ.ro",
        "telefon": "+40264000102",
        "website": "https://www.utcn.univ.ro",
        "facultati": [
            {
                "nume": "Facultatea de Automatică și Calculatoare",
                "cod": "AC",
                "descriere": "Calculatoare, inteligență artificială și sisteme distribuite.",
                "departamente": [
                    ("CALC", "Calculatoare"),
                    ("AUT", "Automatică"),
                    ("IA", "Inteligență Artificială"),
                    ("RSD", "Rețele și Sisteme Distribuite"),
                    ("GRF", "Grafică și Vizualizare"),
                    ("BDS", "Baze de Date și Sisteme Informaționale"),
                ],
            },
            {
                "nume": "Facultatea de Electronică, Telecomunicații și Tehnologia Informației",
                "cod": "ETTI",
                "descriere": "Comunicații, electronică și internetul lucrurilor.",
                "departamente": [
                    ("COM", "Comunicații"),
                    ("ELE", "Electronică"),
                    ("MCW", "Microunde"),
                    ("BIO", "Bioinginerie"),
                    ("EMB", "Sisteme Embedded"),
                    ("IOT", "Internetul Lucrurilor"),
                ],
            },
            {
                "nume": "Facultatea de Construcții de Mașini",
                "cod": "CM",
                "descriere": "Tehnologia construcțiilor de mașini și producție automatizată.",
                "departamente": [
                    ("FAB", "Tehnologia Construcțiilor de Mașini"),
                    ("PRO", "Proiectare Asistată"),
                    ("MET", "Metrologie"),
                    ("ROB", "Roboți Industriali"),
                    ("MAT", "Știința Materialelor"),
                    ("APA", "Producție Automatizată"),
                ],
            },
        ],
    },
    {
        "nume": "Universitatea Politehnica din București",
        "cod": "UPB",
        "oras": "București",
        "adresa": "Splaiul Independenței nr. 313",
        "email_contact": "contact.upb@univ.ro",
        "telefon": "+40210000103",
        "website": "https://www.upb.univ.ro",
        "facultati": [
            {
                "nume": "Facultatea de Automatică și Calculatoare",
                "cod": "ACS",
                "descriere": "Calculatoare, automatică și tehnologii software moderne.",
                "departamente": [
                    ("CS", "Calculatoare"),
                    ("AII", "Automatică și Informatică Industrială"),
                    ("ISM", "Ingineria Sistemelor Multimedia"),
                    ("TSM", "Tehnologii Software Moderne"),
                    ("IED", "Inginerie Electronică Digitală"),
                    ("ROB", "Robotică"),
                ],
            },
            {
                "nume": "Facultatea de Inginerie Electrică",
                "cod": "IE",
                "descriere": "Electrotehnică, mașini electrice și electronică de putere.",
                "departamente": [
                    ("EE", "Electrotehnică"),
                    ("MEL", "Mașini Electrice"),
                    ("ELP", "Electronică de Putere"),
                    ("ACT", "Acționări Electrice"),
                    ("MSR", "Măsurări Electrice"),
                    ("MIN", "Management Industrial"),
                ],
            },
            {
                "nume": "Facultatea de Energetică",
                "cod": "EN",
                "descriere": "Termoenergetică, hidroenergetică și surse regenerabile.",
                "departamente": [
                    ("TER", "Termoenergetică"),
                    ("HID", "Hidroenergetică"),
                    ("NUC", "Energetică Nucleară"),
                    ("REG", "Surse Regenerabile"),
                    ("SEE", "Sisteme Electroenergetice"),
                    ("EFI", "Eficiență Energetică"),
                ],
            },
        ],
    },
]


@lru_cache(maxsize=1)
def default_password_hash() -> str:
    return get_password_hash(DEFAULT_PASSWORD)


async def seed_roles_and_permissions(db: AsyncSession) -> None:
    for permission_code, description in PERMISSION_DESCRIPTIONS.items():
        existing = await db.execute(select(Permission).where(Permission.code == permission_code.value))
        if not existing.scalars().first():
            db.add(Permission(code=permission_code.value, description=description))
    await db.flush()

    permission_ids = {
        code: permission_id for code, permission_id in (await db.execute(select(Permission.code, Permission.id))).all()
    }

    for role_enum in UserRole:
        result = await db.execute(select(Role).where(Role.name == role_enum.value))
        role = result.scalars().first()
        if not role:
            role = Role(name=role_enum.value, description=f"Rol {role_enum.value}")
            db.add(role)
            await db.flush()

        desired_ids = [
            permission_ids[permission.value]
            for permission in ROLE_PERMISSIONS_MAP.get(role_enum, [])
            if permission.value in permission_ids
        ]
        await db.execute(delete(role_permissions).where(role_permissions.c.role_id == role.id))
        if desired_ids:
            await db.execute(
                insert(role_permissions).values(
                    [{"role_id": role.id, "permission_id": permission_id} for permission_id in desired_ids]
                )
            )

    await db.commit()


async def seed_users(db: AsyncSession) -> None:
    role_ids = {name: role_id for name, role_id in (await db.execute(select(Role.name, Role.id))).all()}
    existing_emails = set((await db.execute(select(User.email))).scalars().all())

    for first_name, last_name, email, role, numar_matricol, id_angajat in BASE_USERS:
        if email in existing_emails or role.value not in role_ids:
            continue
        db.add(
            User(
                nume=f"{first_name} {last_name}",
                email=email,
                parola_hash=default_password_hash(),
                role_id=role_ids[role.value],
                numar_matricol=numar_matricol,
                id_angajat=id_angajat,
                is_active=True,
            )
        )

    await db.commit()


class StaffFactory:
    def __init__(
        self,
        db: AsyncSession,
        password_hash: str,
        role_ids: dict[str, int],
        existing_users: dict[str, int],
    ) -> None:
        self.db = db
        self.password_hash = password_hash
        self.role_ids = role_ids
        self.existing_users = existing_users
        self.counter = 0
        self.employee_number = 1000

    async def ensure(self, email: str, role: UserRole) -> int:
        if email in self.existing_users:
            return self.existing_users[email]
        first_name = FIRST_NAMES[(self.counter * 7 + 3) % len(FIRST_NAMES)]
        last_name = LAST_NAMES[(self.counter * 5 + 1) % len(LAST_NAMES)]
        self.counter += 1
        self.employee_number += 1
        user = User(
            nume=f"{first_name} {last_name}",
            email=email,
            parola_hash=self.password_hash,
            role_id=self.role_ids[role.value],
            numar_matricol=None,
            id_angajat=self.employee_number,
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()
        self.existing_users[email] = user.id_utilizator
        return user.id_utilizator

    async def faculty_staff(self, institution_code: str, faculty_code: str) -> tuple[list[int], list[int]]:
        faculty_key = f"{institution_code}-{faculty_code}"
        overrides = EXISTING_STAFF_BY_FACULTY.get(faculty_key, {})
        slug = f"{institution_code}.{faculty_code}".lower()
        professor_emails = list(overrides.get("profesori", []))
        responsible_emails = list(overrides.get("responsabili", []))
        for index in range(len(professor_emails) + 1, PROFESSORS_PER_FACULTY + 1):
            professor_emails.append(f"prof.{slug}.{index}@univ.ro")
        for index in range(len(responsible_emails) + 1, LAB_RESPONSIBLES_PER_FACULTY + 1):
            responsible_emails.append(f"lab.{slug}.{index}@univ.ro")
        professors = [await self.ensure(email, UserRole.PROFESOR) for email in professor_emails]
        responsibles = [await self.ensure(email, UserRole.RESPONSABIL_LABORATOR) for email in responsible_emails]
        return professors, responsibles


async def _load_role_ids(db: AsyncSession) -> Optional[dict[str, int]]:
    result = await db.execute(select(Role.name, Role.id))
    role_ids = {name: role_id for name, role_id in result.all()}
    required = {UserRole.PROFESOR.value, UserRole.RESPONSABIL_LABORATOR.value}
    if not required.issubset(role_ids):
        return None
    return role_ids


async def seed_academic_structure(db: AsyncSession) -> None:
    role_ids = await _load_role_ids(db)
    if role_ids is None:
        return

    existing_codes = set((await db.execute(select(Institution.cod))).scalars().all())
    pending = [seed for seed in INSTITUTION_SEEDS if seed["cod"] not in existing_codes]
    if not pending:
        return

    existing_users = {
        email: user_id for email, user_id in (await db.execute(select(User.email, User.id_utilizator))).all()
    }
    factory = StaffFactory(db, default_password_hash(), role_ids, existing_users)

    for institution_seed in pending:
        institution = Institution(
            nume=institution_seed["nume"],
            cod=institution_seed["cod"],
            oras=institution_seed["oras"],
            adresa=institution_seed["adresa"],
            email_contact=institution_seed["email_contact"],
            telefon=institution_seed["telefon"],
            website=institution_seed["website"],
            is_active=True,
        )
        db.add(institution)
        await db.flush()

        for faculty_seed in institution_seed["facultati"]:
            faculty = Faculty(
                institutie_id=institution.id,
                nume=faculty_seed["nume"],
                cod=faculty_seed["cod"],
                descriere=faculty_seed["descriere"],
                is_active=True,
            )
            db.add(faculty)
            await db.flush()

            professors, responsibles = await factory.faculty_staff(institution.cod, faculty.cod)
            lab_cursor = 0

            for department_index, (department_code, department_name) in enumerate(faculty_seed["departamente"]):
                head_id = professors[department_index % len(professors)]
                department = Department(
                    facultate_id=faculty.id,
                    nume=department_name,
                    cod=department_code,
                    descriere=f"Departamentul {department_name} din cadrul {faculty.nume}.",
                    sef_departament_id=head_id,
                    is_active=True,
                )
                db.add(department)
                await db.flush()

                for template in ROOM_TEMPLATES:
                    if template["cercetare"]:
                        responsible_id = head_id
                    else:
                        responsible_id = responsibles[lab_cursor % len(responsibles)]
                        lab_cursor += 1
                    db.add(
                        Room(
                            departament_id=department.id,
                            cod=f"{institution.cod}-{faculty.cod}-{department_code}-{template['cod']}",
                            nume=template["nume"],
                            tip_sala=template["tip"],
                            etaj=template["etaj"],
                            capacitate=template["capacitate"],
                            descriere=f"{template['nume']} - {department_name}.",
                            responsabil_id=responsible_id,
                            is_active=True,
                        )
                    )
                await db.flush()

        await db.commit()


async def seed_base(db: AsyncSession) -> None:
    await seed_roles_and_permissions(db)
    await seed_users(db)


async def seed_all(db: AsyncSession) -> None:
    await seed_base(db)
    await seed_academic_structure(db)


async def _run() -> None:
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await seed_all(session)


if __name__ == "__main__":
    asyncio.run(_run())

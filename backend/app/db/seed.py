import asyncio
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Optional
from sqlalchemy import delete, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import (
    Category,
    Department,
    Faculty,
    Institution,
    Permission,
    Reservation,
    Resource,
    Role,
    Room,
    StareRezervare,
    StareTehnica,
    TechnicalHistory,
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
    first_faculty = (await db.execute(select(Faculty).order_by(Faculty.id.asc()))).scalars().first()
    faculty_id_for_student = first_faculty.id if first_faculty else None

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
                facultate_id=faculty_id_for_student if role == UserRole.STUDENT else None,
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

        first_fac = (await db.execute(select(Faculty).order_by(Faculty.id.asc()))).scalars().first()
        if first_fac and UserRole.STUDENT.value in role_ids:
            await db.execute(
                update(User)
                .where(User.role_id == role_ids[UserRole.STUDENT.value], User.facultate_id.is_(None))
                .values(facultate_id=first_fac.id)
            )
        await db.commit()


async def seed_resources_and_reservations(db: AsyncSession) -> None:
    # 1. Categories
    categories_data = [
        ("Calculatoare & Servere HPC", "Sisteme de calcul de mare performanță, clustere GPU, stații grafice de lucru."),
        ("Robotică & Sisteme Autonome", "Brațe robotice industriale, roboți mobili, drone autonome și senzori LiDAR."),
        ("Aparatură Măsură & Osciloscoape", "Osciloscoape digitale, analizoare de spectru, multimetre și generatoare de semnal."),
        ("Kituri IoT & Sisteme Embedded", "Plăci dezvoltare FPGA, microcontrolere avansate și module comunicații IoT."),
        ("Imprimare 3D & Prototipare Rapidă", "Imprimante 3D FDM/SLA industriale, gravatoare laser și stații lipire SMD."),
    ]

    cat_map: dict[str, Category] = {}
    for cat_name, cat_desc in categories_data:
        existing = (await db.execute(select(Category).where(Category.nume == cat_name))).scalars().first()
        if not existing:
            cat = Category(nume=cat_name, descriere=cat_desc, is_active=True)
            db.add(cat)
            await db.flush()
            cat_map[cat_name] = cat
        else:
            cat_map[cat_name] = existing

    # Find some rooms
    rooms = (await db.execute(select(Room).order_by(Room.id.asc()).limit(10))).scalars().all()
    if not rooms:
        await db.commit()
        return

    # Find users
    student1 = (await db.execute(select(User).where(User.email == "student1@univ.ro"))).scalars().first()
    student2 = (await db.execute(select(User).where(User.email == "student2@univ.ro"))).scalars().first()
    prof1 = (await db.execute(select(User).where(User.email == "prof1@univ.ro"))).scalars().first()
    lab1 = (await db.execute(select(User).where(User.email == "lab1@univ.ro"))).scalars().first()

    # 2. Resources
    resources_data = [
        {
            "nume": "Stație Grafică Deep Learning RTX 4090",
            "cod": "HPC-RTX-4090-01",
            "cat": "Calculatoare & Servere HPC",
            "room_idx": 0,
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Stație dedicată prelucrării de imagini și modele AI.",
            "specs": "Intel Core i9 14900K, 128GB DDR5 5600MHz, Dual Nvidia GeForce RTX 4090 24GB, 4TB NVMe SSD.",
        },
        {
            "nume": "Cluster GPU Deep Learning 8x A100",
            "cod": "HPC-A100-NODE-01",
            "cat": "Calculatoare & Servere HPC",
            "room_idx": 1 % len(rooms),
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Nod cluster pentru antrenare paralelă LLM și simulări masive.",
            "specs": "8x Nvidia A100 80GB SXM4, 1024GB RAM ECC, 30TB NVMe RAID-0, Interfață 200Gb/s InfiniBand.",
        },
        {
            "nume": "Braț Robotic Universal Robots UR3e",
            "cod": "ROB-UR3E-01",
            "cat": "Robotică & Sisteme Autonome",
            "room_idx": 2 % len(rooms),
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Braț robotic colaborativ cu 6 grade de libertate pentru cercetare aplicată.",
            "specs": "Rază de acțiune 500mm, sarcină utilă 3kg, precizie +/-0.03mm, senzor integrat de forță și cuplu.",
        },
        {
            "nume": "Platformă Mobilă Cercetare TurtleBot 4 Pro",
            "cod": "ROB-TB4-01",
            "cat": "Robotică & Sisteme Autonome",
            "room_idx": 3 % len(rooms),
            "stare": StareTehnica.IN_MENTENANTA,
            "desc": "Platformă mobilă autonomă pentru mapare SLAM și navigație autonomă ROS 2.",
            "specs": "Bază mecanică iRobot Create 3, SBC Raspberry Pi 4 4GB, LiDAR 2D RPLIDAR A1M8, Cameră OAK-D-Pro.",
        },
        {
            "nume": "Osciloscop Digital Keysight InfiniiVision 1GHz",
            "cod": "MS-KEYSIGHT-1GHZ",
            "cat": "Aparatură Măsură & Osciloscoape",
            "room_idx": 4 % len(rooms),
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Osciloscop digital de înaltă precizie pentru semnale rapide.",
            "specs": "4 canale analogice, lățime bandă 1 GHz, rată eșantionare 5 GSa/s, decodoare I2C/SPI/CAN/LIN.",
        },
        {
            "nume": "Analizor de Spectru Rohde & Schwarz FPC1500",
            "cod": "MS-RS-FPC1500",
            "cat": "Aparatură Măsură & Osciloscoape",
            "room_idx": 5 % len(rooms),
            "stare": StareTehnica.DEFECTA,
            "desc": "Analizor de spectru cu funcție de generator de urmărire și analizor rețea vectorial.",
            "specs": "Gama frecvențe 5 kHz până la 3 GHz, zgomot de fond -165 dBm, ecran color WXGA 10.1 inch.",
        },
        {
            "nume": "Kit Dezvoltare FPGA Xilinx Zynq UltraScale+",
            "cod": "IOT-ZYNQ-MPSoC",
            "cat": "Kituri IoT & Sisteme Embedded",
            "room_idx": 6 % len(rooms),
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Platformă de calcul eterogen pentru procesare semnal și inteligență artificială edge.",
            "specs": "Quad-core ARM Cortex-A53, Dual Cortex-R5F, FPGA UltraScale+ 256k logic cells, 4GB DDR4.",
        },
        {
            "nume": "Imprimantă 3D Bambu Lab X1-Carbon Combo",
            "cod": "PRT-BAMBU-X1C",
            "cat": "Imprimare 3D & Prototipare Rapidă",
            "room_idx": 7 % len(rooms),
            "stare": StareTehnica.DISPONIBILA,
            "desc": "Imprimantă 3D rapidă de înaltă rezoluție cu cameră închisă pentru filamente tehnice.",
            "specs": "Volum 256x256x256mm, sistem automat AMS 4 materiale, viteză până la 500mm/s, senzor dual LiDAR.",
        },
    ]

    res_map: dict[str, Resource] = {}
    for r_data in resources_data:
        existing = (await db.execute(select(Resource).where(Resource.cod_inventar == r_data["cod"]))).scalars().first()
        if not existing:
            cat = cat_map.get(r_data["cat"])
            room = rooms[r_data["room_idx"]]
            res = Resource(
                nume=r_data["nume"],
                cod_inventar=r_data["cod"],
                categorie_id=cat.id if cat else 1,
                sala_id=room.id,
                stare_tehnica=r_data["stare"],
                descriere=r_data["desc"],
                specificatii=r_data["specs"],
                is_active=True,
            )
            db.add(res)
            await db.flush()
            res_map[r_data["cod"]] = res
        else:
            res_map[r_data["cod"]] = existing

    # 3. Reservations
    now = datetime.now(timezone.utc)
    if student1 and "HPC-RTX-4090-01" in res_map:
        existing_res = (
            await db.execute(
                select(Reservation).where(
                    Reservation.resursa_id == res_map["HPC-RTX-4090-01"].id,
                    Reservation.utilizator_id == student1.id_utilizator,
                )
            )
        ).scalars().first()
        if not existing_res:
            db.add(
                Reservation(
                    resursa_id=res_map["HPC-RTX-4090-01"].id,
                    utilizator_id=student1.id_utilizator,
                    data_inceput=now - timedelta(days=1),
                    data_sfarsit=now + timedelta(days=2),
                    stare=StareRezervare.APROBATA,
                    scop="Antrenare modele lingvistice mici (SLM) pentru lucrarea de licență.",
                )
            )

    if student2 and "ROB-UR3E-01" in res_map:
        existing_res = (
            await db.execute(
                select(Reservation).where(
                    Reservation.resursa_id == res_map["ROB-UR3E-01"].id,
                    Reservation.utilizator_id == student2.id_utilizator,
                )
            )
        ).scalars().first()
        if not existing_res:
            db.add(
                Reservation(
                    resursa_id=res_map["ROB-UR3E-01"].id,
                    utilizator_id=student2.id_utilizator,
                    data_inceput=now + timedelta(days=1),
                    data_sfarsit=now + timedelta(days=4),
                    stare=StareRezervare.IN_ASTEPTARE,
                    scop="Experimente de cinematică directă și inversă în laboratorul de cercetare.",
                )
            )

    if prof1 and "IOT-ZYNQ-MPSoC" in res_map:
        existing_res = (
            await db.execute(
                select(Reservation).where(
                    Reservation.resursa_id == res_map["IOT-ZYNQ-MPSoC"].id,
                    Reservation.utilizator_id == prof1.id_utilizator,
                )
            )
        ).scalars().first()
        if not existing_res:
            db.add(
                Reservation(
                    resursa_id=res_map["IOT-ZYNQ-MPSoC"].id,
                    utilizator_id=prof1.id_utilizator,
                    data_inceput=now - timedelta(days=7),
                    data_sfarsit=now - timedelta(days=2),
                    stare=StareRezervare.FINALIZATA,
                    scop="Pregătire suport curs și laborator Sisteme Reconfigurabile.",
                )
            )

    # 4. Technical History
    if lab1 and "ROB-TB4-01" in res_map:
        existing_th = (
            await db.execute(
                select(TechnicalHistory).where(
                    TechnicalHistory.resursa_id == res_map["ROB-TB4-01"].id,
                )
            )
        ).scalars().first()
        if not existing_th:
            db.add(
                TechnicalHistory(
                    resursa_id=res_map["ROB-TB4-01"].id,
                    utilizator_id=lab1.id_utilizator,
                    tip_interventie="MENTENANTA_PREVENTIVA",
                    descriere="Calibrare senzori odometrie, curățare ansamblu optic LiDAR și actualizare firmware ROS 2 Jazzy.",
                    stare_anterioara=StareTehnica.DISPONIBILA,
                    stare_noua=StareTehnica.IN_MENTENANTA,
                )
            )

    if prof1 and "MS-RS-FPC1500" in res_map:
        existing_th = (
            await db.execute(
                select(TechnicalHistory).where(
                    TechnicalHistory.resursa_id == res_map["MS-RS-FPC1500"].id,
                )
            )
        ).scalars().first()
        if not existing_th:
            db.add(
                TechnicalHistory(
                    resursa_id=res_map["MS-RS-FPC1500"].id,
                    utilizator_id=prof1.id_utilizator,
                    tip_interventie="RAPORT_DEFECTIUNE",
                    descriere="Atenuatorul de intrare RF s-a ars în urma unei supratensiuni accidentale pe portul N (50 Ohm). Trimis la service autorizat pentru înlocuire modul.",
                    stare_anterioara=StareTehnica.DISPONIBILA,
                    stare_noua=StareTehnica.DEFECTA,
                )
            )

    await db.commit()


async def seed_base(db: AsyncSession) -> None:
    await seed_roles_and_permissions(db)
    await seed_users(db)


async def seed_all(db: AsyncSession) -> None:
    await seed_base(db)
    await seed_academic_structure(db)
    await seed_resources_and_reservations(db)


async def _run() -> None:
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await seed_all(session)


if __name__ == "__main__":
    asyncio.run(_run())

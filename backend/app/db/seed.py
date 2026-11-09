import asyncio
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Optional
from sqlalchemy import delete, insert, select, text, update
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


CATALOG_BLUEPRINTS: list[dict] = [
    {
        "category": "Calculatoare & Servere HPC",
        "image": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-001", "Workstation AI Deep Learning Nr. 1", "RTX 4090 24GB · 64GB DDR5 · Intel i9-14900K · Lab 204", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-002", "Workstation AI Deep Learning Nr. 2", "RTX 4090 24GB · 128GB DDR5 · Threadripper PRO · Lab 204", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-003", "Server NVIDIA DGX Station A100", "4x NVIDIA A100 80GB · 512GB RAM · NVLink · Sala Servere", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-004", "Nod Compute HPC NVIDIA H100 PCIe", "2x H100 80GB · Dual AMD EPYC 9654 · 1TB ECC · Sala Servere", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-005", "Stație Grafică Simulări CFD & CAD", "NVIDIA RTX 6000 Ada 48GB · Xeon W9-3495X · 256GB RAM · Lab 202", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-006", "Workstation Render & Fotogrammetrie", "Dual RTX 4080 Super · 128GB DDR5 · 8TB NVMe RAID · Lab 204", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-007", "Server Inferență LLM NVIDIA L40S", "4x NVIDIA L40S 48GB · Dual Xeon Gold · 512GB RAM · Sala Servere", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-008", "Stație Procesare Semnal & MATLAB HPC", "AMD Ryzen 9 7950X3D · RTX 4070 Ti Super · 64GB RAM · Lab 201", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-009", "Cluster Mini-HPC Kubernetes 8 Noduri", "8x Intel NUC 13 Pro · 256GB RAM Cumulat · 10GbE Switch · Lab 206", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-010", "Apple Mac Studio M2 Ultra AI Workstation", "M2 Ultra 76-core GPU · 192GB Unified Memory · 4TB SSD · Lab 204", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-011", "Workstation Cuantică & Simulare Qiskit", "AMD Threadripper 7970X · 256GB ECC · RTX 4090 · Lab Cercetare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-012", "Server Stocare Distribuită Ceph NVMe", "24x 3.84TB U.3 NVMe · Dual 100GbE QSFP28 · Sala Servere", StareTehnica.IN_MENTENANTA),
        ],
    },
    {
        "category": "Robotică & Sisteme Autonome",
        "image": "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-013", "Braț Robotic Educațional Niryo Ned 2 Nr. 1", "6 axe · ROS2 Humble · Gripper Vacuum & Magnetic · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-014", "Braț Robotic Educațional Niryo Ned 2 Nr. 2", "6 axe · ROS2 Humble · Kit Conveior & Cameră Vision · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-015", "Braț Robotic Colaborativ Universal Robots UR3e", "6 DOF · Sarcină 3kg · Senzor Forță/Cuplu Integrat · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-016", "Braț Robotic Colaborativ Universal Robots UR5e", "6 DOF · Sarcină 5kg · Rază 850mm · Gripper Robotiq 2F-85 · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-017", "Robot Mobil Autonom TurtleBot 4 Pro Nr. 1", "ROS2 · LiDAR 2D RPLIDAR A1M8 · Cameră OAK-D Pro · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-018", "Robot Mobil Autonom TurtleBot 4 Pro Nr. 2", "ROS2 · Nav2 SLAM · Senzori IR & IMU · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-019", "Robot Patruped Unitree Go2 Edu Plus", "LiDAR 4D L1 · Jetson Orin NX 100 TOPS · ROS2 SDK · Lab Robotică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-020", "Braț Robotic Franka Emika Research 3", "7 DOF · Control Impedanță 1 kHz · ROS2 / C++ API · Lab Cercetare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-021", "Platformă Mobilă Omnidirecțională AgileX Scout Mini", "4WD Mecanum · LiDAR Velodyne VLP-16 · CAN Bus · Lab Robotică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-022", "Braț Robotic Industrial xArm 6 UFACTORY", "6 axe · Servo Harmonic Drive · Python / ROS2 SDK · Lab 208", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-023", "Mână Robotică Dexteră Allegro Hand v4", "16 DOF · 4 Degete Actuate · Senzori Tactili · Lab Cercetare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-024", "Sistem Motion Capture OptiTrack V120:Trio", "3 Camere IR 120 FPS · Tracking Sub-milimetric Roboți · Lab 208", StareTehnica.DISPONIBILA),
        ],
    },
    {
        "category": "Aparatură Măsură & Osciloscoape",
        "image": "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-025", "Osciloscop Digital Rohde & Schwarz RTB2004 Nr. 1", "300 MHz · 4 Canale · 2.5 GSa/s · ADC 10-bit · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-026", "Osciloscop Digital Rohde & Schwarz RTB2004 Nr. 2", "300 MHz · 16 Canale Logice MSO · Generator Arbitrar · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-027", "Osciloscop Mixed-Domain Keysight InfiniiVision 3000G", "1 GHz · 4 Canale Analogice + 16 Digitale · 5 GSa/s · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-028", "Osciloscop Tektronix MSO44 Mixed Signal", "500 MHz · 4 Canale FlexChannel · 6.25 GSa/s · ADC 12-bit · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-029", "Analizor de Spectru RF Rohde & Schwarz FPC1500", "5 kHz – 3 GHz · Vector Network Analyzer 1-Port · Generator RF · Lab 106", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-030", "Analizor de Rețea Vectorial Keysight FieldFox N9914B", "6.5 GHz · VNA 2-Porturi · Analizor Spectru & Cablu · Lab 106", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-031", "Generator de Semnal Arbitrar Keysight Trueform 33622A", "120 MHz · 2 Canale · 1 GSa/s · Jitter < 1 ps · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-032", "Multimetru Digital de Precizie Keysight 34465A", "6.5 Digiti · Truevolt · Măsurare Curent pA · LXI/USB · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-033", "Sursă Programabilă Triplă Rohde & Schwarz NGE103B", "3 Canale Izolate · 32V / 3A per Canal · 100W · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-034", "Analizor Logic & Protocol Saleae Logic Pro 16", "16 Canale · 500 MSa/s Digital · 50 MSa/s Analogic · SPI/I2C/CAN · Lab 105", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-035", "Punte RLC de Precizie Keysight E4980AL", "20 Hz – 1 MHz · Acuratețe 0.05% · Caracterizare Componente · Lab 106", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-036", "Cameră Termografică în Infraroșu FLIR E86", "Rezoluție 464x348 IR · -20°C la 1500°C · Lentile AutoCal · Lab 105", StareTehnica.IN_MENTENANTA),
        ],
    },
    {
        "category": "Kituri IoT & Sisteme Embedded",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-037", "Kit NVIDIA Jetson Orin Nano Dev Kit Nr. 1", "40 TOPS AI · 8GB LPDDR5 · GPU Ampere 1024-core · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-038", "Kit NVIDIA Jetson Orin Nano Dev Kit Nr. 2", "40 TOPS AI · 8GB LPDDR5 · NVMe 512GB + Cameră IMX219 · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-039", "Kit NVIDIA Jetson AGX Orin 64GB Developer Kit", "275 TOPS INT8 · 2048-core GPU · 12-core ARM Cortex-A78AE · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-040", "Placă FPGA AMD Xilinx Zynq UltraScale+ ZCU104", "MPSoC Quad Cortex-A53 · FPGA FinFET+ · Video Codec · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-041", "Kit FPGA Digilent Nexys A7-100T Artix-7", "Xilinx Artix-7 XC7A100T · 128MB DDR2 · Pmod / VGA / USB · Lab 209", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-042", "Placă SoC FPGA Terasic DE10-Nano Cyclone V", "Intel Cyclone V SoC · Dual ARM Cortex-A9 · HDMI / Arduino Header · Lab 209", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-043", "Kit Dezvoltare STMicroelectronics STM32H747I-DISCO", "Dual-Core Cortex-M7 480MHz + M4 · Display Touch MIPI-DSI · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-044", "Gateway LoRaWAN Industrial RAK7289V2 WisGate Edge Pro", "16 Canale LoRa · GPS · PoE · Server ChirpStack Integrat · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-045", "Kit Edge AI Raspberry Pi 5 8GB + Hailo-8L AI HAT+", "26 TOPS Neural Accelerator · PCIe Gen 3 · Cameră Global Shutter · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-046", "Kit Nordic nRF5340 DK Bluetooth 5.4 & Thread/Matter", "Dual ARM Cortex-M33 · NFC · Profiler Putere PPK2 Inclus · Lab 210", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-047", "Sistem Achiziție Date National Instruments CompactDAQ", "Șasiu cDAQ-9178 8-Slot · Module Termocuple, Accelerometre & DIO · Lab 209", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-048", "Placă Evaluare RISC-V SiFive HiFive Unmatched Rev B", "SiFive FU740 5-Core 64-bit RISC-V · 16GB DDR4 · PCIe x16 · Lab 210", StareTehnica.DISPONIBILA),
        ],
    },
    {
        "category": "Imprimare 3D & Prototipare Rapidă",
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-049", "Imprimantă 3D Bambu Lab X1-Carbon Combo AMS Nr. 1", "CoreXY 500 mm/s · Multi-filament 4 Culori · LiDAR Calibrare · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-050", "Imprimantă 3D Bambu Lab X1-Carbon Combo AMS Nr. 2", "CoreXY 500 mm/s · Hotend 300°C Fibră Carbon/PAHT-CF · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-051", "Imprimantă 3D Industrială Bambu Lab X1E Enterprise", "Cameră Încălzită 60°C · Filtrare HEPA/Carbon · Ethernet WPA2-E · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-052", "Imprimantă 3D SLA Rășină Formlabs Form 4", "Tehnologie Low Force Display · Rezoluție 50 Microni · Wash & Cure · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-053", "Imprimantă 3D Prusa MK4S + Enclosure Oficial", "Input Shaper · Extruder Nextruder · Loadcell Nivelare Perfectă · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-054", "Imprimantă 3D Format Mare Prusa XL 5-Toolheads", "Volum 360x360x360 mm · Schimbător Automat 5 Capete · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-055", "Mașină Frezare PCB & Prototipare LPKF ProtoMat S64", "Turație 60.000 RPM · Schimbător 15 Scule · Cameră Fiducială · Atelier Practic", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-056", "Gravator și Cutter Laser CO2 xTool P2 55W", "Suprafață 600x300 mm · Două Camere AI 16MP · Rotary Attachment · Atelier Practic", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-057", "Scaner 3D Metrologic Einstar Vega All-in-One", "VCSEL + MEMS · Acuratețe 0.05 mm · Procesare Standalone · Lab Prototipare", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-058", "Stație Rework SMD & Aer Cald JBC DDE-2C + JTSE", "2 Canale Inteligente · Profil Termic BGA · Pensetă Termică · Atelier Practic", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-059", "Cuptor Reflow SMD cu Convecție T962C Pro", "Zonă Lipire 400x600 mm · 8 Profile Programabile PID · Atelier Practic", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-060", "CNC Desktop 5 Axe Pocket NC V2-10", "5 Axe Simultane · Aluminiu & Titan · Spindel 10.000 RPM · Atelier Practic", StareTehnica.IN_MENTENANTA),
        ],
    },
    {
        "category": "Drone & Vehicule Autonome",
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-061", "Dronă Industrială DJI Matrice 350 RTK", "Poziționare Centimetrică RTK · Autonomie 55 min · IP55 · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-062", "Dronă Termografică & Inspecție DJI Mavic 3 Enterprise Thermal", "Cameră Termică 640x512 + Zoom Hibrid 56x + Modul RTK · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-063", "Swarm 6 Nano-Drone Bitcraze Crazyflie 2.1+", "Deck Poziționare Lighthouse · Flow Deck v2 · AI Deck GAP8 · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-064", "Dronă Dezvoltare Autonomă ModalAI Starling 2 Max", "VOXL 2 Snapdragon QRB5165 · PX4 Autopilot · ROS2 Visual SLAM · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-065", "Senzor LiDAR 3D Ouster OS1-64 Rev 7", "64 Canale · Rază 120m · 2.6M Puncte/s · PTP Sync ROS2 · Lab Vehicule", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-066", "Cameră Stereo Adâncime Stereolabs ZED X + Box Orin NX", "Global Shutter GMSL2 · Neural Depth Engine · IP66 · Lab Vehicule", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-067", "Platformă Auto Autonomă 1/10 F1TENTH Racing Car", "NVIDIA Jetson Orin NX · LiDAR Hokuyo UST-10LX · VESC · Lab Vehicule", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-068", "Receptor GNSS RTK Multi-Band Septentrio AsteRx-m3 Pro+", "GPS/Galileo/BeiDou · Dual-Antenna Heading · Anti-Jamming · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-069", "Cameră Multispectrală AgEagle MicaSense RedEdge-P", "6 Bande Spectrale · Global Shutter · Cartografiere Vegetație · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-070", "Unitate Inerțială IMU Tactică Xsens MTi-680G RTK", "INS/GNSS Integrat · Roll/Pitch 0.05° · Interfață CAN/RS232 · Lab Vehicule", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-071", "Simulator Hardware-in-the-Loop Pixhawk Cube Orange+ Suite", "Autopilot Triple-Redundant · Here3+ CAN GPS · RFD900x Telemetry · Lab Drone", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-072", "ROV Subacvatic BlueROV2 Heavy Configuration", "8 Propulsoare T200 · Adâncime 100m · Sonar Ping360 · Lab Vehicule", StareTehnica.DISPONIBILA),
        ],
    },
    {
        "category": "Rețelistică & Securitate Cibernetică",
        "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-073", "Switch L3 Enterprise Cisco Catalyst 9300-48P", "48 Porturi PoE+ · Uplink 4x 25G SFP28 · Cisco IOS XE · Lab Rețele", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-074", "Firewall Next-Gen Palo Alto Networks PA-440", "Threat Prevention 1.2 Gbps · Zero Trust · PanOS · Lab Securitate", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-075", "Software Defined Radio Ettus USRP B210 Dual-Channel", "70 MHz – 6 GHz · Full-Duplex 2x2 MIMO · Spartan-6 FPGA · Lab Telecom", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-076", "Software Defined Radio Ettus USRP X310 + TwinRX", "10 MHz – 6 GHz · Kintex-7 FPGA · Dual 10GbE · GNU Radio · Lab Telecom", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-077", "Platformă Analiză Side-Channel & Fault Injection ChipWhisperer-Husky", "ADC 200 MS/s · Glitching Ceas/Tensiune · Criptografie Hardware · Lab Securitate", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-078", "Router Core MikroTik CCR2216-1G-12XS-2XQ", "2x 100G QSFP28 · 12x 25G SFP28 · L3 Hardware Offloading · Lab Rețele", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-079", "Generator Trafic și Tester Rețea Keysight IxNetwork Portable", "Testare L2-L7 · 10G/25G Ethernet · Validare SDN OpenFlow · Lab Rețele", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-080", "Kit Audit Securitate RF HackRF One Portapack H2+ & Proxmark3 RDV4", "1 MHz – 6 GHz SDR + Analiză RFID/NFC · Lab Securitate", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-081", "Stație Bază 5G Privată Amarisoft Callbox Classic", "gNB 5G NR SA/NSA + 5GC Core Integrat · Testare IoT 5G · Lab Telecom", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-082", "Hardware Security Module Thales Luna Network HSM A700", "FIPS 140-3 Level 3 · Generare Chei Criptografice & PKI · Lab Securitate", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-083", "Reflectometru Optic OTDR EXFO MaxTester 730C", "Fibră Optică SM/MM · 1310/1550/1625 nm · Dinamică 39 dB · Lab Telecom", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-084", "Aparat Sudură Fibră Optică cu Aliniere pe Miez Fujikura 90S+", "Timp Sudură 7s · Pierdere 0.01 dB · Cleaver CT50 Inclus · Lab Telecom", StareTehnica.DISPONIBILA),
        ],
    },
    {
        "category": "Sisteme Optoelectronice & Fotonică",
        "image": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-085", "Spectrometru Optic UV-VIS-NIR Ocean Insight Flame-T", "200 – 1025 nm · Rezoluție 1.5 nm · Fibră Optică SMA905 · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-086", "Masă Optică Antivibrații Thorlabs Nexus 1200x900 mm", "Izolare Pneumatică · Grilă M6 25mm · Kit Componente Optice · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-087", "Laser Stabilizat HeNe Thorlabs HRS015B 632.8 nm", "Stabilizare Frecvență ±2 MHz · Polarizare Liniară · Interferometrie · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-088", "Cameră de Mare Viteză Chronos 2.1-HD 1000 FPS", "1920x1080 la 1000 FPS · Până la 24.000 FPS · 32GB RAM · Lab Optoelectronică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-089", "Modulator Spațial de Lumină Holoeye Pluto-2.1 LCoS", "1920x1080 Pixeli · Holografie Digitală & Pensete Optice · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-090", "Analizor Profil Fascicul Laser Thorlabs BP209-VIS", "200 – 1100 nm · Măsurare M², Diametru și Gaussian Fit · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-091", "Cameră Hiperspectrală Specim IQ VNIR", "400 – 1000 nm · 204 Bande Spectrale · Procesare On-Device · Lab Optoelectronică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-092", "Microscop Digital 3D Hirox HRX-01 Motorizat", "Mărire 20x – 2500x · Reconstrucție Topografică 3D Sub-micron · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-093", "Interferometru Michelson & Fabry-Perot Educațional Thorlabs", "Kit Complet Metrologie Cuantică · Fotodetector Amplificat · Lab Fotonică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-094", "Sursă Laser Acordabilă Santec TSL-570 Telecom Band", "1260 – 1680 nm · Linewidth < 100 kHz · Testare Circuite Fotonice · Lab Fotonică", StareTehnica.IN_MENTENANTA),
        ],
    },
    {
        "category": "Senzori Biomed & Procesare Biosignal",
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-095", "Sistem EEG Wireless 32 Canale g.tec g.Nautilus PRO", "Electrozi Activi Gel/Dry · 500 Hz · Interfață Brain-Computer BCI · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-096", "Kit Achiziție Poligrafică BIOPAC MP160 Starter System", "16 Canale · Module ECG, EMG, EOG, EDA și Respirație · AcqKnowledge · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-097", "Cască BCI OpenBCI Ultracortex Mark IV + Cyton Daisy 16ch", "16 Canale EEG/EMG/ECG · Open-Source Python/LSL Streaming · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-098", "Sistem Electromiografie Wireless Delsys Trigno Avanti", "8 Senzori EMG + IMU 9-DOF · Analiză Biomecanică Mișcare · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-099", "Ochelari Eye-Tracking Tobii Pro Glasses 3", "100 Hz Gaze Tracking · Cameră Scenă Full HD · Analiză Cognitivă · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-100", "Cască Realitate Mixtă & Eye/Face Tracking Meta Quest Pro", "Senzori Expresii Faciale · Passthrough Color · Unity/Unreal SDK · Lab VR/Bio", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-101", "Cască VR Industrială HTC VIVE Pro 2 Full Kit + Lip/Eye Tracker", "Rezoluție 5K (4896x2448) · 120 Hz · SteamVR Base Stations 2.0 · Lab VR/Bio", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-102", "Mănuși Haptice cu Force-Feedback Manus Prime X Haptic VR", "Tracking Degete IMU/Flex · Vibrații Haptice Programabile · Lab VR/Bio", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-103", "Kit Biosenzori Purtabili BITalino (r)evolution Plugged", "ECG, EMG, EDA, EEG, Accelerometru, Lux · Bluetooth / Python API · Lab Bioinginerie", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-104", "Analizor Impedanță Bioelectrică & Spectroscopie Keysight", "Caracterizare Țesuturi și Biosenzori Electrochimici · Lab Bioinginerie", StareTehnica.DISPONIBILA),
        ],
    },
    {
        "category": "Sisteme Energetice & Acționări Electrice",
        "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",
        "items": [
            ("INV-USV-2026-105", "Simulator Real-Time Hardware-in-the-Loop Typhoon HIL404", "Simulare Convertizoare Putere 20 ns FPGA · Microgrid & EV · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-106", "Analizor Calitatea Energiei Fluke 435 Series II", "Trifazat · Armonici până la Ordinul 50 · Inrush & Flicker · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-107", "Stand Didactic Acționări Motoare PMSM & BLDC dSPACE MicroLabBox", "Control Vectorial FOC în MATLAB/Simulink · Encoder Increment/Resolver · Lab Acționări", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-108", "Sarcină Electronică Programabilă DC Chroma 63200A", "150V · 120A · 2.6 kW · Simulare Baterii și Celule Fotovoltaice · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-109", "Simulator Array Fotovoltaic Keysight E4360A Modular Solar", "1200W · Emulare Curbe I-V în Condiții de Umbră Parțială · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-110", "Automate Programabile PLC Siemens SIMATIC S7-1500 + HMI Comfort", "CPU 1516-3 PN/DP · PROFINET · TIA Portal V19 · Panou 12 inch · Lab Automatică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-111", "Stand Microgrid Hibrid Fotovoltaic + Eolian + Stocare LiFePO4", "Invertor Bidirecțional Victron MultiPlus-II · BMS Smart · Modbus TCP · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-112", "Tester Izolație și Rigiditate Dielectrică Megger MIT525 5kV", "Rezistență Izolație 10 TΩ · Index Polarizare PI & DAR · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-113", "Convertizor de Frecvență ABB ACS880 Industrial Drive Bench", "Control Direct al Cuplului DTC · 4 kW · Interfață EtherCAT · Lab Acționări", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-114", "Sistem Testare Celule Li-Ion & BMS Arbin LBT21084", "8 Canale Independente · Ciclare Încărcare/Descărcare EIS · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-115", "Releu Digital Protecție Energetică Siemens SIPROTEC 5", "IEC 61850 GOOSE · Protecție Distanță și Diferențială Linii · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-116", "Stație Încărcare Vehicule Electrice OCPP 2.0.1 Open-Lab", "22 kW AC Type 2 · Analizor Protocol ISO 15118 Plug & Charge · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-117", "Osciloscop Izolat 4 Canale Tektronix TPS2024B Power Bundle", "200 MHz · Canale Complet Izolate Galvanic · Analiză Putere · Lab Energetică", StareTehnica.DISPONIBILA),
            ("INV-USV-2026-118", "Stand Pilă de Combustie cu Hidrogen Horizon 500W PEM", "Electrolizor + Stocare Hidruri Metalice + Sarcină Electronică · Lab Energetică", StareTehnica.DEFECTA),
        ],
    },
]


async def seed_resources_and_reservations(db: AsyncSession) -> None:
    categories_data = [
        ("Calculatoare & Servere HPC", "Sisteme de calcul de mare performanță, clustere GPU, stații grafice de lucru."),
        ("Robotică & Sisteme Autonome", "Brațe robotice industriale, roboți mobili, drone autonome și senzori LiDAR."),
        ("Aparatură Măsură & Osciloscoape", "Osciloscoape digitale, analizoare de spectru, multimetre și generatoare de semnal."),
        ("Kituri IoT & Sisteme Embedded", "Plăci dezvoltare FPGA, microcontrolere avansate și module comunicații IoT."),
        ("Imprimare 3D & Prototipare Rapidă", "Imprimante 3D FDM/SLA industriale, gravatoare laser și stații lipire SMD."),
        ("Drone & Vehicule Autonome", "Platforme aeriene fără pilot, senzori LiDAR 3D, RTK GNSS și vehicule autonome."),
        ("Rețelistică & Securitate Cibernetică", "Switch-uri L3, echipamente SDR, analizoare criptografice și stații 5G."),
        ("Sisteme Optoelectronice & Fotonică", "Spectrometre, laseri stabilizați, camere hiperspectrale și mese optice."),
        ("Senzori Biomed & Procesare Biosignal", "Sisteme EEG/EMG/ECG, interfețe Brain-Computer și echipamente VR/Eye-tracking."),
        ("Sisteme Energetice & Acționări Electrice", "Simulatoare HIL, analizoare de calitatea energiei, standuri motoare și PLC-uri."),
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

    rooms_list = list((await db.execute(select(Room).order_by(Room.id.asc()).limit(30))).scalars().all())
    if not rooms_list:
        await db.commit()
        return

    bind = db.get_bind()
    if bind and bind.dialect.name == "postgresql":
        try:
            await db.execute(text("ALTER TABLE resurse ADD COLUMN IF NOT EXISTS imagine_url VARCHAR(500)"))
            await db.commit()
        except Exception:
            await db.rollback()

    core_resources = [
        (
            "Stație Grafică Deep Learning RTX 4090",
            "HPC-RTX-4090-01",
            "Calculatoare & Servere HPC",
            0,
            StareTehnica.DISPONIBILA,
            "Stație dedicată prelucrării de imagini și modele AI.",
            "Intel Core i9 14900K, 128GB DDR5 5600MHz, Dual Nvidia GeForce RTX 4090 24GB, 4TB NVMe SSD.",
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Cluster GPU Deep Learning 8x A100",
            "HPC-A100-NODE-01",
            "Calculatoare & Servere HPC",
            1,
            StareTehnica.DISPONIBILA,
            "Nod cluster pentru antrenare paralelă LLM și simulări masive.",
            "8x Nvidia A100 80GB SXM4, 1024GB RAM ECC, 30TB NVMe RAID-0, Interfață 200Gb/s InfiniBand.",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Braț Robotic Universal Robots UR3e",
            "ROB-UR3E-01",
            "Robotică & Sisteme Autonome",
            2,
            StareTehnica.DISPONIBILA,
            "Braț robotic colaborativ cu 6 grade de libertate pentru cercetare aplicată.",
            "Rază de acțiune 500mm, sarcină utilă 3kg, precizie +/-0.03mm, senzor integrat de forță și cuplu.",
            "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Platformă Mobilă Cercetare TurtleBot 4 Pro",
            "ROB-TB4-01",
            "Robotică & Sisteme Autonome",
            3,
            StareTehnica.IN_MENTENANTA,
            "Platformă mobilă autonomă pentru mapare SLAM și navigație autonomă ROS 2.",
            "Bază mecanică iRobot Create 3, SBC Raspberry Pi 4 4GB, LiDAR 2D RPLIDAR A1M8, Cameră OAK-D-Pro.",
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Osciloscop Digital Keysight InfiniiVision 1GHz",
            "MS-KEYSIGHT-1GHZ",
            "Aparatură Măsură & Osciloscoape",
            4,
            StareTehnica.DISPONIBILA,
            "Osciloscop digital de înaltă precizie pentru semnale rapide.",
            "4 canale analogice, lățime bandă 1 GHz, rată eșantionare 5 GSa/s, memorie 4 Mpts.",
            "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Analizor de Spectru RF Rohde & Schwarz",
            "MS-RS-FPC1500",
            "Aparatură Măsură & Osciloscoape",
            5,
            StareTehnica.DEFECTA,
            "Analizor de spectru pentru caracterizarea comunicațiilor RF și antenelor.",
            "Frecvență 5 kHz - 3 GHz, RBW 1 Hz, generator de semnal tracking încorporat.",
            "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Kit Dezvoltare FPGA Xilinx Zynq UltraScale+",
            "IOT-ZYNQ-MPSoC",
            "Kituri IoT & Sisteme Embedded",
            6,
            StareTehnica.DISPONIBILA,
            "Sistem multiprocesor SoC pentru accelerare hardware și procesare video.",
            "Quad-core ARM Cortex-A53, Dual Cortex-R5, 4GB DDR4, interfețe FMC, HDMI, Gigabit Ethernet.",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Imprimantă 3D Bambu Lab X1-Carbon Combo",
            "PRT-BAMBU-X1C",
            "Imprimare 3D & Prototipare Rapidă",
            7,
            StareTehnica.DISPONIBILA,
            "Imprimantă 3D de mare viteză cu sistem multi-material AMS pentru fibră de carbon.",
            "Volum 256x256x256 mm, viteză 500 mm/s, calibrare LiDAR automată, cameră monitorizare AI.",
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Braț Robotic Educațional Niryo Ned 2",
            "ROB-NIRYO-NED2",
            "Robotică & Sisteme Autonome",
            2,
            StareTehnica.DISPONIBILA,
            "Braț robotic colaborativ pe 6 axe bazat pe ROS 2 pentru aplicații de laborator și vedere artificială.",
            "6 axe, repetabilitate 0.5 mm, ROS 2 integrat pe Raspberry Pi 4, gripper adaptiv și cameră Vision.",
            "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Kit NVIDIA Jetson Orin Nano Dev Kit",
            "IOT-JETSON-ORIN",
            "Kituri IoT & Sisteme Embedded",
            6,
            StareTehnica.DISPONIBILA,
            "Platformă compactă Edge AI pentru roboți autonomi, vedere computerizată și modele generative locale.",
            "40 TOPS AI, GPU NVIDIA Ampere 1024-core CUDA cu 32 Tensor Cores, CPU 6-core ARM Cortex-A78AE, 8GB LPDDR5.",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Osciloscop Digital Rohde & Schwarz RTB2004",
            "MS-RS-RTB2004",
            "Aparatură Măsură & Osciloscoape",
            4,
            StareTehnica.DISPONIBILA,
            "Osciloscop digital cu rezoluție verticală pe 10 biți și ecran tactil capacitiv pentru analiză de semnal.",
            "Lățime bandă 300 MHz, 4 canale analogice, rată eșantionare 2.5 GSa/s, memorie 20 Mpts, ecran 10.1 inch.",
            "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
        ),
        (
            "Workstation AI Deep Learning",
            "HPC-AI-WS-01",
            "Calculatoare & Servere HPC",
            0,
            StareTehnica.DISPONIBILA,
            "Stație de lucru de înaltă performanță pentru antrenare rețele neuronale și procesare paralelă CUDA.",
            "GPU NVIDIA RTX 4090 24GB VRAM, 64GB RAM DDR5, 2TB NVMe PCIe 4.0, Ubuntu 24.04 LTS + PyTorch / TensorFlow.",
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
        ),
    ]

    existing_codes = set((await db.execute(select(Resource.cod_inventar))).scalars().all())
    new_resources: list[Resource] = []

    for nume, cod, cat_name, room_idx, stare, desc, specs, img_url in core_resources:
        if cod not in existing_codes:
            room = rooms_list[room_idx % len(rooms_list)]
            new_resources.append(
                Resource(
                    nume=nume,
                    cod_inventar=cod,
                    categorie_id=cat_map[cat_name].id,
                    sala_id=room.id,
                    stare_tehnica=stare,
                    descriere=desc,
                    specificatii=specs,
                    imagine_url=img_url,
                    is_active=True,
                )
            )
            existing_codes.add(cod)

    item_counter = 0
    for group in CATALOG_BLUEPRINTS:
        cat_name = group["category"]
        img_url = group["image"]
        for cod, nume, specs, stare in group["items"]:
            item_counter += 1
            if cod in existing_codes:
                continue
            room = rooms_list[item_counter % len(rooms_list)]
            new_resources.append(
                Resource(
                    nume=nume,
                    cod_inventar=cod,
                    categorie_id=cat_map[cat_name].id,
                    sala_id=room.id,
                    stare_tehnica=stare,
                    descriere=f"Echipament de laborator din categoria {cat_name} ({nume}).",
                    specificatii=specs,
                    imagine_url=img_url,
                    is_active=True,
                )
            )
            existing_codes.add(cod)

    if new_resources:
        db.add_all(new_resources)
        await db.flush()

    res_rows = (await db.execute(select(Resource))).scalars().all()
    res_map: dict[str, Resource] = {r.cod_inventar: r for r in res_rows}

    users_map = {
        email: u for email, u in (await db.execute(select(User.email, User))).all()
    }
    student1 = users_map.get("student1@univ.ro")
    student2 = users_map.get("student2@univ.ro")
    student3 = users_map.get("student3@univ.ro")
    student4 = users_map.get("student4@univ.ro")
    student5 = users_map.get("student5@univ.ro")
    student6 = users_map.get("student6@univ.ro")
    prof1 = users_map.get("prof1@univ.ro")
    prof2 = users_map.get("prof2@univ.ro")
    lab1 = users_map.get("lab1@univ.ro")
    lab2 = users_map.get("lab2@univ.ro")

    if not (student1 and student2 and prof1 and lab1):
        await db.commit()
        return

    existing_res_count = len((await db.execute(select(Reservation.id))).scalars().all())
    if existing_res_count == 0:
        now = datetime.now(timezone.utc)
        reservations_to_add = [
            Reservation(
                resursa_id=res_map["HPC-RTX-4090-01"].id,
                utilizator_id=student1.id_utilizator,
                data_inceput=now - timedelta(days=1),
                data_sfarsit=now + timedelta(days=2),
                stare=StareRezervare.APROBATA,
                scop="Antrenare modele lingvistice mici (SLM) pentru lucrarea de licență.",
            ),
            Reservation(
                resursa_id=res_map["ROB-UR3E-01"].id,
                utilizator_id=student2.id_utilizator,
                data_inceput=now + timedelta(days=1),
                data_sfarsit=now + timedelta(days=4),
                stare=StareRezervare.IN_ASTEPTARE,
                scop="Experimente de cinematică directă și inversă în laboratorul de cercetare.",
            ),
            Reservation(
                resursa_id=res_map["IOT-ZYNQ-MPSoC"].id,
                utilizator_id=prof1.id_utilizator,
                data_inceput=now - timedelta(days=7),
                data_sfarsit=now - timedelta(days=2),
                stare=StareRezervare.FINALIZATA,
                scop="Pregătire suport curs și laborator Sisteme Reconfigurabile.",
            ),
        ]

        extra_students = [s for s in [student2, student3, student4, student5, student6] if s is not None]
        extra_codes = [
            "INV-USV-2026-001",
            "INV-USV-2026-002",
            "INV-USV-2026-013",
            "INV-USV-2026-019",
            "INV-USV-2026-025",
            "INV-USV-2026-037",
            "INV-USV-2026-049",
            "INV-USV-2026-061",
            "INV-USV-2026-073",
            "INV-USV-2026-085",
            "INV-USV-2026-095",
            "INV-USV-2026-105",
        ]
        purposes = [
            "Antrenare model Vision Transformer pe setul de date medicale.",
            "Testare algoritm SLAM și navigare autonomă în ROS2 Humble.",
            "Măsurare răspuns în frecvență filtre active trece-bandă.",
            "Implementare inferență TensorRT pe arhitectura NVIDIA Jetson Orin.",
            "Imprimare 3D carcasă senzor LiDAR din fibră de carbon PAHT-CF.",
            "Planificare misiune fotogrammetrie aeriană cu corecție RTK.",
            "Configurare topologie BGP și analiză trafic rețea SDN.",
            "Caracterizare spectrală sursă laser și aliniere interferometru.",
            "Achiziție semnale EEG pentru clasificarea intenției motorii BCI.",
            "Simulare Hardware-in-the-Loop invertor trifazat fotovoltaic.",
        ]

        for idx, code in enumerate(extra_codes):
            res_obj = res_map.get(code)
            if not res_obj or not extra_students:
                continue
            stud = extra_students[idx % len(extra_students)]
            status_cycle = [
                StareRezervare.APROBATA,
                StareRezervare.IN_ASTEPTARE,
                StareRezervare.FINALIZATA,
            ][idx % 3]
            day_offset = (idx % 5) + 3 if status_cycle != StareRezervare.FINALIZATA else -((idx % 6) + 2)
            reservations_to_add.append(
                Reservation(
                    utilizator_id=stud.id_utilizator,
                    resursa_id=res_obj.id,
                    stare=status_cycle,
                    scop=purposes[idx % len(purposes)],
                    data_inceput=now + timedelta(days=day_offset, hours=1),
                    data_sfarsit=now + timedelta(days=day_offset, hours=3),
                )
            )

        db.add_all(reservations_to_add)

    existing_hist_count = len((await db.execute(select(TechnicalHistory.id))).scalars().all())
    if existing_hist_count == 0:
        history_entries = [
            TechnicalHistory(
                resursa_id=res_map["ROB-TB4-01"].id,
                utilizator_id=lab1.id_utilizator,
                tip_interventie="MENTENANTA_PREVENTIVA",
                descriere="Calibrare senzori odometrie, curățare ansamblu optic LiDAR și actualizare firmware ROS 2 Jazzy.",
                stare_anterioara=StareTehnica.DISPONIBILA,
                stare_noua=StareTehnica.IN_MENTENANTA,
            ),
            TechnicalHistory(
                resursa_id=res_map["MS-RS-FPC1500"].id,
                utilizator_id=prof1.id_utilizator,
                tip_interventie="RAPORT_DEFECTIUNE",
                descriere="Atenuatorul de intrare RF s-a ars în urma unei supratensiuni accidentale pe portul N (50 Ohm). Trimis la service autorizat.",
                stare_anterioara=StareTehnica.DISPONIBILA,
                stare_noua=StareTehnica.DEFECTA,
            ),
        ]

        maintenance_notes = [
            ("INV-USV-2026-012", "MENTENANTA_PREVENTIVA", StareTehnica.DISPONIBILA, StareTehnica.IN_MENTENANTA, "Actualizare firmware controller NVMe și verificare redundanță surse."),
            ("INV-USV-2026-036", "CALIBRARE_METROLOGICA", StareTehnica.DISPONIBILA, StareTehnica.IN_MENTENANTA, "Recalibrare radiometrică anuală senzor microbolometru FLIR."),
            ("INV-USV-2026-060", "MENTENANTA_PREVENTIVA", StareTehnica.DISPONIBILA, StareTehnica.IN_MENTENANTA, "Aliniere axă B/C și înlocuire rulmenți spindel de mare viteză."),
            ("INV-USV-2026-094", "MENTENANTA_PREVENTIVA", StareTehnica.DISPONIBILA, StareTehnica.IN_MENTENANTA, "Curățare conectori optici APC și verificare stabilitate lungime de undă."),
            ("INV-USV-2026-118", "RAPORT_DEFECTIUNE", StareTehnica.DISPONIBILA, StareTehnica.DEFECTA, "Membrană schimbătoare de protoni PEM dezhidratată; necesită înlocuire stack."),
            ("INV-USV-2026-001", "INSPECTIE_TEHNICA", StareTehnica.IN_MENTENANTA, StareTehnica.DISPONIBILA, "Instalare PyTorch 2.4, TensorRT și verificare termică GPU sub sarcină."),
            ("INV-USV-2026-015", "CALIBRARE_METROLOGICA", StareTehnica.IN_MENTENANTA, StareTehnica.DISPONIBILA, "Calibrare zero-point articulații UR3e și verificare opriri de siguranță."),
            ("INV-USV-2026-025", "CALIBRARE_METROLOGICA", StareTehnica.IN_MENTENANTA, StareTehnica.DISPONIBILA, "Compensare sonde pasive 10:1 și autocalibrare internă ADC."),
            ("INV-USV-2026-049", "INSPECTIE_TEHNICA", StareTehnica.IN_MENTENANTA, StareTehnica.DISPONIBILA, "Curățare tije fibră de carbon, lubrifiere șuruburi trapez și calibrare LiDAR."),
        ]
        reporter = lab2.id_utilizator if lab2 else lab1.id_utilizator
        for code, tip_int, prev_st, new_st, note in maintenance_notes:
            if code in res_map:
                history_entries.append(
                    TechnicalHistory(
                        resursa_id=res_map[code].id,
                        utilizator_id=reporter,
                        tip_interventie=tip_int,
                        descriere=note,
                        stare_anterioara=prev_st,
                        stare_noua=new_st,
                    )
                )

        db.add_all(history_entries)

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

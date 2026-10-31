# Research Resource Manager

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Sistem centralizat pentru gestiunea, monitorizarea și rezervarea resurselor didactice și de cercetare universitare.

Research Resource Manager oferă studenților, cadrelor didactice și personalului administrativ o platformă unificată pentru evidența echipamentelor de cercetare (calculatoare performante, roboți, kituri experimentale, aparatură de laborator, săli de cercetare), prevenirea conflictelor de programare și monitorizarea stării tehnice.

## Table of Contents

- [Background](#background)
- [Architecture](#architecture)
- [Database RBAC Architecture](#database-rbac-architecture)
- [Academic Structure](#academic-structure)
- [Database Migrations (Alembic)](#database-migrations-alembic)
- [Security and RBAC](#security-and-rbac)
- [Error Handling & Exceptions](#error-handling--exceptions)
- [Schemas](#schemas)
- [Prerequisites & Database Setup](#prerequisites--database-setup)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

În cadrul universităților, gestionarea echipamentelor educaționale și a aparaturii de cercetare se realizează frecvent fragmentat și pe suport manual. Acest mod de lucru generează lipsă de vizibilitate asupra disponibilității, suprapuneri de rezervări și lipsa trasabilității stării tehnice.

Platforma rezolvă aceste provocări prin:
- Catalog centralizat organizat pe instituții, facultăți, departamente și săli.
- Autentificare securizată prin token-uri JWT și control al accesului pe bază de roluri relaționale stocate în baza de date (`roles`, `permissions`, `role_permissions`).
- Validarea regulilor de rezervare (maximum 4 resurse simultan per student, diferențierea categoriilor, excluderea suprapunerilor).
- Jurnal tehnic și istoric imutabil al intervențiilor și defecțiunilor.

## Architecture

Proiectul este structurat pe straturi conform principiilor Clean Architecture:

```
backend/
├── alembic/              # Configurații și scripturi de migrări asincrone
│   ├── versions/         # Fișierele de migrare generate
│   ├── env.py            # Rulare migrări async peste SQLAlchemy
│   └── script.py.mako    # Șablon curat pentru generarea fișierelor de migrare
├── app/
│   ├── api/
│   │   ├── routers/       # Rute FastAPI (auth, health, etc.)
│   │   └── schemas/       # Scheme Pydantic v2 (auth.py, users.py)
│   ├── db/                # Conexiune SQLAlchemy 2.0 async, modele ORM și seeder roluri/permisiuni
│   ├── dependencies/      # Injectare de dependențe (autentificare, RBAC dinamic, sesiune DB)
│   ├── exceptions/        # Ierarhie de excepții custom pentru întregul domeniu
│   ├── middleware/        # Middleware HTTP de securitate și exception handling global
│   ├── repositories/      # Strat de persistență și interogări bază de date
│   ├── services/          # Logica operațională și de business
│   ├── utils/             # Helperi (hashing, validare, excepție de bază)
│   ├── config.py          # Gestionare variabile de mediu cu Pydantic Settings
│   └── main.py            # Punctul principal de intrare al aplicației FastAPI
├── tests/                 # Teste automate pytest cu suport async
├── alembic.ini            # Configurare mediu Alembic
├── requirements.txt       # Dependințe Python
└── .env.example           # Șablon variabile de mediu
```

## Database RBAC Architecture

Permisiunile și rolurile sunt persistate relațional în PostgreSQL:

- **`roles`**: `id`, `name`, `description`.
- **`permissions`**: `id`, `code` (ex: `bookings:create`), `description`.
- **`role_permissions`**: Tabela de asociere Many-to-Many între `role_id` și `permission_id`.
- **`utilizatori`**: Cheie externă `role_id` către tabela `roles`.
- **Inițializare automată (Seeder):** La startup-ul aplicației (`lifespan`), `seed_roles_and_permissions` populează automat tabelele cu rolurile predefinite și asociază permisiunile conform matricei de securitate.

## Academic Structure

Ierarhia academică este persistată relațional: `institutii` → `facultati` → `departamente` → `sali`. Fiecare sală are **obligatoriu un responsabil** (`responsabil_id`), iar fiecare departament poate avea un șef (`sef_departament_id`, rol `PROFESOR`).

### Reguli de business și verificări

| Entitate | Verificări |
|---|---|
| Instituție | denumire și cod unice (case-insensitive); dezactivare blocată dacă are facultăți active; ștergere blocată dacă are facultăți |
| Facultate | instituție existentă și activă; denumire și cod unice în instituție; activare blocată dacă instituția e inactivă; dezactivare blocată dacă are departamente active; ștergere blocată dacă are departamente |
| Departament | facultate existentă și activă; denumire și cod unice în facultate; șef doar cu rol `PROFESOR`, cont activ, maximum 2 departamente conduse; dezactivare blocată dacă are săli active; ștergere blocată dacă are săli |
| Sală | departament existent și activ; cod unic global, denumire unică în departament; responsabil doar `RESPONSABIL_LABORATOR` sau `PROFESOR`, cont activ, maximum 25 săli active per responsabil; capacitate validată pe tip de sală (ex.: `SALA_SERVERE` maximum 10); schimbare responsabil blocată dacă este același utilizator |
| Responsabil sală | poate modifica doar `descriere` și `capacitate` pe sălile proprii; orice alt câmp → `room_fields_restricted`; alt utilizator non-admin → `not_room_responsible` |
| Vizibilitate | utilizatorii non-admin văd doar entitățile active; responsabilul își vede și sălile inactive |

Toate erorile sunt excepții custom (`app/exceptions/academic_exceptions.py`) cu răspuns JSON uniform: `{"detail": "...", "code": "..."}`.

### Date de test academice (seed)

La pornirea aplicației se populează automat (idempotent): **3 instituții** (UPT, UTCN, UPB), **3 facultăți per instituție**, **6 departamente per facultate**, **6 săli per departament** (324 săli), plus utilizatori suplimentari: 3 profesori și 2 responsabili de laborator per facultate (parola `Password123!`, emailuri de tip `prof.upt.ac.3@univ.ro`, `lab.upb.en.2@univ.ro`). Conturile `prof1`, `prof2`, `lab1`, `lab2` sunt folosite pentru facultatea UPT-AC. Sălile de cercetare au ca responsabil șeful departamentului, restul sălilor sunt distribuite responsabililor de laborator.

Rulare manuală (roluri, permisiuni, utilizatori și structură academică, toate din același fișier):
```sh
python -m app.db.seed
```

## Database Migrations (Alembic)

Pentru controlul versiunilor schemei de bază de date, proiectul este configurat cu Alembic în mod asincron nativ:

### Generare migrare automată
```sh
alembic revision --autogenerate -m "create_initial_schema"
```

### Aplicare migrări în baza de date
```sh
alembic upgrade head
```

Schema se creează exclusiv prin Alembic (serverul nu mai apelează `create_all` la pornire). Rulați `alembic upgrade head` înainte de prima pornire și după fiecare actualizare a modelelor. Dacă tabelele inițiale au fost create anterior fără Alembic, marcați versiunea de bază cu `alembic stamp fb2aefdda6c4` și apoi rulați `alembic upgrade head`.

### Revenire la migrarea anterioară
```sh
alembic downgrade -1
```

## Security and RBAC

### Security Middleware
- Antete HTTP stricte de securitate (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security`).
- Politică de securitate a conținutului (Content Security Policy - CSP) diferențiată pentru documentație și API.
- Protecție împotriva dimensiunilor excesive de cereri (limită maximă payload: 10MB).
- Filtrare și validare antet `Accept` pentru prevenirea cererilor incompatibile.
- Eliminarea automată a antetelor informative de server (`Server`, `X-Powered-By`).

### Matrice RBAC (Roluri și Permisiuni)

| Rol | Permisiuni principale |
|---|---|
| `ADMINISTRATOR` | Acces complet: gestiune structură academică, inventar resurse, conturi utilizatori, audit |
| `PROFESOR` | Consultare catalog, creare rezervări, aprobare rezervări, înregistrare predare/retur, jurnal tehnic |
| `RESPONSABIL_LABORATOR` | Mentenanță și actualizare stare tehnică resurse, validare retur/predare, jurnal tehnic |
| `STUDENT` | Căutare și filtrare catalog pe baza specializării, creare și anulare rezervări proprii |

## Error Handling & Exceptions

Aplicația folosește un sistem unitar de excepții custom moștenite din `AppException` și interceptate global:

### Răspuns standard de eroare JSON
```json
{
  "detail": "Descrierea clară a erorii.",
  "code": "cod_unic_eroare"
}
```

### Categorii principale de excepții:
- **Autentificare & Utilizatori:** `InvalidCredentialsError`, `InvalidTokenError`, `UserEmailAlreadyExistsError`, `UserNotFoundError`, `PasswordValidationError`, `UnauthorizedAccessError`.
- **Reguli de Rezervare (PRD):**
  - `ReservationLimitExceededError`: plafonul de maximum 4 resurse simultan per student;
  - `DuplicateCategoryReservationError`: interdicția de a împrumuta simultan două resurse din aceeași categorie;
  - `ReservationConflictError`: detectare automată a suprapunerilor de interval orar;
  - `ResourceUnavailableError` / `ResourceInMaintenanceError` / `ResourceDefectiveError`: blocare rezervări pe echipamente inactive;
  - `SpecializationAccessDeniedError`: restricții pe specializări academice.
- **Entități & Structură:** `ResourceNotFoundError`, `RoomNotFoundError`, `DepartmentNotFoundError`, `FacultyNotFoundError`, `InstitutionNotFoundError`, `CategoryNotFoundError`.

## Schemas

Schemele Pydantic v2 sunt organizate modular în `app/api/schemas/`:

### 1. `users.py`
- `BaseEmailSchema`: Sanitizare automată și validare email (max 100 caractere).
- `UserCreate`: Validare strictă pentru `first_name` și `last_name` (reguli diacritice românești, unicitate nume-prenume, lungime cumulată), validare parolă puternică, `rol` (`STUDENT`, `PROFESOR`, `ADMINISTRATOR`, `RESPONSABIL_LABORATOR`), `numar_matricol`, `id_angajat`.
- `LoginSchema`: Email validat și parolă.
- `UserResponse`: Răspuns API cu `id_utilizator`, `nume`, `email`, `rol`, `numar_matricol`, `id_angajat`, `is_active`, `permissions`, `created_at`.
- `UserFullResponse`: Detalii extinse pentru profilul complet al utilizatorului.
- `UserUpdateSchema` & `AdminUserUpdateSchema`: Actualizare date utilizator și administrare conturi.

### 2. `auth.py`
- `Token`: Răspuns bearer token (`access_token`, `token_type = "bearer"`).
- Re-exportă `UserCreate`, `LoginSchema`, `UserResponse` pentru consistența endpoint-urilor de autentificare.

## Prerequisites & Database Setup

### 1. Descărcare și instalare PostgreSQL & pgAdmin 4

1. **Descărcare:**
   - Descarcă installer-ul oficial pentru Windows de pe site-ul oficial: [PostgreSQL Downloads (EDB Installer)](https://www.postgresql.org/download/windows/).
   - Pachetul include automat atât **PostgreSQL Server**, cât și utilitarul grafic **pgAdmin 4**.
   - Dacă ai deja serverul PostgreSQL instalat și dorești doar interfața pgAdmin, o poți descărca separat de la: [pgAdmin 4 Download](https://www.pgadmin.org/download/pgadmin-4-windows/).

2. **Pași de instalare:**
   - Rulează fișierul descărcat `.exe`.
   - Bifează componentele: *PostgreSQL Server*, *pgAdmin 4* și *Command Line Tools*.
   - Alege directorul de instalare și reține parola setată pentru utilizatorul implicit `postgres` (aceasta va fi folosită în fișierul `.env`).
   - Păstrează portul configurat (implicit 5432 sau 2023).
   - Finalizează instalarea.

3. **Verificare serviciu Windows:**
   - Deschide utilitarul *Run* (`Win + R`), tastează `services.msc` și apasă Enter.
   - Caută serviciul `postgresql-x64-XX` (unde XX este versiunea, de ex. 16).
   - Asigură-te că starea este **Running** (dacă este oprit, click dreapta -> *Start*).

### 2. Crearea bazei de date în pgAdmin 4

1. Deschide aplicația **pgAdmin 4** din meniul Start.
2. În panoul din stânga (*Servers*), dă dublu-click pe **PostgreSQL XX** și introdu parola setată la instalare.
3. Dă click dreapta pe **Databases** -> **Create** -> **Database...**.
4. În câmpul **Database**, introdu exact numele:
   ```
   research_resource_manager
   ```
5. Apasă pe butonul **Save**.

### 3. Configurare fișier `.env`

Deschide fișierul `backend/.env` și asigură-te că linia de conectare conține portul și parola ta de PostgreSQL:

```env
DATABASE_URL=postgresql+asyncpg://postgres:PAROLA_TA@localhost:2023/research_resource_manager
```

## Install

### Instalare Backend

1. Navighează în directorul `backend`:
   ```sh
   cd backend
   ```

2. Creează și activează un mediu virtual:
   ```sh
   python -m venv .venv
   # Windows (PowerShell):
   .\.venv\Scripts\Activate.ps1
   # Windows (CMD):
   .venv\Scripts\activate.bat
   # Linux/macOS:
   source .venv/bin/activate
   ```

3. Instalează pachetele necesare:
   ```sh
   pip install -r requirements.txt
   ```

## Usage

### Rulare server backend

Din directorul `backend` (cu mediul virtual activat):

```sh
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interfețele interactive de documentare API sunt accesibile la:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Autentificare în Swagger UI (/docs)

Pentru a testa endpoint-urile protejate (precum `GET /api/auth/me`):
1. În interfața Swagger UI, apăsați butonul verde **Authorize** (cu pictogramă de lacăt deschis) din colțul din dreapta-sus.
2. Introduceți:
   - **username**: adresa de email (ex: `student1@univ.ro`)
   - **password**: parola (`Password123!`)
3. Apăsați **Authorize**, apoi **Close**.
4. Pictograma lacătului devine închisă, iar toate apelurile către endpoint-urile securizate vor include automat antetul `Authorization: Bearer <token>`.

Apelarea directă a endpoint-ului `POST /api/auth/login` prin formularul său din pagină doar returnează JSON-ul cu token-ul în corpul răspunsului, fără ca Swagger UI să îl rețină automat în antetele cererilor următoare.

### Conturi implicite de test (Seed Accounts)

La pornirea aplicației sau prin comanda `python -m app.db.seed`, baza de date este populată cu următoarele conturi predefinite (toate au parola: `Password123!`):

| Rol | Email | Nume | Identificator |
|---|---|---|---|
| STUDENT | `student1@univ.ro` | Andrei Popescu | CS100001 |
| STUDENT | `student2@univ.ro` | Elena Ionescu | CS100002 |
| STUDENT | `student3@univ.ro` | Mihai Radu | CS100003 |
| STUDENT | `student4@univ.ro` | Ioana Dumitrescu | CS100004 |
| STUDENT | `student5@univ.ro` | Cristian Stoica | CS100005 |
| STUDENT | `student6@univ.ro` | Diana Marin | CS100006 |
| ADMINISTRATOR | `admin1@univ.ro` | Alexandru Vasile | Angajat #101 |
| ADMINISTRATOR | `admin2@univ.ro` | Simona Dobre | Angajat #102 |
| PROFESOR | `prof1@univ.ro` | Dan Georgescu | Angajat #201 |
| PROFESOR | `prof2@univ.ro` | Carmen Nistor | Angajat #202 |
| RESPONSABIL_LABORATOR | `lab1@univ.ro` | Sorin Enache | Angajat #301 |
| RESPONSABIL_LABORATOR | `lab2@univ.ro` | Laura Voinea | Angajat #302 |

Rulare manuală a populării cu date de test:
```sh
python -m app.db.seed
```

### Rulare teste automate

```sh
pytest
```

## API

### Rute sistem

| Metodă | Endpoint | Descriere |
|---|---|---|
| `GET` | `/` | Verificare stare generală server |
| `GET` | `/health` | Endpoint de health check |

### Autentificare (`/api/auth`)

Sistemul suportă autentificare hibridă: antet standard `Authorization: Bearer <token>` sau cookie securizat `HttpOnly` (`access_token`).

| Metodă | Endpoint | Corp cerere | Descriere |
|---|---|---|---|
| `POST` | `/api/auth/register` | `UserCreate` (`first_name`, `last_name`, `email`, `password`, `rol`, `numar_matricol`, `id_angajat`) | Înregistrare directă cont utilizator |
| `POST` | `/api/auth/login` | `LoginSchema` (`email`, `password`) | Autentificare, returnare token JWT și setare cookie `access_token` (HttpOnly) |
| `POST` | `/api/auth/logout` | - | Deconectare utilizator și ștergere cookie `access_token` |
| `GET` | `/api/auth/me` | Header `Authorization: Bearer <token>` sau Cookie `access_token` | Obținere profil utilizator și listă permisiuni asociate |

### Structură academică (`/api`)

Citirea necesită permisiunea `structure:read` (toate rolurile), scrierea `structure:manage` (administrator). Listele acceptă `skip`, `limit` (1-100), `search`, `is_active` și filtre pe părinte.

| Metodă | Endpoint | Descriere |
|---|---|---|
| `POST` / `GET` | `/api/institutions` | Creare / listare instituții (`search`, `oras`, `is_active`) |
| `GET` / `PATCH` / `DELETE` | `/api/institutions/{id}` | Detalii / modificare / ștergere instituție |
| `GET` | `/api/institutions/{id}/stats` | Număr facultăți, departamente, săli |
| `POST` | `/api/institutions/{id}/activate`, `/deactivate` | Activare / dezactivare |
| `POST` / `GET` | `/api/faculties` | Creare / listare facultăți (`institutie_id`) |
| `GET` / `PATCH` / `DELETE` | `/api/faculties/{id}` | Detalii / modificare / ștergere facultate |
| `POST` | `/api/faculties/{id}/activate`, `/deactivate` | Activare / dezactivare |
| `POST` / `GET` | `/api/departments` | Creare / listare departamente (`facultate_id`, `institutie_id`, `sef_departament_id`) |
| `GET` / `PATCH` / `DELETE` | `/api/departments/{id}` | Detalii / modificare / ștergere departament |
| `POST` | `/api/departments/{id}/activate`, `/deactivate` | Activare / dezactivare |
| `POST` / `GET` | `/api/rooms` | Creare / listare săli (`departament_id`, `facultate_id`, `institutie_id`, `responsabil_id`, `tip_sala`, `min_capacitate`) |
| `GET` | `/api/rooms/my` | Sălile pentru care utilizatorul curent este responsabil |
| `GET` / `PATCH` / `DELETE` | `/api/rooms/{id}` | Detalii / modificare (administrator sau responsabil) / ștergere sală |
| `PUT` | `/api/rooms/{id}/responsible` | Reasignare responsabil sală |
| `POST` | `/api/rooms/{id}/activate`, `/deactivate` | Activare / dezactivare |

## Maintainers

Echipa 3 (RAVI) — Ingineria Programelor.

## Contributing

Dezvoltare realizată etapizat pe baza cerințelor din specificația de produs (PRD).

## License

MIT

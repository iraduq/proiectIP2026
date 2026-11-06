# Research Resource Manager

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Sistem centralizat pentru gestiunea, monitorizarea și rezervarea resurselor didactice și de cercetare universitare.

Research Resource Manager oferă studenților, cadrelor didactice și personalului administrativ o platformă unificată pentru evidența echipamentelor de cercetare (calculatoare performante, roboți, kituri experimentale, aparatură de laborator, săli de cercetare), prevenirea conflictelor de programare și monitorizarea stării tehnice.

## Table of Contents

- [Background](#background)
- [Architecture](#architecture)
- [Frontend Application](#frontend-application)
  - [Stack & Design System](#stack--design-system)
  - [Funcționalități & Pagini](#funcționalități--pagini)
  - [Căutare Globală Live](#căutare-globală-live)
  - [Izolare pe Facultăți (Student Scoping)](#izolare-pe-facultăți-student-scoping)
  - [Integrare API & Securitate Sesiune](#integrare-api--securitate-sesiune)
- [Database RBAC Architecture](#database-rbac-architecture)
- [Academic Structure](#academic-structure)
- [Database Migrations (Alembic)](#database-migrations-alembic)
- [Security and RBAC](#security-and-rbac)
- [Error Handling & Exceptions](#error-handling--exceptions)
- [Schemas](#schemas)
- [Prerequisites & Database Setup](#prerequisites--database-setup)
- [Install](#install)
  - [Instalare Backend](#instalare-backend)
  - [Instalare Frontend](#instalare-frontend)
- [Usage](#usage)
  - [Rulare Server Backend](#rulare-server-backend)
  - [Rulare Interfață Frontend](#rulare-interfață-frontend)
  - [Compilare Frontend pentru Producție](#compilare-frontend-pentru-producție)
  - [Autentificare în Swagger UI](#autentificare-în-swagger-ui-docs)
  - [Conturi Implicite de Test](#conturi-implicite-de-test-seed-accounts)
  - [Rulare Teste Automate](#rulare-teste-automate)
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

Proiectul este structurat pe două module principale (Backend și Frontend):

```
proiectIP/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── app/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   └── schemas/
│   │   ├── db/
│   │   ├── dependencies/
│   │   ├── exceptions/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── layout/
    │   │   └── ui/
    │   ├── context/
    │   ├── lib/
    │   ├── pages/
    │   ├── types/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## Frontend Application

Modulul de frontend oferă o interfață complet funcțională, sincronizată în timp real cu backend-ul FastAPI prin apeluri REST și cookie-uri HttpOnly.

### Stack & Design System

- **Framework:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS configurat cu design tokens Figma (Shadcn/UI).
- **Iconografie:** Lucide Icons.
- **Client HTTP:** Axios configurat cu `baseURL: '/api'` și `withCredentials: true`.
- **Rutare:** React Router DOM v7 cu protecție automată a rutelor prin `AuthContext`.
- **Design Tokens:** Paletă cromatică curată, contrast alb-negru (`#09090b` / `#ffffff`), nuanțe neutre (`#f4f4f5`, `#e4e4e7`), tipografie precisă și badge-uri de stare.

### Funcționalități & Pagini

#### 1. Autentificare (`/login`)
- Formular curat de conectare cu email și parolă.
- Sesiunea este salvată automat în context și prin cookie securizat `access_token` (HttpOnly).
- Redirecționare automată către `/dashboard` la autentificare reușită.

#### 2. Înregistrare Cont (`/register`)
- Formular complet de înregistrare adaptiv în funcție de rolul selectat.
- Când este selectat rolul `STUDENT`:
  - Se populează automat lista dinamică de facultăți active din baza de date (`GET /api/auth/faculties`).
  - Se solicită numărul matricol.
- Când este selectat alt rol (`PROFESOR`, `RESPONSABIL_LABORATOR`):
  - Numărul matricol și selecția de facultate sunt ascunse.
  - Se solicită identificatorul de angajat.

#### 3. Panou de Bord (`/dashboard`)
- Indicatori statistici agregați: Săli înregistrate, Facultăți active, Departamente didactice.
- **Diferențiere pe roluri:**
  - *Pentru Studenți:* Card dedicat cu cota de resurse (`0 / 4`), bară vizuală de progres, detalii despre numărul matricol și facultatea proprie.
  - *Pentru Administratori:* Excluderea indicatorilor de cotă studențească, afișare badge *Administrator*, identificator angajat și notă dedicată privind responsabilitățile administrative.
- Tabel cu primele săli disponibile și legături directe către cataloage.

#### 4. Catalog Resurse & Echipamente (`/resources`)
- Catalog complet de echipamente (stații GPU deep learning, clustere HPC, brațe robotice, platforme autonome, aparatură de măsură, imprimante 3D, kituri FPGA).
- Indicatori vizuali de stare tehnică: *Disponibilă*, *În mentenanță*, *Defectă*.
- **Filtrare Avansată:** Căutare liberă, filtrare pe categorii, pe săli de cercetare și stare tehnică.
- **Rezervare Rapidă:** Dialog modal cu selector dată/oră început și sfârșit, specificare scop cercetare și verificare instantă a suprapunerilor sau limitelor de cotă.
- **Jurnal Tehnic Dedicat:** Acces facil la istoricul tehnic per resursă și înregistrare de intervenții direct din catalog.
- **Gestiune Categorii & Echipamente:** Modale de administrare pentru adăugare/editare resurse și creare categorii noi.

#### 5. Gestiune Rezervări & Cote Studențești (`/reservations`)
- **Adaptat pentru Studenți:** Card de cotă dinamic (`X / 4 resurse active`) cu bară vizuală de progres, evidența rezervărilor proprii și opțiune de anulare pentru cererile în așteptare.
- **Flux Didactic pentru Profesori și Responsabili:**
  - Separare clară între rezervările personale și cererile venite de la studenți.
  - Aprobare cu un singur click a cererilor eligibile.
  - Respingere motivată prin formular modal de justificare.
  - Înregistrare predare și retur fizic al echipamentului (marcare automată *Finalizată*).

#### 6. Jurnal Tehnic & Fișe Mentenanță (`/technical-history`)
- Registru imutabil pentru auditul intervențiilor tehnice, defecțiunilor și reparațiilor.
- Tipuri de evenimente: Mentenanță preventivă, Defecțiune semnalată, Reparație, Calibrare, Actualizare software/firmware.
- La salvarea unei intervenții cu nouă stare tehnică, starea resursei este actualizată automat și în catalog.

#### 7. Catalog Săli de Cercetare & Laboratoare (`/rooms`)
- Tabel detaliat: cod sală, denumire, tip (`LABORATOR_DIDACTIC`, `LABORATOR_CERCETARE`, `SALA_SERVERE`, `SALA_CONFERINTE`), departament, etaj, capacitate, responsabil sală și stare (Activă / Inactivă).
- **Filtrare Avansată:**
  - Căutare liberă după cod sau nume sală.
  - Filtrare în cascadă: Instituție → Facultate → Departament.
  - Interval numeric de capacitate (capacitate minimă și capacitate maximă).
  - Filtrare după etaj (Subsol, Parter, Etaj 1–5).
  - Filtrare după stare (Toate, Doar Active, Doar Inactive).
  - Sortare multi-criterială (Cod, Nume, Capacitate, Etaj, Dată adăugare; crescător / descrescător).
  - Buton „Resetează filtre” și etichete (badges) eliminabile individual pentru fiecare filtru activ.
- **Operațiuni CRUD pentru Administratori:**
  - Buton `+ Adaugă Sală` cu formular modal validat.
  - Buton de editare pentru fiecare sală existentă.
  - Comutator pentru activare / dezactivare stare sală.
  - Ștergere sală cu dialog de confirmare.

#### 8. Administrare Structură Academică (`/admin/academic`)
- Pagină dedicată exclusiv administratorilor, organizată pe 3 file:
  - **Instituții:** Denumire, cod, oraș, adresă, comutare stare, editare, adăugare și ștergere.
  - **Facultăți:** Denumire, cod, instituție de apartenență, contact, acțiuni CRUD.
  - **Departamente:** Denumire, cod, facultate de apartenență, șef departament, acțiuni CRUD.
- Formulare modale cu validare instantă și notificări de eroare sau succes.

### Căutare Globală Live

Bara laterală conține un câmp integrat de căutare live („Caută în RRM...”) cu debouncing de 250ms:
- Interoghează simultan cataloagele de echipamente/resurse, săli, departamente și facultăți.
- Deschide o fereastră flotantă cu rezultate structurate pe categorii.
- Navighează instant către echipamentul, sala sau secțiunea corespunzătoare din structura academică.

### Izolare pe Facultăți (Student Scoping)

- Studenții au acces restricționat exclusiv la spațiile, departamentele și echipamentele din cadrul propriei facultăți.
- În interfețele `/rooms` și `/resources`, datele sunt filtrate automat pe baza facultății studentului.
- Încercarea de accesare directă a unei săli sau resurse din altă facultate returnează `404 Not Found`.

### Integrare API & Securitate Sesiune

- **Proxy Vite:** Toate cererile către `/api/*` sunt redirecționate către serverul FastAPI de la `http://localhost:8000`.
- **Cookie-uri HttpOnly:** Cookie-ul `access_token` este gestionat automat de browser, prevenind expunerea token-ului în JavaScript și asigurând protecție împotriva atacurilor XSS.
- **Header Bearer Fallback:** În paralel, token-ul este trimis și ca antet `Authorization: Bearer <token>` pentru compatibilitate cu ambele mecanisme.
- **Rute Protejate:** Accesul la `/dashboard`, `/rooms`, `/resources`, `/reservations`, `/technical-history` și `/admin/academic` este restricționat la utilizatorii autentificați; utilizatorii neautorizați sunt redirecționați la `/login`.

## Database RBAC Architecture

Permisiunile și rolurile sunt persistate relațional în PostgreSQL:

- **`roles`**: `id`, `name`, `description`.
- **`permissions`**: `id`, `code` (ex: `bookings:create`), `description`.
- **`role_permissions`**: Tabela de asociere Many-to-Many între `role_id` și `permission_id`.
- **`utilizatori`**: Cheie externă `role_id` către tabela `roles` și `facultate_id` către tabela `facultati`.
- **Inițializare automată (Seeder):** La startup-ul aplicației (`lifespan`), `seed_roles_and_permissions` populează automat tabelele cu rolurile predefinite și asociază permisiunile conform matricei de securitate.

## Academic Structure

Ierarhia academică este persistată relațional: `institutii` → `facultati` → `departamente` → `sali`. Fiecare sală are **obligatoriu un responsabil** (`responsabil_id`), iar fiecare departament poate avea un șef (`sef_departament_id`, rol `PROFESOR`).

### Reguli de business și verificări

| Entitate | Verificări |
|---|---|
| Instituție | denumire și cod unice (case-insensitive); dezactivare blocată dacă are facultăți active; ștergere blocată dacă are facultăți |
| Facultate | instituție existentă și activă; denumire și cod unice în instituție; activare blocată dacă instituția e inactivă; dezactivare blocată dacă are departamente active; ștergere blocată dacă are departamente |
| Departament | facultate existentă și activă; denumire și cod unice în facultate; șef doar cu rol `PROFESOR`, cont activ, maximum 2 departamente conduse; dezactivare blocată dacă are săli active; ștergere blocată dacă are săli |
| Sală | departament existent și activ; cod unic global, denumire unică în departament; responsabil doar `RESPONSABIL_LABORATOR` sau `PROFESOR`, cont activ, maximum 25 săli active per responsabil; capacitate validată pe tip de sală; schimbare responsabil blocată dacă este același utilizator |
| Responsabil sală | poate modifica doar `descriere` și `capacitate` pe sălile proprii; orice alt câmp → `room_fields_restricted`; alt utilizator non-admin → `not_room_responsible` |
| Vizibilitate | utilizatorii non-admin văd doar entitățile active; responsabilul își vede și sălile inactive; studenții văd doar sălile facultății proprii |

Toate erorile sunt excepții custom (`app/exceptions/academic_exceptions.py`) cu răspuns JSON uniform: `{"detail": "...", "code": "..."}`.

### Date de test academice (seed)

La pornirea aplicației se populează automat (idempotent): **3 instituții** (UPT, UTCN, UPB), **3 facultăți per instituție**, **6 departamente per facultate**, **6 săli per departament** (324 săli), plus utilizatori: 3 profesori și 2 responsabili de laborator per facultate.

Rulare manuală:
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

Schema se creează exclusiv prin Alembic. Rulați `alembic upgrade head` înainte de prima pornire și după fiecare actualizare a modelelor.

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
- `UserCreate`: Validare strictă pentru `first_name` și `last_name`, parolă puternică, `rol`, `numar_matricol`, `id_angajat`, `facultate_id`.
- `LoginSchema`: Email validat și parolă.
- `UserResponse`: Răspuns API cu `id_utilizator`, `nume`, `email`, `rol`, `numar_matricol`, `id_angajat`, `facultate_id`, `is_active`, `permissions`, `created_at`.
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

2. Creează și activează mediul virtual:
   ```sh
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Instalează dependințele Python:
   ```sh
   pip install -r requirements.txt
   ```

### Instalare Frontend

1. Navighează în directorul `frontend`:
   ```sh
   cd frontend
   ```

2. Instalează pachetele Node.js:
   ```sh
   npm install
   ```

## Usage

### Rulare Server Backend

Din directorul `backend` (cu mediul virtual activat):

```sh
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interfețele interactive de documentare API sunt accesibile la:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Rulare Interfață Frontend

Din directorul `frontend`:

```sh
npm run dev
```

Aplicația web va fi accesibilă la adresa: [http://localhost:5173](http://localhost:5173). Interfața este configurată cu proxy automat către backend-ul FastAPI (`http://localhost:8000/api`) și trimite automat cookie-urile de autentificare.

### Compilare Frontend pentru Producție

Pentru a verifica tipurile TypeScript și a genera bundle-ul optimizat de producție:

```sh
npm run build
```

Fișierele finale vor fi generate în directorul `frontend/dist/`. Pentru a testa local versiunea de producție:

```sh
npm run preview
```

### Autentificare în Swagger UI (/docs)

Pentru a testa endpoint-urile protejate (precum `GET /api/auth/me`):
1. În interfața Swagger UI, apăsați butonul verde **Authorize** din colțul din dreapta-sus.
2. Introduceți:
   - **username**: adresa de email (ex: `student1@univ.ro`)
   - **password**: parola (`Password123!`)
3. Apăsați **Authorize**, apoi **Close**.
4. Pictograma lacătului devine închisă, iar toate apelurile către endpoint-urile securizate vor include automat antetul `Authorization: Bearer <token>`.

### Conturi Implicite de Test (Seed Accounts)

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

### Rulare Teste Automate

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
| `POST` | `/api/auth/register` | `UserCreate` (`first_name`, `last_name`, `email`, `password`, `rol`, `numar_matricol`, `id_angajat`, `facultate_id`) | Înregistrare cont utilizator |
| `POST` | `/api/auth/login` | `LoginSchema` (`email`, `password`) | Autentificare, returnare token JWT și setare cookie `access_token` (HttpOnly) |
| `POST` | `/api/auth/logout` | - | Deconectare utilizator și ștergere cookie `access_token` |
| `GET` | `/api/auth/me` | Header `Authorization: Bearer <token>` sau Cookie `access_token` | Obținere profil utilizator și listă permisiuni asociate |
| `GET` | `/api/auth/faculties` | - | Listare publică a facultăților active pentru formularul de înregistrare |

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
| `POST` / `GET` | `/api/rooms` | Creare / listare săli (`departament_id`, `facultate_id`, `institutie_id`, `responsabil_id`, `tip_sala`, `min_capacitate`, `max_capacitate`, `etaj`, `sort_by`, `order`) |
| `GET` | `/api/rooms/my` | Sălile pentru care utilizatorul curent este responsabil |
| `GET` / `PATCH` / `DELETE` | `/api/rooms/{id}` | Detalii / modificare (administrator sau responsabil) / ștergere sală |
| `PUT` | `/api/rooms/{id}/responsible` | Reasignare responsabil sală |
| `POST` | `/api/rooms/{id}/activate`, `/deactivate` | Activare / dezactivare |

### Categorii de Resurse (`/api/categories`)

Permisiune de citire pentru toți utilizatorii autentificați; scriere rezervată administratorilor (`structure:manage`).

| Metodă | Endpoint | Descriere |
|---|---|---|
| `GET` | `/api/categories` | Listare paginată categorii resurse cu număr de echipamente asociate (`search`, `is_active`) |
| `GET` | `/api/categories/{id}` | Detalii categorie |
| `POST` | `/api/categories` | Creare categorie nouă |
| `PATCH` | `/api/categories/{id}` | Modificare denumire sau descriere categorie |
| `DELETE` | `/api/categories/{id}` | Ștergere / dezactivare categorie |

### Resurse & Echipamente (`/api/resources`)

Citirea necesită `resources:read` (cu filtrare automată pe facultate pentru studenți), crearea `resources:create`, modificarea `resources:update`, iar ștergerea `resources:delete`.

| Metodă | Endpoint | Descriere |
|---|---|---|
| `GET` | `/api/resources` | Listare paginată resurse (`categorie_id`, `sala_id`, `departament_id`, `facultate_id`, `stare_tehnica`, `is_active`, `search`, `skip`, `limit`) |
| `GET` | `/api/resources/{id}` | Detalii complete resursă (ierarhie sală, departament, facultate, specificații) |
| `POST` | `/api/resources` | Adăugare resursă nouă în inventar cu cod unic de inventar |
| `PATCH` | `/api/resources/{id}` | Modificare date echipament (denumire, sală, specificații, stare tehnică) |
| `DELETE` | `/api/resources/{id}` | Dezactivare resursă din catalog |

### Rezervări Echipamente (`/api/reservations`)

Gestiunea rezervărilor cu validare automată a regulilor academice: maximum 4 resurse simultan per student, fără categorii duplicate, fără suprapuneri temporale pe echipament și blocare echipamente defecte/mentenanță.

| Metodă | Endpoint | Descriere |
|---|---|---|
| `GET` | `/api/reservations/quota` | Verificare cotă personală de rezervare student (`active_count / 4`, rezervări curente) |
| `GET` | `/api/reservations` | Listare rezervări (studenții își văd doar cererile proprii, cadrele didactice cererile din facultate) |
| `GET` | `/api/reservations/{id}` | Detalii rezervare |
| `POST` | `/api/reservations` | Creare cerere rezervare echipament (`resursa_id`, `data_inceput`, `data_sfarsit`, `scop`) |
| `PATCH` | `/api/reservations/{id}/status` | Modificare stare rezervare conform matricei permisiunilor |
| `POST` | `/api/reservations/{id}/cancel` | Anulare rezervare proprie de către solicitant |
| `POST` | `/api/reservations/{id}/approve` | Aprobare rezervare de către profesor / responsabil laborator |
| `POST` | `/api/reservations/{id}/reject` | Respingere motivată rezervare |
| `POST` | `/api/reservations/{id}/return` | Înregistrare predare și retur fizic echipament (finalizare) |

### Jurnal Tehnic & Mentenanță (`/api/technical-history`)

Registru imutabil pentru evidența intervențiilor tehnice și a istoricului reparațiilor (`technical_history:read` / `create`).

| Metodă | Endpoint | Descriere |
|---|---|---|
| `GET` | `/api/technical-history` | Consultare jurnal tehnic (`resursa_id`, `utilizator_id`, `skip`, `limit`) |
| `GET` | `/api/technical-history/{id}` | Detalii înregistrare fișă tehnică |
| `POST` | `/api/technical-history` | Înregistrare intervenție/defecțiune și actualizare automată a stării echipamentului |

## Maintainers

Echipa 3 (RAVI) — Ingineria Programelor.

## Contributing

Dezvoltare realizată etapizat pe baza cerințelor din specificația de produs (PRD).

## License

MIT

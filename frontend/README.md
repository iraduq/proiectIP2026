# Research Resource Manager — Frontend

Interfață modernă pentru utilizatori și administratori dezvoltată în **React 19**, **TypeScript**, **Vite** și **Tailwind CSS**, respectând design system-ul și prototipurile Figma (Shadcn/UI tokens).

---

## Cuprins

- [Prezentare generală](#prezentare-generală)
- [Funcționalități implementate](#funcționalități-implementate)
- [Cerințe de sistem](#cerințe-de-sistem)
- [Instalare](#instalare)
- [Rulare în modul dezvoltare](#rulare-în-modul-dezvoltare)
- [Compilare pentru producție](#compilare-pentru-producție)
- [Structura proiectului](#structura-proiectului)
- [Integrarea cu Backend-ul](#integrarea-cu-backend-ul)

---

## Prezentare generală

Frontend-ul oferă o experiență unificată, complet integrată cu backend-ul FastAPI:
- **Design:** Temă inspirată din componentele Figma Shadcn (culori neutre `#fafafa`, `#ffffff`, borduri fine `#e5e7eb`, badge-uri de stare, tipografie clară).
- **Control al accesului pe roluri:** Interfața adaptează automat controalele, acțiunile și datele afișate în funcție de rolul utilizatorului (`STUDENT`, `ADMINISTRATOR`, `PROFESOR`, `RESPONSABIL_LABORATOR`).
- **Izolare pe facultăți:** Studenții au acces exclusiv la spațiile și departamentele din cadrul facultății lor, în timp ce administratorii beneficiază de control global.

---

## Funcționalități implementate

### 1. Autentificare & Înregistrare
- **Autentificare securizată (`/login`):** Trimitere credențiale, reținere sesiune prin cookie `HttpOnly` și token Bearer.
- **Creare cont nou (`/register`):**
  - Selectare rol (`Student`, `Profesor`, `Responsabil Laborator`).
  - Pentru studenți: afișare selector dinamic de facultate (preluat din baza de date) și număr matricol.
  - Pentru alte roluri: excluderea numărului matricol și a cotelor de student.

### 2. Panou de bord (`/dashboard`)
- Indicatori statistici agregați (Săli înregistrate, Facultăți active, Departamente didactice).
- **Adaptare pe roluri:**
  - *Pentru Studenți:* Card dedicat pentru cota de resurse (`0 / 4`), afișare facultate și număr matricol, bară de progres a cotei.
  - *Pentru Administratori:* Excluderea cotelor studențești, afișare badge *Administrator*, identificator angajat și notă dedicată privind contul de administrare.
- Tabel cu primele spații disponibile și acces rapid către cataloage.

### 3. Catalog săli de cercetare & laboratoare (`/rooms`)
- Tabel complet cu cod sală, denumire, tip, departament, etaj, capacitate, responsabil și stare.
- **Filtrare Avansată:**
  - Căutare liberă după cod sau nume.
  - Filtrare în cascadă: Instituție → Facultate → Departament (pentru studenți este blocat automat pe facultatea proprie).
  - Interval de capacitate numerică (minim - maxim).
  - Filtrare după etaj (Subsol, Parter, Etaj 1–5).
  - Filtrare după stare (Toate / Active / Inactive).
  - Sortare flexibilă (Cod, Nume, Capacitate, Etaj, Dată adăugare; crescător / descrescător).
  - Buton „Resetează filtre” și jetoane (badges) pentru fiecare filtru activ, eliminabile cu un singur click.
- **Gestiune completă pentru administratori:**
  - Buton `+ Adaugă Sală` cu formular validat.
  - Buton editare sală.
  - Comutator activare / dezactivare stare sală.
  - Ștergere sală cu dialog de confirmare.

### 4. Gestiune Structură Academică (`/admin/academic`)
- Vizualizare și administrare pentru trei niveluri ierarhice (Instituții, Facultăți, Departamente).
- Filtre de căutare și filtrare combinată pe fiecare filă.
- Formulare modale pentru adăugare și editare cu validare integrată.
- Operațiuni de activare, dezactivare și ștergere.

### 5. Căutare Globală Live în bara laterală
- Câmpul „Caută în RRM...” din sidebar execută căutare live (debounced la 250ms) simultan în săli, departamente și facultăți.
- Dropdown flotant cu categorii clare.
- Navigare instantă către sala selectată sau structura academică.

---

## Cerințe de sistem

- **Node.js**: versiunea 18 sau mai nouă (recomandat Node 20 LTS).
- **npm**: versiunea 9 sau mai nouă.
- **Server Backend**: FastAPI pornit pe `http://localhost:8000`.

---

## Instalare

1. Deschide un terminal și navighează în directorul `frontend`:
   ```sh
   cd frontend
   ```

2. Instalează dependințele Node.js:
   ```sh
   npm install
   ```

---

## Rulare în modul dezvoltare

Din directorul `frontend`:

```sh
npm run dev
```

Aplicația va porni și va fi disponibilă la:
**http://localhost:5173**

Vite include configurat un proxy intern care redirecționează automat toate cererile către `/api/*` către serverul FastAPI de la `http://localhost:8000`.

---

## Compilare pentru producție

Pentru a verifica tipurile TypeScript și a genera bundle-ul optimizat de producție:

```sh
npm run build
```

Fișierele finale vor fi generate în directorul `frontend/dist/`.

Pentru a rula local versiunea compilată de producție:
```sh
npm run preview
```

---

## Structura proiectului

```
frontend/
├── public/                # Fișiere statice (favicon, pictograme SVG)
├── src/
│   ├── api/               # Apeluri HTTP axios către backend
│   │   ├── client.ts      # Instanță Axios cu baseURL: "/api" și withCredentials: true
│   │   ├── auth.ts        # Apeluri login, register, me, logout, facultăți
│   │   └── academic.ts    # CRUD săli, departamente, facultăți, instituții
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx   # Layout principal: sidebar, căutare globală, breadcrumbs, user info
│   │   └── ui/            # Componente reutilizabile UI
│   │       ├── badge.tsx  # Badge-uri de stare (success, outline, secondary)
│   │       ├── button.tsx # Butoane tematizate
│   │       ├── card.tsx   # Card-uri de conținut
│   │       └── input.tsx  # Câmpuri de introducere text
│   ├── context/
│   │   └── AuthContext.tsx # Context global React pentru autentificare și sesiune
│   ├── lib/
│   │   └── utils.ts       # Utilitare CSS (clsx, tailwind-merge)
│   ├── pages/
│   │   ├── LoginPage.tsx         # Ecran autentificare
│   │   ├── RegisterPage.tsx      # Ecran creare cont cu selecție facultate
│   │   ├── DashboardPage.tsx     # Panou de bord adaptiv pe roluri
│   │   ├── RoomsPage.tsx         # Catalog săli cu filtrare avansată și CRUD
│   │   └── AcademicAdminPage.tsx # Administrare instituții, facultăți, departamente
│   ├── types/
│   │   └── index.ts       # Tipuri TypeScript sincronizate cu schemele Pydantic
│   ├── App.tsx            # Rute React Router DOM și protecție pagini
│   ├── main.tsx           # Punct de intrare React
│   └── index.css          # Configurare Tailwind CSS și stiluri de bază
├── index.html             # Fișierul HTML principal
├── package.json           # Dependințe și scripturi npm
├── tailwind.config.js     # Configurație Tailwind CSS
├── tsconfig.json          # Configurație compilator TypeScript
└── vite.config.ts         # Configurație Vite cu proxy către backend FastAPI
```

---

## Integrarea cu Backend-ul

- **Proxy automat:** Cererile `api.get('/rooms')` sunt transformate automat de Vite în `http://localhost:8000/api/rooms`.
- **Securitate sesiune:** Cookie-ul securizat `access_token` (HttpOnly) este trimis automat de browser la fiecare cerere (`withCredentials: true`), prevenind atacurile de tip XSS.
- **Rute protejate:** Accesul la paginile `/dashboard`, `/rooms` și `/admin/academic` este verificat automat prin contextul `AuthContext`. Utilizatorii neautentificați sunt redirecționați către `/login`.

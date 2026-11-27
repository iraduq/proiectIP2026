# Plan de teste – Resource Reservation Manager

Document pentru Laboratorul 9 (Ingineria programelor). Cazurile de mai jos sunt scrise pentru a fi importate în **Testiny** (un caz = un test case; coloanele *ID, Titlu, Categorie, Precondiții, Pași, Rezultat așteptat, Prioritate*).

Mediu: backend FastAPI (`/api`), frontend React/Vite, conturi de test din `backend/app/db/seed.py` (`admin1@univ.ro`, `lab1@univ.ro`, `student1@univ.ro`, un profesor). Parola de test este cea din seed.

## 1. Teste funcționale

| ID | Titlu | Precondiții | Pași | Rezultat așteptat | Prior. |
|----|-------|-------------|------|-------------------|--------|
| F-01 | Autentificare reușită | cont student existent | Login cu email și parolă corecte | 200, token primit, redirect în dashboard | Înaltă |
| F-02 | Student creează rezervare | student autentificat, resursă DISPONIBILA | Alege resursa, interval liber, scop; trimite | 201, stare `IN_ASTEPTARE` | Înaltă |
| F-03 | Conflict de interval | rezervare aprobată pe același interval | Creează altă rezervare suprapusă | 409 `ReservationConflict` | Înaltă |
| F-04 | Limită rezervări student | student cu 4 rezervări active | Creează a 5-a rezervare | Eroare de limită depășită | Medie |
| F-05 | Aprobare cerere de către responsabil | cerere în așteptare în sala lui | `POST /reservations/{id}/approve` | 200, stare `APROBATA` | Înaltă |
| F-06 | Respingere cu motiv | cerere în așteptare | Respinge din pagina `/lab` cu motiv | Stare `RESPINSA`, motivul salvat; fără motiv, UI blochează acțiunea | Înaltă |
| F-07 | Predare echipament | rezervare `APROBATA` | `POST /reservations/{id}/handover?stare_initiala=VERIFICARE` | 200, `preluat_la` completat, `stare_predare=VERIFICARE` | Înaltă |
| F-08 | Predare dublă | rezervare deja predată | Repetă predarea | Eroare 4xx (tranziție invalidă) | Medie |
| F-09 | Retur în stare Defect | rezervare aprobată | Retur cu starea „Defect / Piesă lipsă” | Rezervare `FINALIZATA`, resursă `DEFECTA`, intrare în jurnal tehnic | Înaltă |
| F-10 | Jurnal tehnic nou | responsabil autentificat | Completează formularul din `/lab` | Intrare nouă, autor și timestamp automate | Medie |
| F-11 | Metrici laborator | resurse în stări diferite | Deschide `/lab` | Contoarele Disponibile/În utilizare/Mentenanță/Defect corespund datelor | Medie |

## 2. Teste de securitate (acces și autorizare)

| ID | Titlu | Pași | Rezultat așteptat | Prior. |
|----|-------|------|-------------------|--------|
| S-01 | Acces fără token | `GET /api/reservations` fără header | 401 | Înaltă |
| S-02 | Student aprobă cerere | student apelează `/approve` | 403 | Înaltă |
| S-03 | Profesor face predare | profesor apelează `/handover` | 403 | Înaltă |
| S-04 | Responsabil din alt laborator | responsabil A apelează predare/retur pe sala lui B | 403 `UnauthorizedAccess` | Înaltă |
| S-05 | Câmpuri restricționate resursă | responsabil trimite `PATCH /resources/{id}` cu `nume` | 403, cod `resource_fields_restricted` | Înaltă |
| S-06 | Câmpuri restricționate sală | responsabil trimite `PATCH /rooms/{id}` cu `cod` | 403 | Înaltă |
| S-07 | Student vede rezervarea altuia | `GET /reservations/{id}` al altui student | 403 | Înaltă |
| S-08 | SQL injection în login | email `' OR '1'='1`, parolă oarecare | 401/422, fără autentificare | Înaltă |
| S-09 | SQL injection în căutare | `GET /api/resources?search=' OR 1=1--` | 200 cu rezultate normale, fără eroare SQL sau scurgere de date | Înaltă |
| S-10 | XSS stocat | rezervare cu scop `<script>alert(1)</script>` | Textul apare escapat în UI, scriptul nu rulează | Înaltă |
| S-11 | CSRF | cerere cross-site cu cookie, fără header `Authorization` | Respinsă (token Bearer, nu cookie de sesiune) | Medie |
| S-12 | Token expirat/modificat | token cu semnătura alterată | 401 | Înaltă |
| S-13 | Parole stocate | inspectare tabel utilizatori | Parolele sunt hash (bcrypt), nu text clar | Înaltă |

## 3. Teste de performanță

| ID | Titlu | Pași | Rezultat așteptat |
|----|-------|------|-------------------|
| P-01 | Listare resurse | 50 de cereri concurente pe `GET /api/resources?limit=50` | p95 < 500 ms, fără erori |
| P-02 | Creare rezervări concurente | 20 de cereri simultane pentru același interval | Exact una reușește, restul 409 |
| P-03 | Încărcare `/lab` | 100 de resurse și 100 de rezervări | Pagina randată în < 3 s |

## 4. Teste de penetrare (ZAP)
Vezi `securitate-zap.md`: scanare automată (spider + active scan) și manuală pe aplicația rulată local.

## 5. Teste de utilizabilitate

| ID | Titlu | Rezultat așteptat |
|----|-------|-------------------|
| U-01 | Mesaje de eroare clare | Erorile apar în română, lângă acțiunea eșuată |
| U-02 | Respingere fără motiv | Mesaj explicit, cererea rămâne în așteptare |
| U-03 | Navigare | „Laboratorul meu” apare în meniu doar pentru responsabil |
| U-04 | Paginare | Tabelele cu mai mult de 5 rânduri se paginează |

## 6. Compatibilitate platformă

| ID | Titlu | Rezultat așteptat |
|----|-------|-------------------|
| C-01 | Chrome, Firefox, Safari (ultimele versiuni) | Pagina `/lab` se afișează și funcționează identic |
| C-02 | Rezoluții 1280, 1440, 1920 px | Fără suprapuneri sau scroll orizontal |

## 7. Regresie
Se rulează la fiecare PR: `pytest` din `backend/` (44 de teste) și `npx tsc --noEmit` plus `vite build` din `frontend/`. După modificări ale rezervărilor se repetă F-02 – F-09.

## Rulare automată existentă
`backend/tests/test_resources_and_reservations.py` acoperă F-02, F-03, F-05, F-07, F-08, S-02, S-03, S-05.

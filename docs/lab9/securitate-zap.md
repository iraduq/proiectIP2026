# Test de penetrare experimental cu ZAP – ghid și șablon de raport

## 1. Pregătire
1. Pornește backend-ul (`uvicorn app.main:app`) și frontend-ul (`npm run dev`) local. Ținta este **doar** aplicația locală (ex. `http://localhost:5173` și `http://localhost:8000`).
2. Instalează ZAP (zaproxy.org) și pornește-l.

## 2. Scanare automată
1. *Automated Scan* → URL `http://localhost:5173` → Use traditional spider + Active Scan.
2. Pentru API: *Import → Import an OpenAPI definition from a URL* cu `http://localhost:8000/openapi.json`, apoi Active Scan pe contextul API, cu token Bearer setat (Replacer sau Authentication).
3. Exportă raportul: *Report → Generate Report* (HTML și PDF) și salvează-l în `docs/lab9/zap-report.html`.

## 3. Verificări manuale (Manual Explore / Requester)
- SQL injection în `/api/auth/login` și în parametrul `search` al `/api/resources`.
- XSS în câmpul `scop` al rezervării și în descrierile din jurnal.
- Acces direct la ID-uri străine (IDOR) pe `/api/reservations/{id}`.
- Anteturi de securitate lipsă (CSP, X-Frame-Options, X-Content-Type-Options).
- Comportament la token expirat sau modificat.

## 4. Raport de evaluare a securității (de completat după scanare)

| Nr. | Vulnerabilitate | Risc (ZAP) | Locație | Impact | Recomandare | Stare |
|-----|-----------------|------------|---------|--------|-------------|-------|
| 1 | … | … | … | … | … | Deschis / Remediat |

Rezumat: numărul de alerte pe nivel (High / Medium / Low / Informational), concluzii, plan de remediere.

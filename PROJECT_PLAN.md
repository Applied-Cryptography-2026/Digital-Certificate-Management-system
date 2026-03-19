# X.509 Certificate Management System — Project Plan

## 1. Project Overview

A web-based system for managing and issuing X.509 digital certificates for SSL/TLS.
Two user roles: **Admin** (Certificate Authority operator) and **Customer** (certificate applicant).

---

## 2. Tech Stack (Recommended)

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript, Tailwind CSS, React Query |
| Backend | Go (Golang) + Gin/Echo framework |
| Database | PostgreSQL |
| Crypto | Go standard library (crypto/ecdsa, crypto/rsa, crypto/x509), govalidator |
| Auth | JWT + bcrypt, RBAC |
| API | REST (OpenAPI 3.0 spec) |
| DevOps | Docker, GitHub Actions CI/CD |

---

## 3. Database Schema (Core Entities)

```
users            — id, username, password_hash, role(ADMIN/CUSTOMER), created_at
key_pairs        — id, user_id, public_key, encrypted_private_key, algorithm, key_length, created_at
certificates     — id, serial_number, subject_dn, issuer_dn, public_key, not_before, not_after,
                   signature_algorithm, signature, status(ACTIVE/REVOKED/EXPIRED), key_pair_id, csr_id
csrs             — id, user_id, domain, key_pair_id, csr_pem, status(PENDING/APPROVED/REJECTED),
                   reject_reason, created_at, reviewed_at
root_ca          — id, certificate_id, key_pair_id, created_at
system_config    — id, key, value (asymmetric_algo, hash_function, default_validity, key_length)
crl_entries      — id, certificate_id, revocation_date, reason
revocation_reqs  — id, certificate_id, user_id, reason, status(PENDING/APPROVED/REJECTED), created_at
audit_logs       — id, user_id, action, entity_type, entity_id, details_json, ip, timestamp
uploaded_certs   — id, user_id, cert_pem, parsed_subject, parsed_issuer, not_after, uploaded_at
```

---

## 4. Sprint Plan (6 Sprints × 1 Week = 6 Weeks)

---

### Sprint 1 — Foundation & Auth (Week 1)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-1.1 | Project scaffolding, Go module setup, Docker setup (DB, app) | High | 1d |
| BE-1.2 | Database schema migration scripts | High | 1.5d |
| BE-1.3 | User registration endpoint (`POST /api/auth/register`) | High | 1d |
| BE-1.4 | User login endpoint (`POST /api/auth/login`) — JWT issuance | High | 1d |
| BE-1.5 | Password change endpoint (`PUT /api/auth/password`) | Medium | 0.5d |
| BE-1.6 | RBAC middleware (Admin vs Customer guards) | High | 1d |
| BE-1.7 | Audit log service + middleware (log every write action) | Medium | 1d |
| BE-1.8 | Password hashing (bcrypt), input validation, rate limiting | High | 1d |

**Deliverable:** Auth API fully functional, Swagger docs live.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-1.1 | Project scaffolding (Vite + React + TS + Tailwind) | High | 1d |
| FE-1.2 | Routing setup (public vs protected routes) | High | 0.5d |
| FE-1.3 | Auth context / JWT token management | High | 1d |
| FE-1.4 | Login page | High | 1d |
| FE-1.5 | Registration page | High | 1d |
| FE-1.6 | Change password page | Medium | 0.5d |
| FE-1.7 | App shell layout (sidebar nav, header, role-based menu) | High | 1.5d |
| FE-1.8 | API client setup (axios/fetch wrapper, interceptors) | High | 1d |

**Deliverable:** Users can register, log in, see role-based dashboard shell.

---

### Sprint 2 — Admin: System Config & Root CA (Week 2)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-2.1 | System config CRUD (`GET/PUT /api/admin/config`) | High | 1d |
| BE-2.2 | Root CA key pair generation endpoint (`POST /api/admin/root-ca/keypair`) | High | 2d |
| BE-2.3 | Root certificate generation endpoint (`POST /api/admin/root-ca/certificate`) | High | 2d |
| BE-2.4 | Crypto service: RSA/EC key generation, self-signed cert creation | High | 2d |
| BE-2.5 | Secure storage for Root CA private key (encrypted at rest) | High | 1d |
| BE-2.6 | Root CA info endpoint (`GET /api/admin/root-ca`) | Medium | 0.5d |

**Deliverable:** Admin can configure crypto params and generate Root CA.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-2.1 | Admin dashboard home (overview stats) | Medium | 1d |
| FE-2.2 | System config page (form: algorithm, hash, validity, key length) | High | 1.5d |
| FE-2.3 | Root CA management page (generate keypair, generate cert, view info) | High | 2d |
| FE-2.4 | Confirmation dialogs for destructive/irreversible actions | Medium | 0.5d |
| FE-2.5 | Toast/notification system | Medium | 0.5d |
| FE-2.6 | Loading states, error boundaries | Medium | 0.5d |

**Deliverable:** Admin UI for system configuration and Root CA setup.

---

### Sprint 3 — Customer: Key Pairs & CSR Submission (Week 3)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-3.1 | Customer key pair generation (`POST /api/keys/generate`) | High | 1.5d |
| BE-3.2 | List user's key pairs (`GET /api/keys`) | High | 0.5d |
| BE-3.3 | CSR generation/submission (`POST /api/csr`) — validate domain, build CSR | High | 2.5d |
| BE-3.4 | List user's CSRs with status (`GET /api/csr`) | High | 0.5d |
| BE-3.5 | CSR detail endpoint (`GET /api/csr/:id`) | Medium | 0.5d |
| BE-3.6 | Private key encryption before DB storage (AES-256) | High | 1d |
| BE-3.7 | Domain validation rules (format, uniqueness) | Medium | 0.5d |

**Deliverable:** Customers can generate keys and submit CSRs.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-3.1 | Customer dashboard home | Medium | 0.5d |
| FE-3.2 | Key pair management page (generate, list) | High | 1.5d |
| FE-3.3 | CSR request form (select key pair, enter domain + org info) | High | 2d |
| FE-3.4 | CSR list page with status badges (Pending/Approved/Rejected) | High | 1d |
| FE-3.5 | CSR detail view | Medium | 0.5d |
| FE-3.6 | Form validation (domain format, required fields) | Medium | 0.5d |

**Deliverable:** Customer UI for key management and certificate requests.

---

### Sprint 4 — Admin: Certificate Issuance & Rejection (Week 4)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-4.1 | List all pending CSRs for admin (`GET /api/admin/csr?status=PENDING`) | High | 0.5d |
| BE-4.2 | Approve CSR → sign & issue certificate (`POST /api/admin/csr/:id/approve`) | High | 2.5d |
| BE-4.3 | Reject CSR with reason (`POST /api/admin/csr/:id/reject`) | High | 0.5d |
| BE-4.4 | Certificate signing logic (sign CSR with Root CA private key) | High | 2d |
| BE-4.5 | List all issued certificates (`GET /api/admin/certificates`) | High | 0.5d |
| BE-4.6 | Certificate download endpoint — PEM/DER format (`GET /api/certificates/:id/download`) | Medium | 1d |
| BE-4.7 | Serial number generation (unique, sequential) | Medium | 0.5d |

**Deliverable:** Full certificate issuance pipeline working end-to-end.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-4.1 | Admin: pending CSR review queue (table with filters) | High | 1.5d |
| FE-4.2 | CSR detail modal (view CSR info, domain, org, key details) | High | 1d |
| FE-4.3 | Approve/Reject actions with confirmation + reject reason input | High | 1d |
| FE-4.4 | Admin: issued certificates table (search, filter, sort) | High | 1.5d |
| FE-4.5 | Customer: my certificates page (list, status, download buttons) | High | 1.5d |
| FE-4.6 | Certificate detail view (parsed subject, issuer, validity, fingerprint) | Medium | 0.5d |

**Deliverable:** Admin can review, approve/reject CSRs. Customers can download certs.

---

### Sprint 5 — Revocation, CRL & Certificate Upload (Week 5)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-5.1 | Customer: request certificate revocation (`POST /api/certificates/:id/revoke-request`) | High | 1d |
| BE-5.2 | Admin: list revocation requests (`GET /api/admin/revocation-requests`) | High | 0.5d |
| BE-5.3 | Admin: approve/reject revocation (`POST /api/admin/revocation-requests/:id/approve`) | High | 1d |
| BE-5.4 | Revoke certificate → update status, add to CRL entries | High | 0.5d |
| BE-5.5 | CRL generation endpoint (`GET /api/crl`) — standard X.509 CRL format | High | 2d |
| BE-5.6 | Admin: manual certificate revocation (`POST /api/admin/certificates/:id/revoke`) | Medium | 0.5d |
| BE-5.7 | Admin: certificate renewal (`POST /api/admin/certificates/:id/renew`) | Medium | 1d |
| BE-5.8 | Customer: upload external certificate (`POST /api/certificates/upload`) | Medium | 0.5d |
| BE-5.9 | Parse uploaded certificate (extract subject, issuer, validity, extensions) | Medium | 1d |

**Deliverable:** Full revocation lifecycle + CRL + external cert upload.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-5.1 | Customer: revocation request button on certificate detail | High | 0.5d |
| FE-5.2 | Customer: revocation request list + status tracking | High | 0.5d |
| FE-5.3 | Admin: revocation request queue (approve/reject) | High | 1d |
| FE-5.4 | Admin: revoke/renew actions on certificate management page | Medium | 1d |
| FE-5.5 | Public CRL lookup page (search by serial, domain) | High | 1d |
| FE-5.6 | Customer: upload certificate page (file upload + parsed info display) | Medium | 1.5d |
| FE-5.7 | Customer: uploaded certificates list + detail view | Medium | 0.5d |

**Deliverable:** Revocation workflow, CRL browsing, cert upload all functional.

---

### Sprint 6 — Audit Logs, Polish & Hardening (Week 6)

#### Backend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| BE-6.1 | Admin: audit log query endpoint (`GET /api/admin/logs`) with filters | High | 1d |
| BE-6.2 | Automated certificate expiry checker (scheduled job) | Medium | 1d |
| BE-6.3 | API input sanitization & security audit | High | 0.5d |
| BE-6.4 | Rate limiting on auth endpoints | Medium | 0.5d |
| BE-6.5 | API documentation finalization (OpenAPI/Swagger) | Medium | 0.5d |
| BE-6.6 | Unit tests for crypto services (key gen, signing, CRL) | High | 1.5d |
| BE-6.7 | Integration tests for critical flows (register → CSR → issue → revoke) | High | 1.5d |
| BE-6.8 | Performance testing on certificate operations | Low | 0.5d |

**Deliverable:** Production-ready backend with tests and security hardening.

#### Frontend Team

| # | Task | Priority | Est |
|---|------|----------|-----|
| FE-6.1 | Admin: audit log viewer (table with date range, user, action filters) | High | 1.5d |
| FE-6.2 | Responsive design pass (mobile/tablet) | Medium | 1d |
| FE-6.3 | Accessibility audit (keyboard nav, ARIA labels, contrast) | Medium | 0.5d |
| FE-6.4 | Error handling improvements (network errors, session expiry) | Medium | 0.5d |
| FE-6.5 | E2E tests (Playwright/Cypress) — critical user flows | High | 1.5d |
| FE-6.6 | UI polish: empty states, loading skeletons, transitions | Low | 0.5d |
| FE-6.7 | Build optimization, environment config (dev/staging/prod) | Medium | 0.5d |

**Deliverable:** Polished, tested, deployable frontend.

---

## 5. API Endpoints Summary

### Auth
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Customer registration |
| POST | `/api/auth/login` | Public | Login (returns JWT) |
| PUT | `/api/auth/password` | Auth | Change password |

### Customer — Keys & CSR
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/keys/generate` | Customer | Generate key pair |
| GET | `/api/keys` | Customer | List my key pairs |
| POST | `/api/csr` | Customer | Submit CSR |
| GET | `/api/csr` | Customer | List my CSRs |
| GET | `/api/csr/:id` | Customer | CSR detail |

### Customer — Certificates
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/certificates` | Customer | List my certificates |
| GET | `/api/certificates/:id` | Customer | Certificate detail |
| GET | `/api/certificates/:id/download` | Customer | Download cert (PEM/DER) |
| POST | `/api/certificates/:id/revoke-request` | Customer | Request revocation |
| POST | `/api/certificates/upload` | Customer | Upload external cert |
| GET | `/api/certificates/uploaded` | Customer | List uploaded certs |

### Admin — System
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/config` | Admin | Get system config |
| PUT | `/api/admin/config` | Admin | Update system config |
| POST | `/api/admin/root-ca/keypair` | Admin | Generate Root CA key pair |
| POST | `/api/admin/root-ca/certificate` | Admin | Generate Root Certificate |
| GET | `/api/admin/root-ca` | Admin | View Root CA info |

### Admin — Certificate Management
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/csr` | Admin | List all CSRs (filterable) |
| POST | `/api/admin/csr/:id/approve` | Admin | Approve & issue cert |
| POST | `/api/admin/csr/:id/reject` | Admin | Reject CSR |
| GET | `/api/admin/certificates` | Admin | List all certificates |
| POST | `/api/admin/certificates/:id/revoke` | Admin | Directly revoke cert |
| POST | `/api/admin/certificates/:id/renew` | Admin | Renew cert |

### Admin — Revocation & Logs
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/revocation-requests` | Admin | List revocation requests |
| POST | `/api/admin/revocation-requests/:id/approve` | Admin | Approve revocation |
| POST | `/api/admin/revocation-requests/:id/reject` | Admin | Reject revocation |
| GET | `/api/admin/logs` | Admin | Query audit logs |

### Public
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/crl` | Public | Download CRL |

---

## 6. Security Requirements

- **Passwords**: bcrypt (cost factor 12+), never stored in plaintext
- **Private keys at rest**: AES-256-GCM encryption, key derived from user password or system master key
- **Root CA private key**: Encrypted with system master key, stored separately from DB if possible
- **JWT**: Short-lived access tokens (15 min) + refresh tokens (7 days), HttpOnly cookies
- **Transport**: HTTPS only in production
- **Input validation**: All endpoints validate and sanitize input
- **Rate limiting**: Auth endpoints (5 req/min), API endpoints (100 req/min)
- **Audit trail**: Every state-changing action logged with user, IP, timestamp
- **CORS**: Whitelist frontend origin only
- **SQL injection**: Parameterized queries / ORM only

---

## 7. Team Responsibilities

### Backend Team (2–3 devs)
- REST API development (Go)
- Cryptographic operations (key gen, CSR parsing, cert signing, CRL generation)
- Database design and migrations
- Authentication & authorization
- Audit logging
- Unit & integration tests
- API documentation

### Frontend Team (2–3 devs)
- UI/UX implementation (React)
- State management & API integration
- Form validation
- Role-based routing & views
- Responsive design
- E2E tests
- Build & deployment config

---

## 8. Definition of Done (per feature)

- [ ] Code reviewed and merged to `develop`
- [ ] Unit tests passing (BE: >80% coverage on business logic)
- [ ] API endpoint documented in Swagger
- [ ] UI matches design, works on desktop + tablet
- [ ] Audit log entry created for state-changing actions
- [ ] No critical/high security vulnerabilities
- [ ] Sensitive data encrypted at rest

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Crypto implementation bugs | High — invalid certs | Use Go standard library crypto packages, extensive unit tests |
| Private key leakage | Critical | Encrypt at rest, never log keys, minimize key exposure in memory |
| Root CA compromise | Critical | Encrypt Root CA key separately, restrict admin access, audit all Root CA operations |
| Scope creep | Medium | Strict sprint scope, defer nice-to-haves to backlog |
| Integration delays between FE/BE | Medium | API contract (OpenAPI spec) agreed in Sprint 1, mock server for FE |

---

## 10. Milestones

| Milestone | Target | Criteria |
|-----------|--------|----------|
| M1 — Auth & Foundation | End of Sprint 1 | Users can register, login, role-based access works |
| M2 — Root CA Ready | End of Sprint 2 | Admin can configure system and generate Root CA |
| M3 — CSR Flow | End of Sprint 3 | Customers can generate keys and submit CSRs |
| M4 — Certificate Issuance | End of Sprint 4 | End-to-end: CSR → approval → certificate download |
| M5 — Revocation & CRL | End of Sprint 5 | Full revocation lifecycle, CRL generation, cert upload |
| M6 — Production Ready | End of Sprint 6 | Tests passing, security hardened, documentation complete |

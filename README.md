_This project has been created as part of the 42 curriculum by daavril, aistierl, kcharbon, kito_6864, y42bro._

# ft_transcendence — ChessWar

## Description

ChessWar is a web application built for the 42 ft_transcendence project.
It provides secure user accounts, profile management, friends, private chat, and multiplayer chess with real-time synchronization.

### Key features

- Secure authentication (email/password, JWT access/refresh cookies)
- OAuth login (Google)
- Two-Factor Authentication (TOTP)
- User profile management (update data, avatar, account deletion)
- Friends system (search/add/remove/update status)
- Private real-time chat (WebSocket)
- Chess game modes (local + online real-time)
- Match/session persistence APIs
- Legal pages: Privacy Policy and Terms of Service

---

## Instructions

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- npm

### Environment setup

1. Copy and fill environment files:
   - Root: `.env` (based on `.env.example`)
   - Backend: `backend/.env` (based on `backend/.env.example`)
2. Never commit real secrets. Keep secrets in local env/Vault only.

### Run with Docker (recommended)

```bash
docker compose --profile dev up -d --build
```

### Production (préparation)

Ce dépôt contient une configuration de production minimale. Pour lancer la stack en production (images buildées, frontend servi statiquement, backend en `NODE_ENV=production`):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Notes importantes:

- Assure-toi d'avoir défini toutes les variables d'environnement de production (`POSTGRES_URL`, `REDIS_URL`, `BASE_URL`, `AUTH_UI_REDIRECT`, `GOOGLE_AUTH_REDIRECT_URI`, etc.).
- Par défaut, le bootstrap Vault est activé ; si tu préfères injecter les secrets via des variables/secret managers, définir `BACKEND_SKIP_VAULT=true` permet de passer outre (mais il faut alors fournir les secrets via l'environnement).
- Le `frontend` en production sert le build statique via Nginx (`frontend/Dockerfile.prod`). Le backend utilise `backend/Dockerfile.prod`.

Migrations:

- En production il faut appliquer les migrations avant (ou pendant) le déploiement. Deux approches courantes sont décrites dans ce README (init container ou job de migration). Voir la section "Migrations" plus bas.

### Useful local commands

```bash
# Frontend
npm --prefix frontend run lint
npm --prefix frontend run build

# Backend
npm --prefix backend run lint
npm --prefix backend run build
npm --prefix backend run test -- --runInBand --passWithNoTests
```

### Access

- App (nginx): `https://localhost`
- Dev alternate port setup may use `https://localhost:9443`

---

## Team Information

### daavril (Daryl)

- Roles: Product Owner, Frontend Lead, DevOps coordination
- Responsibilities: Frontend architecture/integration, UX flows, deployment orchestration, team coordination

### aistierl (Aïcha)

- Roles: Backend Lead, Security contributor
- Responsibilities: Auth architecture, token lifecycle, user/game backend integration

### kcharbon (Kalvin)

- Roles: Security/Infra Engineer, Backend contributor
- Responsibilities: WAF/ModSecurity, Vault integration, backend hardening

### kito_6864 (Ylan)

- Roles: Gameplay Developer
- Responsibilities: Chess logic/gameplay foundation and game behavior integration

### y42bro (Yassine)

- Roles: Realtime Systems Developer
- Responsibilities: WebSocket game/chat integration, real-time synchronization, multiplayer runtime validation

---

## Project Management

- Work organization: feature branches + pull requests + iterative integration
- Task distribution: by module ownership (frontend/backend/security/realtime/gameplay)
- Communication: Discord + in-school sync sessions
- Tracking: Git history, PR reviews, branch-based integration

---

## Technical Stack

### Frontend

- React + TypeScript + Vite
- TailwindCSS
- socket.io-client

### Backend

- NestJS + TypeScript
- Socket.IO gateways
- JWT auth (access/refresh), Passport strategies
- Google OAuth
- Speakeasy/qrcode for 2FA

### Data/Infra

- PostgreSQL
- Drizzle ORM
- Redis
- nginx + ModSecurity (WAF)
- HashiCorp Vault
- Docker Compose

### Major technical choices

- NestJS for structured modular backend
- React/Vite for fast frontend iteration
- Socket.IO for robust bidirectional real-time events
- Drizzle + PostgreSQL for typed relational data access
- WAF + Vault for security baseline and secret management

---

## Database Schema (summary)

### players

- `playerId` (PK), `mailAddress`, `playerName`, `pwd`, `avatarUrl`, `isGoogleUser`, timestamps

### games

- `gameId` (PK), `gameMode`, `gameStatus`, `gameResult`, move counters, timestamps

### participation

- Links players to games
- Stores `playerColor`, `playerResult`
- Constraints enforce one active pending game per player

### friendship

- User relationship table (`PENDING`/`ADDED`) with requester tracking

---

## Features List

- Authentication & session lifecycle (email/password, refresh, logout)
- OAuth Google login
- 2FA enable/verify/disable
- Profile read/update/delete
- Friends search/add/remove/status update
- Real-time private chat (`/chat` namespace)
- Real-time multiplayer game sync (`/game` namespace)
- Game create/join/session/end/resign APIs
- Legal pages available and linked from application UI

---

## Modules

### Chosen modules and points

- **Web (Major)**: Frontend + Backend frameworks → **2 pts**
- **Web (Major)**: Real-time features (WebSockets) → **2 pts**
- **Web (Major)**: User interaction (chat + profile + friends) → **2 pts**
- **Web (Minor)**: ORM usage (Drizzle) → **1 pt**
- **User Management (Major)**: Standard user management/authentication → **2 pts**
- **User Management (Minor)**: OAuth 2.0 (Google) → **1 pt**
- **User Management (Minor)**: 2FA → **1 pt**
- **Cybersecurity (Major)**: WAF/ModSecurity + Vault → **2 pts**
- **Gaming UX (Major)**: Web-based game → **2 pts**
- **Gaming UX (Major)**: Remote players in real-time → **2 pts**
- **User Management (Minor)**: Game statistics/history integration surface → **1 pt**

**Total claimed points: 18**

---

## Individual Contributions (high-level)

- Frontend integration and UX routing/layout
- Backend module wiring and API evolution
- Security infra setup (WAF + Vault)
- Realtime gateways and socket event flows
- Gameplay logic integration and online-state synchronization

Challenges addressed:

- Synchronizing frontend game state with backend/game room events
- Runtime compatibility under nginx + HTTPS + socket upgrade paths
- Keeping auth cookies and websocket handshake aligned

---

## Resources

- 42 subject PDF (`en.subject (1).pdf`)
- NestJS docs: https://docs.nestjs.com/
- React docs: https://react.dev/
- Socket.IO docs: https://socket.io/docs/
- Drizzle docs: https://orm.drizzle.team/
- OWASP CRS: https://coreruleset.org/
- Vault docs: https://developer.hashicorp.com/vault/docs

### AI usage

AI was used for:

- Refactoring assistance and static analysis suggestions
- Runtime debugging guidance
- Test-flow scripting support
- Compliance checklist consolidation

All AI-generated output was reviewed, adapted, and validated with project-specific checks.

# Chess War

> Created as part of the 42 curriculum by **aistierl**, **daavril**, **kcharbon**, **ychattou**

---

## Description

**Chess War** is a real-time multiplayer gaming platform combining chess, live chat, and social features in a single web application. The goal is to deliver a seamless, competitive, and social experience powered by WebSocket communication.

Beyond core gameplay, the project prioritizes security and infrastructure robustness — secrets are managed through HashiCorp Vault, and a Web Application Firewall protects against malicious traffic. This balances product logic (live gaming) with DevSecOps best practices (secret management, traffic filtering, service isolation).

**Tech stack at a glance:** NestJS · React · PostgreSQL · Redis · WebSockets · Docker

---

## Getting Started

### Requirements

- Fill in the `.env` file with the required environment variables.
- Load the `secrets/` folder for Docker Compose.

### Launch

```bash
docker compose up
```

Then open your browser at:

```
https://localhost
```

If you don't have an account yet, click **"Créer un compte"** — you can register classically or via Google.  
After registration you'll be redirected to the login page. Once logged in, the dashboard will load with your stats, matches, and access to all features.

### Stop

```bash
docker compose down
```

---

## Technical Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (full-stack) |
| Backend | NestJS |
| Frontend | React, TailwindCSS, Vite |
| ORM | Drizzle (with migrations) |
| Auth | Passport.js (local, JWT, Google OAuth, JWT-refresh) |
| 2FA | speakeasy (TOTP) |
| Password hashing | bcrypt |
| Cache / Sessions | Redis |
| Database | PostgreSQL 15 |
| DB inspection (dev) | Adminer |
| Reverse proxy / TLS | NGINX |
| WAF | ModSecurity + OWASP CRS |
| Secrets management | HashiCorp Vault (AppRole auth) |
| Containerization | Docker & Docker Compose |
| Realtime (server) | @nestjs/websockets |
| Realtime (client) | Socket.IO |

---

## Features

### Core Web App
- Full-stack SPA: React frontend + NestJS backend
- All API endpoints exposed under `/api/*` behind NGINX reverse proxy
- Session management via secure HTTP-only cookies (access + refresh tokens)
- Route guards: private routes and public-only routes on the frontend
- Global **Day / Night mode** theme switch across the entire app (including chessboard and UI components)
- Dockerized environments for local dev and production

### Authentication & Security
- Registration: pseudo + email + password
- Login: email or pseudo + password
- Google OAuth 2.0 (login and signup)
- JWT access token + refresh token lifecycle with dedicated refresh endpoint
- Refresh tokens validated via Redis
- Logout: cookie cleanup + refresh token invalidation
- Google token revocation on logout or account deletion
- Password hashing with bcrypt
- **2FA (TOTP):** activation, login challenge, and secure disable flow (password + OTP required)
- 2FA anti-bruteforce: failed-attempt counters + temporary lockout in Redis
- Google users cannot enable local 2FA

### User Profile & Account Management
- Fetch current authenticated user (`/users/me`)
- Profile update: pseudo, email, password, avatar URL (restrictions apply to Google users)
- Uniqueness checks on pseudo and email
- Account deletion with cleanup of participations and friendships
- Frontend profile page with full edit + deletion confirmation flow

### Social / Friendship
- Send, accept, and remove friend requests
- List friends + pending incoming requests
- Search users by partial username
- Guardrails: no self-friendship, no duplicate relations

### Chess Game
- Create a lobby: choose color (white/black) and game mode
- Join a pending lobby by game ID or from the quick-join list
- Cancel pending lobbies
- Game starts automatically when both players are present
- Full result persistence: win/draw + move counts
- Give-up/resign with persisted outcome

### Realtime Multiplayer (WebSocket)
- Dedicated `/game` namespace (Socket.IO)
- Cookie-authenticated WebSocket handshake
- Real-time move broadcast between players
- State snapshot sync (`sync_request` / `sync_state`)
- Join/disconnect and game-over events
- In-memory game state relay on the gateway

### Chess Gameplay (Frontend)
- Full chessboard rendering with legal move validation:
  - check / checkmate detection
  - castling, en passant, pawn promotion
- Move history display
- Turn enforcement by assigned side (online mode)
- Time controls: Classic (no clock), Blitz, Bullet
- Confirm modals for restart / give-up / cancel

### Chat (Direct Messages)
- Dedicated `/chat` namespace (Socket.IO)
- Friend-based peer selection
- Private DM rooms
- Realtime send/receive
- Per-room message history

### Dashboard, Stats & Ranking
- Stats per user: wins/losses/draws, total games, winrate, favorite color/mode, current and longest winstreak, recent match history
- Weekly cumulative winrate (UTC week timeline)
- Leaderboard ranked by number of wins
- Dashboard widgets: stats cards, leaderboard, recent matches, ELO graph

### Additional Game Mode
- Tic-Tac-Toe vs bot (on the Puzzle page)
- Two AI difficulty levels: `easy` and `hard`
- Score tracking: player / bot / draws

### Data & Persistence
- PostgreSQL relational model: players, games, participations, friendships
- Drizzle ORM schema + migrations
- One-active-pending-game-per-player enforced at DB level (partial unique index)

### Security & DevSecOps
- NGINX: HTTPS termination + HTTP → HTTPS redirect
- WAF: ModSecurity + OWASP CRS
- HashiCorp Vault: secrets loaded at backend bootstrap via AppRole
- Vault transit key for 2FA secret encryption/decryption
- Docker secrets for sensitive runtime values
- Redis password protected

### Compliance
- Privacy Policy page
- Terms of Service page

---

## Database Schema

### Entity Relationship Diagram

![ERD](./documentation/erd.png)

### Business Rules

- A player can participate in one game at a time, but multiple games over their lifetime.
- A player is either black or white in a given game.
- A game requires one or two unique players.
- Game result is either a win or a draw (no draw without both players drawing).
- Friendship is symmetrical and non-reflexive.
- Every new player gets a default avatar (can be changed later).
- A password is required for all users except Google accounts.
- 2FA is available for all users except Google accounts.
- Every game has a creation date; started and completed dates are recorded unless cancelled.
- The user sending a friendship request must be part of the relation.

### Relational Schema

![RS](./documentation/rel_schema.png)

> Primary key IDs are auto-incrementing. Player stats are computed by querying the Participation and Game tables.

---

## Modules & Points

**Web**

| Module | Points |
|---|---|
| Frontend + backend frameworks (React, NestJS) | 2 |
| Real-time features (WebSockets) | 2 |
| User interactions (social/friendship) | 2 |
| ORM (Drizzle) | 1 |

**User Management**

| Module | Points |
|---|---|
| Standard user management & auth | 2 |
| Game statistics & match history | 2 |
| OAuth 2.0 (Google) | 1 |
| 2FA | 1 |

**Artificial Intelligence**

| Module | Points |
|---|---|
| AI opponent (Tic-Tac-Toe bot) | 2 |

**Cybersecurity**

| Module | Points |
|---|---|
| WAF/ModSecurity + HashiCorp Vault | 2 |

**Gaming & User Experience**

| Module | Points |
|---|---|
| Complete web-based chess game | 2 |
| Remote multiplayer (real-time) | 2 |
| Game customization options | 1 |
| Gamification system | 1 |

| | |
|---|---|
| **Subtotal (mandatory modules)** | **23** |

---

**Custom Modules**

| Module | Points |
|---|---|
| Global Day/Night mode *(Major)* | 2 |
| Dashboard — stats, leaderboard, graph *(Minor)* | 1 |

| | |
|---|---|
| **Subtotal (custom modules)** | **3** |
| **Grand Total** | **26** |

### Custom Module Details

**Global Day/Night Mode** — Major (2 pts)  
Chosen for accessibility and long-session comfort. Technically challenging because it requires centralized theme state, consistent color tokens across all pages and components, chessboard contrast adaptation, and no visual regressions in realtime screens. It impacts the entire frontend architecture (layout, pages, chess UI, components, interaction states) rather than being an isolated feature.

**Dashboard** — Minor (1 pt)  
Chosen for player engagement and retention. Requires multi-source stat aggregation, UTC week timeline calculations, efficient leaderboard queries, and real-time winrate computation. Primarily a UI/query aggregation feature without major cross-cutting architectural impact.

---

## Team

### Daryl — Tech Lead (Frontend Lead, DevOps coordination)
Daryl led the entire frontend of Chess War, from architecture to pixel-level polish. He designed and built every page of the application — login, signup, dashboard, profile, friends, game, tournament, chat — along with all their associated logic: form validation, route guards (public/private routes), auth context and hook (`useAuth`), token lifecycle handling, and API integration against the NestJS backend.

He implemented a clean separation of concerns across the frontend, with reusable components (`Header`, `SideBar`, `Search`, `StatsCards`, `EloGraph`, `LastMatches`, `LeaderBoard`, `Achievement`, `TournamentHistory`, `DailyPuzzle`), typed API calls, and custom hooks (`useFriends`). The sidebar navigation, profile editing flow (including 2FA QR activation and removal), friend search with debounce, and account deletion confirmation modal were all built and polished by him.

On the infrastructure side, Daryl set up the GitHub repository and put in place a CI pipeline using GitHub Actions for linting and build validation, along with Husky pre-commit hooks to enforce code quality standards across the team. He also handled the Docker containerization of the frontend service and contributed to the overall `docker-compose` orchestration alongside the team.

---

### Aïcha — Product Owner (Data Engineer, Backend Lead, Security contributor)
Aïcha was in charge of the database design and management, Drizzle ORM and Redis cache implementation, backend microservice-based architecture, authentication features (including token lifecycle and Google OAuth), and game-related backend and WebSocket integration.

---

### Kalvin — Project Management (Security/Infra Lead, Backend contributor)
Kalvin was responsible for backend hardening: WAF, ModSecurity, Vault integration for secrets management, 2FA authentication feature, password hashing and salt. He also worked on users and friendship-related backend and WebSocket integration.

---

### Ylan — Developer (Gameplay Developer, Frontend contributor)
Ylan took care of the chess gameplay implementation (frontend algorithm and rendering), and the frontend rendering of lobby creation and matchmaking interfaces.

---

> **Note:** Everyone took part in the testing phases and code reviews. Meetings were held on school premises at least once a week (up to three times) for code review, testing, issue identification, and task distribution. GitHub Issues and Discord were used for project management and communication.

---

## Resources

- General: Stack Overflow, Reddit
- Vault: YouTube — "Devoteam A Cloud France"
- Bcrypt: npmjs.com
- OWASP ModSecurity: hub.docker.com
- speakeasy 2FA: npmjs.com
- React (frontend): openClassroom, Scrimba, YouTube, react.dev
- Docker / Docker Compose: 42 Inception project, peer learning
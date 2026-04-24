This project has been created as part of the 42 curriculum by aistierl, daavril, kcharbon, ychattou

# DESCRIPTION

**Chess War** is a real-time multiplayer gaming platform that combines multiple interactive experiences into a single application: chess and chat. The objective is to deliver a seamless, competitive, and social experience with instant player-to-player communication powered by WebSocket technology.

Beyond core gameplay features, the project prioritizes security and infrastructure robustness. Application secrets are centralized and managed through HashiCorp Vault, while a Web Application Firewall (WAF) protects the application against malicious requests. This approach harmonizes product logic (live gaming) with DevSecOps best practices (secure secret management, traffic filtering, service isolation).

The architecture relies on a modern and comprehensive technology stack: NestJS backend, React frontend, PostgreSQL for data persistence, Redis for real-time performance, WebSocket communication for live interactions, and Docker orchestration for reproducible deployment across development and production environments.

# INSTRUCTION

    Pour lancer le projet taper: "docker compose up", à la racine du projet.
    /!\ bien charger le dossier "secrets" pour docker compose /!\
    /!\ compléter le .env en affectant des valeurs aux variables d'environnement /!\

    Ouvrir un navigateur internet puis se rendre sur localhost

    Une interface de connexion devrait s'afficher, si vous n'avez pas de compte cliquer sur "Créer un compte", vous aurez le choix entre une inscription classique ou passer par google. Une fois que votre compte est créé vous allez être redirigé sur la page de connexion.

    Une fois connecté la page du dashboard s'affiche avec toutes les stats etc... Vous pourrez jouer aux échecs en local, en ligne avec plusieurs modes de jeu... Ou au morpion! Vous pourrez également ajouter des amis et leur envoyer des messages

    Pour fermer le projet la commande à taper est: "docker compose down", toujours à la racine du projet

# RESSOURCES

    Général: Stackoverflow, Reddit
    - Vault : la série de vidéo yt de la chaine "Devoteam A Cloud France", 
    - Bcrypt: npmjs.com
    - owasp/modsecurity: hub.docker.com
    - speakeasy 2FA: npmjs.com

# TEAM INFORMATION

## Daryl:
- Roles: Tech Lead (Frontend Lead, DevOps coordination)
- Responsibilities: ////////////////////////////////

## Aïcha:
- Roles: Product Owner (Data engineer, Backend Lead, Security contributor)
- Responsibilities: Product direction and backlog prioritization, database design and data quality ownership, backend architecture and API coordination, and security support for authentication/token lifecycle and secret management.

## Kalvin:
- Roles: Project Management (Security/Infra Lead, Backend contributor)
- Responsibilities: Project coordination and delivery follow-up, security and infrastructure hardening (WAF/ModSecurity, Vault integration), 2FA feature implementation, and backend ownership of users/friendship flows.

## Ylan:
- Roles: Developper (Gameplay Developer, Frontend contributor)
- Responsibilities: Core chess gameplay implementation (rules, algorithm, board rendering), frontend development of room creation and matchmaking interfaces, and gameplay-focused UI integration.

# Project Management:

Meetings were hosted on school premises at least once a week, up to three times, for code review, testing, identifying issues and distributing tasks based on feedbacks.
GitHub Issues and Discord were used respectively for project management and communication.

# Technical Stack:

**Languages & Core Frameworks:**
- Language: Full-stack JavaScript/TypeScript
- Backend: NestJS
- Frontend: React

**Development & Execution:**
- Frontend dev server: Vite
- Backend runtime: Node.js

**Backend Dependencies:**
- ORM: Drizzle with migrations
- Authentication: Passport.js (local, JWT, Google OAuth, JWT-refresh strategies)
- 2FA: speakeasy (TOTP-based)
- Password hashing: bcrypt
- Caching & Session store: Redis

**Database:**
- PostgreSQL 15 (relational model with strong constraints and Drizzle ORM integration)
- Development inspection: Adminer

**Infrastructure & Security:**
- Reverse proxy & SSL/TLS: NGINX
- Web Application Firewall: ModSecurity with OWASP CRS
- Secrets management: HashiCorp Vault with AppRole authentication
- Containerization: Docker & Docker Compose (dev + prod environments)

**Realtime Communication:**
- Backend WebSocket: @nestjs/websockets
- Client WebSocket: Socket.IO

# Database Schema:

## ENTITY RRELATIONSHIP DIAGRAM
    
![ERD](./documentation/erd.png)

Business rules :
- A player can participate at one game at a time, but multiple games in its lifetime.
- A player can either be black or white for a game.
- A game exists only if it has one or two unique players.
- Game ends in a victory or a draw.
- If game result is a draw, player result must be a draw for both players tied to this game.
- Friendship is symetrical and non reflexive.
- Every new player has a avatar picture by default that can be changed later on.
- A password is required for every new user, except those registered with a google account.
- Every user can activate 2FA option, except those registered with a google account.
- All game have a creation date, and if not cancelled, a start date and end date.
- User sending a friendship request must be part of the relationship.

Cardinality :
- PLAYER <- PARTICIPATION -> GAME : ratio M:N
A player play one game at a time but the database records multiple games for one player over time.
- PLAYER <- FRIENDSHIP -> : ratio M:N
A player can befriend with multiple players, and a friend can befriend multiple players too.

Domain constraints :
- player(1,2)_id : unique number.
- mail_address : unique string in valid mail format.
- player_name : unique string made of alphanumerical characters.
- password : string in valid password format (alphanumerical characters with at least one number and one special character), hashed.
- player_creation_date: Date / whole numbers in YYYY-MM-DD HH-MM-SS format.
- avatar : picture in url format.
- google_user: boolean.
- 2FA: boolean.
- 2FA_secret: unique string.
- participation_id: unique number.
- player_result : {« PENDING », « WIN», « LOSS », « DRAW »}
- player_color : {« BLACK », « WHITE »}
- friendship_id : unique number.
- requester_id: unique number.
- friendship_status : {« PENDING », « ADDED »}
- game_id : unique number.
- game_result : {« PENDING », « WIN », « DRAW »}
- game_status : {« PENDING », « ONGOING », « FINISHED »}
- game_mode: {« CLASSIC », « BLITZ », « BULLET »} 
- game_created_at : Date / whole numbers in YYYY-MM-DD HH-MM-SS format.
- game_started_at : Date / whole numbers in YYYY-MM-DD HH-MM-SS format.
- game_completed_at : Date / whole numbers in YYYY-MM-DD HH-MM-SS format.
- total_nb_moves : total number of moves done by both players during the game.
- winner_nb_moves: number of moves done by winner during the game.

## RELATIONAL SCHEMA

![RS](./documentation/rel_schema.png)

Datatypes :
- player(1,2)_id : INT
- player_name : VARCHAR(n)
- mail_adress : VARCHAR(n)
- password : VARCHAR(n)
- player_creation_date: DATE
- google_user: BOOL
- 2FA: BOOL
- 2FA_secret: VARCHAR(n)
- avatar_url : VARCHAR(n)
- participation_id: INT
- player_result : ENUM
- player_color : ENUM
- friendship_id : INT
- friendship_status : ENUM
- requester_id: INT
- game_id : INT
- game_result : ENUM
- game_status : ENUM
- game_mode: ENUM
- game_created_at : DATE
- game_started_at : DATE
- game_completed_at : DATE
- total_nb_moves : INT
- winner_nb_moves: INT

Notes : 
Primary keys IDs are auto-incrementing. Stats for each player are calculated by querying Participation and Game tables.

# Features List:

## Core Web App

- Full-stack web application with React frontend + NestJS backend.
- API exposed under `/api/*` behind NGINX reverse proxy.
- Session handling through secure HTTP-only cookies for access and refresh tokens.
- Protected/private routes and public-only routes on the frontend (route guards).
- Global Day mode / Night mode theme switch across the full webapp, with light-to-dark color adaptation for every screen including the chessboard and UI components.
- Dockerized local/dev and prod-like environments.

## Authentication & Account Security

- Classic registration with pseudo + email + password.
- Login with either email or pseudo + password.
- Google OAuth 2.0 authentication (login and signup through Google account).
- JWT access token + refresh token lifecycle with dedicated refresh endpoint.
- Token refresh backed by Redis-stored refresh token validation.
- Logout flow with cookie cleanup and refresh token invalidation.
- Google token revocation on logout/account deletion when applicable.
- Password hashing with bcrypt (configurable salt rounds).
- 2FA activation flow with TOTP secret generation.
- 2FA challenge at login when enabled.
- 2FA disable flow requiring password + valid OTP code.
- 2FA anti-bruteforce protection (failed-attempt counters + temporary lockout in Redis).
- Restriction: Google users cannot enable local 2FA in current implementation.

## User Profile & Account Management

- Get current authenticated user profile (`/users/me`).
- Profile update: pseudo, email (non-Google users), password (non-Google users), avatar URL.
- Uniqueness checks on pseudo and email during profile updates.
- Account deletion endpoint with cleanup of related participations/friendships.
- Frontend profile page with editable account fields and account deletion confirmation flow.

## Friendship / Social Graph

- Send friend requests.
- Accept incoming friend requests.
- Remove existing friendships.
- List existing friends + pending incoming requests.
- Search users by partial username for adding friends.
- Guardrails: no self-friendship, no duplicate friendship relation, requester must belong to relation.

## Chess Game Features

- Create a game lobby with chosen color (white/black) and mode.
- Join a pending game lobby by game ID.
- Browse and join pending games list from the UI (quick join).
- Cancel pending game lobbies.
- Start game automatically when second player joins.
- Complete game with result persistence (win/draw + move counts).
- Give-up/resign flow with persisted outcome.
- Retrieve game session context (player color, game status, mode).

## Realtime Multiplayer (WebSocket)

- Dedicated game namespace (`/game`) using Socket.IO.
- Cookie-authenticated websocket handshake.
- Real-time move broadcast between players.
- Snapshot synchronization (`sync_request` / `sync_state`) for state recovery.
- Player join/disconnect events.
- Realtime game over / game cancelled events.
- In-memory state relay for active games on gateway side.

## Chess Gameplay UX (Frontend)

- Full chessboard rendering with piece movement rules.
- Legal move validation including:
    - check/checkmate detection,
    - castling,
    - en passant,
    - pawn promotion.
- Move history generation and display.
- Online turn enforcement by assigned side.
- Time controls:
    - Normal (no clock),
    - Blitz,
    - Bullet.
- Online status/error feedback in game UI.
- Confirm modals for restart / giveup / cancel actions.

## Chat (Realtime Direct Messages)

- Dedicated chat namespace (`/chat`) using Socket.IO.
- Friend-based peer selection in UI.
- Join private DM room between two users.
- Send and receive realtime direct messages.
- Per-room message history persists in environment.

## Dashboard, Stats & Ranking

- User stats endpoint with:
    - win/loss/draw counts,
    - total games,
    - computed winrate,
    - favorite color,
    - favorite game mode,
    - current and longest winstreak,
    - recent match history.
- Weekly cumulative winrate endpoint (UTC week timeline).
- Leaderboard endpoint ranked by number of wins.
- Dashboard widgets/components for stats cards, leaderboard, recent matches, and graph.

## Additional Play Mode

- Puzzle page includes a playable Tic-Tac-Toe mode versus bot.
- Two AI difficulty levels for Tic-Tac-Toe (`easy` and `hard`).
- Score tracking (player/bot/draws) and mode switching.

## Data & Persistence

- PostgreSQL relational model for players, games, participations, and friendships.
- Drizzle ORM schema + migrations for DB lifecycle.
- Strong relational constraints and business-rule checks at schema level.
- One-active-pending-game-per-player DB-level guard via partial unique index.

## Security & DevSecOps

- NGINX reverse proxy with HTTPS termination and HTTP->HTTPS redirection.
- WAF integration with ModSecurity/OWASP CRS container image.
- HashiCorp Vault service integrated into stack.
- App secrets loaded from Vault at backend bootstrap via AppRole auth.
- Dedicated Vault transit key for 2FA secret encryption/decryption.
- Docker secrets wiring for sensitive runtime values.
- Redis password protection.

## Compliance & Product Pages

- Privacy Policy page.
- Terms of Service page.

# Modules:

## Web: 
- Use a frontend and backend framework (React, NestJs) | 2 points
- Implement real-time features using WebSockets | 2 points
- Allow users to interact with other users | 2 points
- Use an ORM for the database | 1 point

## User Management:
- Standard user management and authentication | 2 points
- Game statistics and match history | 2 points
- Implement remote authentication with OAuth 2.0 | 1 point
- Implement a complete 2FA | 1 point - safety measure

## Artificial Intelligence:
- Introduce an AI Opponent for games | 2 points

## Cybersecurity:
- Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets | 2 points

## Gaming and user experience:
- Implement a complete web-based game where users can play against each other | 2 points
- Remote players — Enable two players on separate computers to play the same game in real-time | 2 points
- Game customization options -  Customizable game setting and Default options must be available  | 1 point
- System de gamification - A gamification system to reward users for their actions. | 1 point

## Custom modules:
- Global Day mode / Night mode theme switch across the full webapp, with light-to-dark color adaptation for every screen including the chessboard and UI components | 2 points
    ∗ Why you chose this module: Accessibility and comfort. Players use the app for long sessions, and a global theme toggle improves readability in both bright and low-light environments.
    ∗ What technical challenges it addresses: Centralized theme state management, consistent color tokens across all pages/components, board square and piece contrast adaptation, and avoiding visual regressions in realtime game/chat screens.
    ∗ How it adds value to your project: Better UX and personalization, stronger visual coherence of the product, and improved perceived quality beyond a basic mandatory implementation.
    ∗ Why it deserves Major module status: It impacts the entire frontend architecture (layout, pages, chess UI, components, and interaction states), requiring cross-cutting design and engineering work rather than a single isolated feature.
- Dashboard for player stats, leaderboard, recent matches, and  weekly winrate graph | 1 point
    ∗ Why you chose this module: Player engagement and retention through transparent performance metrics. A dashboard provides immediate visibility into achievements and progress, motivating continued play.
    ∗ What technical challenges it addresses: Multi-source stat aggregation (games, participations, rankings), weekly calculation logic with UTC timezone handling, efficient leaderboard query performance at scale, and real-time winrate computation.
    ∗ How it adds value to your project: Transforms raw game data into actionable insights for players, creates competitive context through leaderboard, and enables data-driven player retention strategies.
    ∗ Why it deserves Minor module status: While important for UX, it is primarily a UI/query aggregation feature without cross-cutting architectural impact or complex algorithmic challenges beyond standard ORM queries and data visualization.

26 points total

# Individual Contributions:

- Kalvin was responsible of the backend hardening: WAF, firewall with ModSecurity, Vault integration for secrets management, 2FA authentication feature, password hashing and salt. He also worked on users and friendship-related backend and websocket integration.
- Aicha was in charge of the database design and management, Drizzle ORM and Redis cache implementation, backend microservice-based architecture, authentication features (including token lifecycle and Google OAuth) and game-related backend and websocket integration.
- Daryl /////////////////////////////
- Ylan took care of the chess gameplay implementation (frontend algorithm and rendering), frontend rendering of lobby creation and matchmaking interfaces.
Everyone took part in the testing phases and code reviews.

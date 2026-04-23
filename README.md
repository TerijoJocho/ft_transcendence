This project has been created as part of the 42 curriculum by aistirl(Product Owner), daavril(Tech Lead), kcharbon(Project Manager), ychattou(Developer)

# DESCRIPTION

    Chess War:
        
        Plateforme de jeu multijoueur en temps réel, ce projet réunit plusieurs expériences interactives dans une seule application: un jeu d’échecs, un morpion et un chat live. L’objectif est de proposer une expérience fluide, compétitive et sociale, avec des échanges instantanés entre joueurs grâce au WebSocket.

        Au-delà des fonctionnalités de jeu, le projet met un fort accent sur la sécurité et la robustesse de l’infrastructure. Les secrets applicatifs sont centralisés et gérés via Vault, tandis qu’un WAF protège l’application en amont contre les requêtes malveillantes. Cette approche permet de combiner logique produit (jeu en direct) et bonnes pratiques DevSecOps (gestion sécurisée des secrets, filtrage du trafic, isolation des services).

        L’architecture repose sur une stack moderne et complète: backend NestJS, frontend React, PostgreSQL pour la persistance, Redis pour la performance temps réel, communication WebSocket pour les interactions live, et orchestration Docker pour un déploiement reproductible en développement comme en intégration.

# INSTRUCTION

    Pour lancer le projet taper: "docker compose up", à la racine du projet.
    /!\ bien charger le dossier "secrets" pour docker compose /!\

    Ouvrir un navigateur internet puis se rendre sur localhost

    Une interface de connexion devrait s'afficher, si vous n'avez pas de compte cliquer sur "Créer un compte", vous aurez le choix entre une inscription classique ou passer par google. Une fois que votre compte est créé vous allez être redirigé sur la page de connexion.

    Une fois connecté la page du dashboard s'affiche avec toutes les stats etc... Vous pourrez jouer aux échecs en local, en ligne avec plusieurs modes de jeu... Ou au morpion! Vous pourrez également ajouter des amis et leur envoyer des messages

    pour fermer le projet la commande à taper est: "docker compose down", toujours à la racine du projet

# RESSOURCES

    - Vault : la série de vidéo yt de la chaine "Devoteam A Cloud France", 
    - Bcrypt: npmjs.com
    - owasp/modsecurity: hub.docker.com
    - speakeasy 2FA: npmjs.com

# TEAM INFORMATION

### Daryl:
- Roles: Tech Lead, Frontend Lead, DevOps coordination
- Responsibilities: Frontend architecture/integration, UX flows, deployment orchestration, team coordination

### Aïcha:
- Roles: Product Owner, Backend Lead, Security contributor
- Responsibilities: Auth architecture, token lifecycle, game backend integration

### Kalvin:
- Roles: Project Management, Security/Infra Engineer, Backend contributor
- Responsibilities: WAF/ModSecurity, Vault integration, user/friendship/signin backend integration, backend hardening

### Ylan:
- Roles: Gameplay Developer
- Responsibilities: Chess logic/gameplay foundation and game behavior integration

# Technical Stack:
    Stack full JavaScript (backend en NestJS et frontend en React)
    PostgreSQL pour la base de donée
    Drizzle pour l'ORM
    Docker/Docker-compose pour le deploiement

# Database Schema:
    Tables:
        - players (infos compte, auth, 2FA, avatar)
        - games (statut, mode, timestamps, resultat)
        - participation (liaison player <-> game, couleur, resultat joueur)
        - friendship (relation entre 2 joueurs, requester, statut)
        - participation (table de liaison entre players et games, avec couleur et resultat du joueur)

# Features List:

# Modules:
    WEB: 
        - Use a frontend framework (React, NestJs) | 2points
        - Implement real-time features using WebSockets | 2 points - pour pouvoir jouer en ligne, chat en direct..
        - Allow users to interact with other users | 2 points
        - A public API to interact with the database.. | 2 points
        - Use an ORM for the database | 1 point - pour facilité les appel db

    User Management:
        - Standard user management and authentication | 2 points
        - Game statistics and match history | 2 points
        - Implement remote authentication with OAuth 2.0 | 1 point
        - Implement a complete 2FA | 1 point - pour le coté sécurité

    Artificial Intelligence:
        - Introduce an AI Opponent for games | 2 points

    Cybersecurity:
        - Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets - 2 points - pour le coté sécurité

    Gaming and user experience:
        -  Implement a complete web-based game where users can play against each other | 2 points

        - Remote players — Enable two players on separate computers to play the same game in real-time | 2 points **!! a voir reconnexion parti!!**

        - Game customization options -  Customizable game setting and Default options must be available  | 1 point **!! a voir !!**
    
    26 points totals
# Individual Contributions:

    Kalvin a implementé les modules Friendship, Users, signin avec des methodes CRUD, mis en place un par feu via MODSECURITY, centralisé les secrets via Vault, une methode de connexion 2FA via topt, cyptage des passwords avec bcrypt

# 🤝 Guide de Contribution - ft_transcendence

Bienvenue dans l'équipe de développement !
Ce document détaille comment installer l'environnement de travail, les règles à respecter et comment nous allons collaborer pour réussir ce projet.

> **⚠️ Règle d'or :** Ne jamais push directement sur la branche `main`. Tout passe par une Pull Request (PR).

---

## 🛠 1. Prérequis Techniques

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine (ou session 42) :

- **Docker & Docker Compose** (pour lancer l'infrastructure)
- **Git** (configuré avec vos identifiants)
- **Node.js** (**version 20 minimum**, gérée via `nvm`)

---

### 📦 Installation de NVM (Node Version Manager)

Nous utilisons **nvm** pour garantir que toute l’équipe utilise exactement la même version de Node.js et éviter les bugs de compatibilité.

#### 1. Vérifier si nvm est déjà installé
Ouvrez un terminal et lancez :
```bash
nvm --version
```
Si la commande n'est pas reconnue (command not found), suivez les instructions ci-dessous selon votre système.

---

#### 🍎 macOS (Méthode recommandée avec Homebrew)

1.  **Installer Homebrew** (si ce n'est pas déjà fait) :
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2.  **Installer nvm** :
    ```bash
    brew install nvm
    ```

3.  **Créer le dossier nvm** :
    ```bash
    mkdir ~/.nvm
    ```

4.  **Ajouter la configuration à votre shell** :
    Ouvrez votre fichier de configuration (selon votre shell) :

    *   Pour **zsh** (par défaut sur macOS) :
        ```bash
        nano ~/.zshrc
        ```
    *   Pour **bash** :
        ```bash
        nano ~/.bashrc
        ```

    Ajoutez ces lignes à la fin du fichier :
    ```bash
    export NVM_DIR="$HOME/.nvm"
    source "$(brew --prefix nvm)/nvm.sh"
    ```
    *Sauvegardez avec `Ctrl + O` (Entrée) puis quittez avec `Ctrl + X`.*

5.  **Recharger le shell** :
    ```bash
    source ~/.zshrc
    # ou
    source ~/.bashrc
    ```

6.  **Vérifier l’installation** :
    ```bash
    nvm --version
    ```

---

#### 🪟 Windows / 🐧 Linux (WSL recommandé)

> ⚠️ **Attention :** Sur Windows, l’utilisation de **WSL (Ubuntu)** est fortement recommandée pour ce projet. N'utilisez pas l'invite de commande Windows classique.

1.  **Installer nvm via le script officiel** :
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```

2.  **Recharger le shell** :
    ```bash
    source ~/.bashrc
    # ou
    source ~/.zshrc
    ```

3.  **Vérifier l’installation** :
    ```bash
    nvm --version
    ```

---

#### 📌 2. Installer la version Node du projet

Une fois nvm installé, placez-vous à la racine du repository et lancez :

```bash
# Installe la version LTS actuelle (v20)
nvm install

# Active cette version
nvm use
```

**Vérification finale :**
```bash
node -v
```
✅ La version affichée doit être **v20.x**.

---

## 🚀 2. Installation & Premier Lancement

Suivez ces étapes scrupuleusement pour avoir un environnement fonctionnel.

### Étape 1 : Cloner le projet
```bash
git clone <URL_DU_REPO>
cd ft_transcendence
```

### Etape 2: Configration des variables d'environnement
```bash
	cp .env.example .env
```
(On modifiera ce fichier plus tard quand on aura des clés API 42, pour l'instant les valeurs par défaut suffisent).

### Etape 3: Installation des dependances locales (pour l'IDE)
<!-- A la racine (pour husky) -->
npm install

<!-- Pour le backend -->
```bash
	cd backend && npm install && cd ..
```

<!-- Pour le frontend -->
```bash
	cd frontend && npm install && cd ..
```

### Etape 4: Lancer la stack avec Docker
```bash
	docker compose up --build
```
*	**L'application est accessible ici:**
	🎨 Frontend : http://localhost:5173
	⚙️ Backend API : http://localhost:3000


🆘 En cas de problème

    Erreur "Bind address already in use" : Tu as déjà un Redis ou un Postgres qui tourne. Coupe-le ou fais docker compose down.

    Erreur "Permission denied" : sudo chown -R $USER:$USER .
	
---

## 3. Workflow Git & Collaboration

Nous utiliserons le GitHub Flow simplifie.

### Creer une nouvelle fonctionnalite
1. Partez toujours de **main** a jour:
```bash
	git checkout main
	git pull origin main
```

2. Creez votre branche avec un nom explicite:
```bash
	git checkout -b feat/chat-websocket
	git checkout -b fix/login-bug
```

3. Nous utilisons Husky et Commitlint, vos messages de commit doivent suivre la convention: **type(scope): description**
Exemple:
    feat: add user profile page (Nouvelle feature)

    fix: resolve websocket disconnect issue (Correction de bug)

    chore: update npm dependencies (Maintenance)

    docs: update readme (Documentation)

    style: format css (Changement qui ne modifie pas la logique)

🛑 Husky bloquera votre commit si le message est mal formaté ou si le linter trouve des erreurs.

4. Soumettre son travail (Pull Request)
	- Poussez votre branche : git push origin feat/ma-feature
    - Allez sur GitHub et ouvrez une Pull Request (PR) vers main, elle doit etre petite, ciblee et liee a une seule fonctionnalite ou correction.
	- Demandez une Review à un/deux collègue(s).
	- Une fois validé (Approve), le merge peut être fait.

---

## 4. Gestion des packages (NPM)

*	Pour le backend
```bash
	cd backend
	npm install <nom_du_packet>
```

*	Pour le frontend
```bash
	cd frontend
	npm install <nom_du_packet>
```
⚠️ Important : Si vous ajoutez un paquet, prévenez l'équipe qu'ils devront refaire un docker compose build ou un npm install chez eux.

---

## 5. Architecture & Convention de Code
1. Structure du Monorepo
	* /frontend : Application React + Vite.
		- /src/components : Composants réutilisables.
		- /src/pages : Pages complètes (Route views).
		- /src/hooks : Custom hooks.

	* /backend : Application NestJS.
		- /src/users : Module Users (Controller + Service).
		- /src/auth : Module d'Authentification.
		- Utilisez la CLI Nest pour générer des fichiers : **nest g resource users**.

2. Regles de Code (Linting)
	* TypeScript Strict : Pas de any. Typage fort obligatoire.
	* Promesses : Toute promesse doit être gérée (await, .then, .catch).
	* Formatage : Prettier est configuré. Configurez votre VSCode pour "Format On Save".

---

# 🏗 Résumé de l'Architecture & du Workflow (Tech Lead Report)

Nous avons mis en place un environnement de développement **professionnel**, inspiré des standards de l'industrie (CI/CD, Monorepo, Type Safety). L'objectif est de garantir la robustesse du code et de faciliter la collaboration à 5 développeurs.

## 1. Architecture du Code (Le Squelette)

### 📂 Structure Monorepo
*   **Quoi :** Un seul dépôt Git contenant deux dossiers racines : `/frontend` et `/backend`.
*   **Pourquoi :** Simplifie la gestion du projet, le déploiement via Docker Compose, et permet de partager facilement les types (Interfaces TypeScript) entre le client et le serveur.

### 🐳 Conteneurisation (Docker)
*   **Quoi :** Un `docker-compose.yml` orchestre NestJS, React (Vite), PostgreSQL et Redis.
*   **Pourquoi :** "Reproductibilité". Si ça marche sur mon Docker, ça marche sur le tien et sur le VPS. Fini le *"ça marche chez moi"*.

### ⚡️ Stack Full-TypeScript
*   **Quoi :** React (Front) + NestJS (Back) en mode Strict.
*   **Pourquoi :** Cohérence totale. Un seul langage à maîtriser pour l'équipe. Le typage strict évite 80% des bugs "bêtes" (null pointer, undefined) avant même de lancer le code.

---

## 2. Qualité et Automatisation (La "Police" du Code)

Nous avons automatisé les tâches ingrates pour que les développeurs se concentrent sur la logique métier.

### 🛡️ Qualité Locale (Husky & Linting)
*   **Quoi :** Installation de **Husky** (Git Hooks). Avant chaque commit, il lance **ESLint** (qualité du code) et **Prettier** (formatage).
*   **Pourquoi :** Il est physiquement impossible de "commit" du code sale ou qui ne respecte pas les normes. Cela évite les débats inutiles sur le style de code (espaces vs tabulations).

### 📝 Convention des Commits (Commitlint)
*   **Quoi :** Obligation d'écrire des messages clairs : `feat: add chat`, `fix: login bug`.
*   **Pourquoi :** Génère un historique propre et lisible. Essentiel pour savoir "qui a cassé quoi" ou pour générer des changelogs automatiques.

### 🤖 Sécurité des Dépendances (Dependabot)
*   **Quoi :** Robot GitHub qui scanne nos librairies (npm packages).
*   **Pourquoi :** Si une faille de sécurité est découverte dans une librairie, Dependabot crée automatiquement une Pull Request pour la corriger. (Points bonus "Cybersecurity").

---

## 3. Workflow de Collaboration (Les Règles du Jeu)

Pour éviter le chaos d'un travail à 5, nous avons instauré un processus strict.

### 🚫 Protection de la branche `main`
*   **Quoi :** Interdiction totale de pousser du code directement sur `main`.
*   **Pourquoi :** La branche principale doit toujours être stable et déployable. Personne ne peut casser la production par erreur.

### 🤝 Pull Requests & Templates
*   **Quoi :** Utilisation obligatoire des PR avec un modèle pré-rempli (Description, Comment tester, Checklist).
*   **Pourquoi :** Force le développeur à tester son code et à expliquer sa logique. Facilite le travail de relecture pour le Tech Lead.

### 🧪 Intégration Continue (GitHub Actions)
*   **Quoi :** À chaque Pull Request, un serveur GitHub télécharge le code, installe les dépendances et tente de compiler le Front et le Back.
*   **Pourquoi :** C'est le juge impartial. Si Husky a été contourné en local, la CI bloquera la fusion sur GitHub. On ne merge que ce qui compile réellement.

---

## 🎯 Conclusion pour l'équipe

Ce système peut sembler rigide au début, mais il nous offre :
1.  **La sérénité :** On a moins peur de casser le projet.
2.  **La rapidité :** On perd moins de temps à debugger des erreurs de syntaxe.
3.  **L'apprentissage :** On travaille comme dans une vraie startup tech.

**Le projet est prêt. À nous de jouer ! 🚀**
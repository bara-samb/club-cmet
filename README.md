<p align="center">
  <img src="public/images/logo-CMET.jpeg" alt="Logo Club-MET" width="120" style="border-radius: 50%;" />
</p>

<h1 align="center">🎓 Club-MET — Plateforme de Gestion & Rayonnement</h1>

<p align="center">
  <strong>Club des Métiers & Technologies</strong> · UFR MET · Université Cheikh Ahmadoul Khadim (UCAK)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-4.4-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-BaaS-3FCF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0050?logo=framer&logoColor=white" />
</p>

---

## 📋 Sommaire

- [À propos du projet](#-à-propos-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation & Lancement](#-installation--lancement)
- [Variables d'environnement](#-variables-denvironnement)
- [Espaces utilisateurs](#-espaces-utilisateurs)
- [Base de données](#-base-de-données-supabase)
- [Contribution](#-contribution)
- [Équipe](#-équipe)

---

## 📖 À propos du projet

Le **Club-MET** est la structure légale qui regroupe l'ensemble des étudiants de l'UFR **Métiers & Technologies** de l'UCAK. Cette plateforme web a été développée pour :

- **Centraliser** la gestion du club (membres, événements, documents)
- **Faciliter** la communication entre étudiants et bureau exécutif
- **Partager** les ressources académiques (maquettes, règlements, cours)
- **Valoriser** les activités du club à travers une galerie média
- **Assurer** la transparence des actions (bilans financiers, PV d'AG)

### Missions du Club-MET

| Mission | Description |
|---|---|
| 🏆 **Génie en Herbe** | Organisation et suivi des matchs inter-filières |
| 🎉 **Journées d'Intégration** | Accueil et intégration des nouveaux étudiants |
| 🤝 **Actions Sociales** | Aide aux étudiants en difficulté financière ou médicale |
| 🧹 **Actions Communautaires** | Achat de matériels d'hygiène et pédagogiques |
| 📚 **Tutorats** | Sessions d'entraide par les pairs entre étudiants |

---

## ✨ Fonctionnalités

### 🌐 Site Public (`/`)
- Page d'accueil avec présentation du club, missions et valeurs
- Composition du bureau exécutif avec photos et postes
- Section activités & événements avec galerie d'images
- Galerie médias (photos et vidéos) des moments forts
- Règlement intérieur téléchargeable
- Maquettes de formation (IT & HEC) consultables
- Formulaire de contact avec validation côté client
- Design responsive (mobile, tablette, desktop)

### 🎓 Espace Étudiant (`/student/*`)
- **Dashboard** — Vue d'ensemble avec statistiques en temps réel
- **Bibliothèque** — Accès aux maquettes de formation (IT, HEC)
- **Ressources** — Documents et fichiers académiques
- **Messages** — Envoi de messages au bureau du club avec suivi de statut
- **Notifications** — Fil de notifications push du bureau
- **Profil** — Consultation et modification des informations personnelles

### 🔐 Panel Administrateur (`/admin/*`)
- **Panel principal** — Tableau de bord centralisé avec accès rapide
- **Comptes Utilisateurs** — Visualiser, filtrer, changer les rôles, supprimer des comptes
- **Membres du Bureau** — Ajouter/supprimer des membres officiels avec photo
- **Espace Documentaire** — Upload et gestion des ressources (règlements, rapports)
- **Messages de Contact** — Lecture et gestion des messages reçus (avec badge non-lus)
- **Notifications** — Diffusion d'informations à tous les étudiants
- **Événements & Activités** — CRUD complet avec upload d'images multiples
- **Galerie Médias** — Gestion des photos et vidéos

---

## 🛠️ Stack technique

| Catégorie | Technologie | Version |
|---|---|---|
| **Framework UI** | React.js | 18.2 |
| **Bundler** | Vite | 4.4 |
| **Styling** | Tailwind CSS | 3.4 |
| **Animations** | Framer Motion | 12.x |
| **Icônes** | Lucide React | 0.562 |
| **Routing** | React Router DOM | 7.11 |
| **Backend / BDD** | Supabase (Auth, Database, Storage, Realtime) | 2.108 |
| **PDF** | jsPDF + jsPDF-AutoTable | 4.0 / 5.0 |
| **HTTP** | Axios | 1.13 |

---

## 📂 Architecture du projet

```
club-cmet/
├── backend/
│   ├── database/
│   │   └── schema.sql            # Schéma de base de données & RLS
│   └── scripts/                  # Scripts de tests / scripts backend utilitaires
│
├── frontend/
│   ├── public/
│   │   ├── images/               # Images publiques (logo, galerie)
│   │   └── maquettes/            # PDFs de maquettes (fallback)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.jsx    # Layout sidebar admin
│   │   │   │   └── StudentLayout.jsx  # Layout sidebar étudiant
│   │   │   └── ui/
│   │   │       └── NotificationFeed.jsx # Bannière alerte live
│   │   │
│   │   ├── config/
│   │   │   ├── supabaseClient.js # Initialisation client Supabase
│   │   │   └── constants.js      # Constantes partagées (ex: NIVEAUX)
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Contexte Auth
│   │   │   └── AuthProvider.jsx  # Provider d'Auth global
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Hook useAuth()
│   │   │
│   │   ├── services/
│   │   │   └── supabaseService.js # Centralisation CRUD Supabase
│   │   │
│   │   ├── pages/
│   │   │   ├── public/           # Pages publiques (Home, Login, Register)
│   │   │   ├── student/          # Pages espace étudiant
│   │   │   └── admin/            # Pages espace administrateur
│   │   │
│   │   └── App.jsx               # Routeur principal + guards
│   │
│   ├── .env                      # Variables d'environnement
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Un projet **Supabase** configuré (voir section Variables d'environnement)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/bara-samb/club-cmet.git
cd club-cmet

# 2. Se positionner dans le dossier frontend
cd frontend

# 3. Installer les dépendances
npm install

# 4. Configurer les variables d'environnement
#    Créer un fichier .env dans le dossier frontend (voir section ci-dessous)

# 5. Lancer le serveur de développement
npm run dev
#    → L'application est accessible sur http://localhost:5173

# 6. Build de production (optionnel)
npm run build
npm run preview
```

---

## 🔑 Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les clés suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_publique
```

> ⚠️ **Ne commitez jamais** votre fichier `.env`. Il est déjà listé dans `.gitignore`.

---

## 👤 Espaces utilisateurs

L'application possède **3 niveaux d'accès** gérés par des guards de route :

| Espace | Accès | Guard | Routes |
|---|---|---|---|
| **Public** | Tout le monde | Aucun | `/`, `/login`, `/register` |
| **Étudiant** | Utilisateurs connectés | `RequireAuth` | `/student/*` |
| **Administrateur** | Utilisateurs avec `role = "admin"` | `RequireAdmin` | `/admin/*` |

### Flux d'authentification

```
Inscription (/register)
    ↓ Création compte Supabase Auth
    ↓ Insertion dans table `users` (role: "student")
    → Redirection vers /student/dashboard

Connexion (/login)
    ↓ Vérification credentials
    ↓ Lecture du rôle dans table `users`
    → Si admin  → /admin/panel
    → Si student → /student/dashboard
```

---

## 🗄️ Base de données (Supabase)

### Tables principales

| Table | Description | Colonnes clés |
|---|---|---|
| `users` | Comptes utilisateurs | `id`, `nom`, `prenom`, `email`, `niveau`, `role`, `avatar_url` |
| `bureau` | Membres du bureau exécutif | `id`, `nom`, `poste`, `classe`, `imageUrl` |
| `activites` | Événements et activités | `id`, `titre`, `type`, `date`, `description` |
| `ressources` | Documents et fichiers | `id`, `nom`, `url`, `categorie`, `typeDoc` |
| `maquettes` | Maquettes de formation | `id`, `filiere`, `url`, `nom` |
| `medias` | Galerie photos/vidéos | `id`, `url`, `type`, `created_at` |
| `messages` | Messages de contact et étudiants | `id`, `nom`, `email`, `telephone`, `message`, `statut` |
| `notifications` | Notifications push | `id`, `titre`, `contenu`, `created_at` |

### Fonctionnalités Supabase utilisées

- **Auth** — Inscription/connexion email + mot de passe
- **Database** — Tables PostgreSQL avec Row Level Security (RLS)
- **Storage** — Bucket `club-met-storage` pour images et documents
- **Realtime** — Abonnements temps réel sur toutes les tables (postgres_changes)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

```bash
# 1. Créer une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# 2. Effectuer vos modifications et les commiter
git add .
git commit -m "feat: description de votre ajout"

# 3. Pousser vers votre branche
git push origin feature/nom-de-la-fonctionnalite

# 4. Ouvrir une Pull Request sur GitHub
```

### Conventions de commits

| Préfixe | Usage |
|---|---|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation |
| `style:` | Mise en forme (pas de changement de logique) |
| `refactor:` | Restructuration de code |

---

## 👥 Équipe

Développé avec ❤️ par l'équipe technique du **Club Métiers & Technologies** — UFR MET, UCAK.

<p align="center">
  <strong>© 2026 Club-MET · UCAK · Tous droits réservés</strong>
</p>
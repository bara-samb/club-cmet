:

🚀 Club MET - Plateforme de Gestion et de Rayonnement
Bienvenue sur le dépôt officiel du Club des Métiers et Technologies (MET) de l'Université Cheikh Ahmadoul Khadim (UCAK). Cette plateforme est dédiée à la gestion interne du club, à la transparence de ses activités et au partage de ressources académiques.

📋 À propos du projet
Le Club MET a pour vocation d'apporter une expertise technologique et organisationnelle au sein de l'UCAK. Ce projet web permet de :

Gérer les activités : Suivi des événements (Génie en Herbe, etc.) et actions sociales.

Centraliser les ressources : Accès aux maquettes de formation et documents officiels.

Assurer la transparence : Suivi financier rigoureux (Recettes/Dépenses) et bilans des commissions.

Dynamiser la communauté : Galerie média pour valoriser les moments forts du club.

📊 Engagement et Transparence
Le projet reflète l'engagement du Club MET envers ses membres à travers :

Gestion des Commissions : Suivi des activités de la Cellule Organisation (logistique des matchs, hygiène) et de la Commission Sociale (assistance aux étudiants).

Transparence Financière : Enregistrement rigoureux des recettes (cotisations, ventes) et des dépenses (social, matériel, rafraîchissements).

Responsabilité Institutionnelle : Respect du cadre de l'UCAK, incluant la gestion éthique des partenariats et la communication interne.

🛠️ Stack Technique
Frontend : React.js, Vite, Tailwind CSS, Framer Motion, Lucide React.

Backend / Base de données : Supabase (Authentification, Database, Storage).

Déploiement : Vercel / Netlify.

📂 Structure du Projet
Plaintext
src/
├── components/       # Composants UI (Sidebar, Layout, etc.)
├── config/           # Configuration Supabase
├── pages/
│   ├── admin/        # Pages protégées (ManageEvents, ManageMedia)
│   ├── student/        # Pages protégées (ManageEvents, ManageMedia)
│   └── public/       # Page d'accueil et sections publiques
└── assets/           # Ressources (maquettes PDF, images)
🔐 Fonctionnalités Administrateur
L'interface d'administration permet aux membres de la commission de :

Gestion des Événements : Ajouter, modifier ou supprimer des activités avec leurs types et descriptions.

Gestion des Médias : Uploader des photos et vidéos pour la galerie.

Gestion Documentaire : Mise à jour des ressources académiques et rapports d'activité.

🚀 Installation
Cloner le dépôt :
git clone https://github.com/bara-samb/club-cmet.git

Installer les dépendances :
npm install

Configurer les variables d'environnement (.env) avec vos clés Supabase.

Lancer le serveur de développement :
npm run dev

🤝 Contribution
Pour contribuer :

Créez une branche (git checkout -b feature/nom-fonctionnalite).

Commitez vos changements (git commit -m "ajout de...").

Poussez vers la branche (git push origin feature/nom-fonctionnalite).

Ouvrez une Pull Request.

Développé avec ❤️ par l'équipe technique du Club MET - UCAK.
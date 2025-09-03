# Manuel utilisateur – SUPRSS

## 1. Introduction

SUPRSS est une application web permettant de gérer ses flux RSS, de consulter des articles, de créer des collections partagées et de collaborer avec d’autres utilisateurs à travers des commentaires et des messages.

Cette documentation explique comment utiliser les principales fonctionnalités de l’application, aussi bien côté utilisateur individuel que collaboratif.

---

## 2. Accès à l’application

- **URL du frontend (développement)** : http://localhost:5173
- **URL du backend API** : http://localhost:3001/suprss/api
- **Compte requis** : chaque utilisateur doit créer un compte ou se connecter via un fournisseur OAuth (Google, GitHub, Microsoft).

---

## 3. Authentification et gestion du compte

### 3.1 Inscription
- Cliquer sur **Créer un compte**.
- Remplir les informations demandées : prénom, nom, e-mail, mot de passe.
- Un compte est immédiatement créé, l’utilisateur peut se connecter.

### 3.2 Connexion
- Cliquer sur **Connexion**.
- Entrer son e-mail et son mot de passe, ou utiliser un bouton **Connexion avec Google/GitHub/Microsoft**.

### 3.3 Profil utilisateur
- Accéder à **Mon profil** pour modifier ses informations (nom, avatar, préférences de langue ou d’affichage).
- L’option **Mode sombre** est disponible dans les paramètres.

---

## 4. Gestion des flux RSS

### 4.1 Ajouter un flux
- Cliquer sur **Ajouter un flux**.
- Renseigner l’URL du flux RSS.
- (Optionnel) Donner un titre, une description et ajouter des **tags**.
- Choisir une **collection** si le flux doit être partagé.

### 4.2 Consulter les flux
- Accéder à la section **Mes flux**.
- Voir la liste de tous les flux ajoutés avec leur état (actif/inactif).

### 4.3 Gérer un flux
- Modifier ses informations (titre, fréquence de mise à jour).
- Le marquer comme **favori** pour un accès rapide.
- Supprimer le flux si nécessaire.

---

## 5. Articles

### 5.1 Consultation
- Les articles apparaissent automatiquement après ajout d’un flux.
- Chaque article affiche : titre, auteur, date de publication, catégories, résumé ou contenu complet.

### 5.2 Actions disponibles
- **Marquer comme lu / non lu**
- **Ajouter aux favoris**
- **Partager** (via le bouton système ou copie du lien)
- **Ouvrir l’article original** dans un nouvel onglet

### 5.3 Recherche et filtres
- Barre de recherche pour trouver un article par mots-clés.
- Filtres rapides : **tous les articles**, **non lus**, **favoris**.
- Filtres avancés : par flux, par catégories, par date.

---

## 6. Collections collaboratives

### 6.1 Créer une collection
- Cliquer sur **Nouvelle collection**.
- Donner un nom et une description.
- Ajouter des flux dans la collection.

### 6.2 Inviter des membres
- Générer un **code d’invitation**.
- Partager ce code avec d’autres utilisateurs.
- Les membres peuvent rejoindre avec le bouton **Rejoindre une collection**.

### 6.3 Gérer les membres
- L’administrateur peut :
    - Modifier les **permissions** (lecture, écriture, admin).
    - Supprimer un membre.
    - Régénérer le code d’invitation.

---

## 7. Commentaires et messages

### 7.1 Commentaires sur articles
- Chaque article d’une collection possède une section commentaires.
- Les membres peuvent écrire, modifier ou supprimer leurs commentaires.
- Les commentaires s’affichent en temps réel dans l’article.

### 7.2 Messages dans une collection
- Chaque collection dispose d’un espace **messages**.
- Les membres peuvent y publier des notes ou discuter de la gestion des flux.

---

## 8. Interface et ergonomie

- **Mode sombre** disponible.
- **Navigation par menu latéral** : Articles, Flux, Collections, Favoris.
- **Icônes claires** (lecture, favoris, commentaires, partage).
- **Responsive** : l’application fonctionne sur ordinateur, tablette et mobile.

---

## 9. Support et dépannage

- En cas de problème de connexion → vérifier l’URL et les identifiants.
- Si un flux ne s’actualise pas → vérifier l’URL du flux RSS et sa validité.
- Pour réinitialiser son mot de passe → utiliser la procédure **Mot de passe oublié** (si activée).

---

## 10. Fonctionnalités clés résumées

- Authentification sécurisée (e-mail ou OAuth).
- Gestion des flux RSS (ajout, suppression, favoris, tags).
- Consultation et filtrage d’articles (lu, non lu, favoris).
- Création et gestion de collections collaboratives.
- Commentaires et messages pour la collaboration.
- Interface moderne et adaptable.  

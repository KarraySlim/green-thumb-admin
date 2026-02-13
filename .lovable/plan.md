

# React Admin Dashboard — CRUD pour Irrigation Management

## Vue d'ensemble
Application React admin complète avec des pages CRUD pour gérer les entités d'un système d'irrigation. L'app utilisera des données mockées par défaut, avec une architecture prête à se connecter à un backend Ktor REST API.

---

## 1. Layout & Navigation
- **Sidebar** avec menu de navigation : Surfaces, Plantes, Vannes, Types de plante, Clients
- **Header** avec titre de la page active
- Route `/` redirige vers `/admin/surfaces`
- Design épuré, professionnel, style dashboard admin

## 2. Module Clients
- **Liste** : tableau avec email, nom, prénom, rôle, téléphone, localisation
- **Créer** : formulaire avec tous les champs (email, prénom, nom, rôle CLIENT/ADMIN, téléphone, date de naissance, localisation)
- **Supprimer** : bouton avec confirmation dialog
- Route : `/admin/clients`

## 3. Module Types de Plante
- **Liste** : tableau avec nom, type, besoin en eau par plante
- **Créer** : formulaire avec nom_plante, type_plante, besoin_eau_par_plante
- **Supprimer** : avec confirmation
- Route : `/admin/types-plante`

## 4. Module Surfaces
- **Liste** : tableau affichant nom_surface, localisation, nb_vanne, client associé (email), type de sol — jointure affichée
- **Créer** : formulaire avec nom_surface, localisation, sélecteur de client (dropdown)
- **Supprimer** : avec confirmation (cascade sur plantes et vannes)
- Route : `/admin/surfaces`

## 5. Module Plantes
- **Liste** : tableau avec nom_plante, âge, surface associée (nom_surface), type de plante (nom) — jointures affichées
- **Créer** : formulaire avec nom, âge, sélecteur de surface et sélecteur de type de plante (dropdowns)
- **Supprimer** : avec confirmation
- Route : `/admin/plantes`

## 6. Module Vannes
- **Liste** : tableau avec nom_vanne, débit eau, nb plantes par vanne, surface associée (nom_surface) — jointure affichée
- **Créer** : formulaire avec nom, débit, nb_plante_par_vanne, sélecteur de surface
- **Supprimer** : avec confirmation
- Recalcul automatique du nb_vanne de la surface après ajout/suppression
- Route : `/admin/vannes`

## 7. Service Layer & API Ready
- Couche de services avec des fonctions CRUD pour chaque entité
- Données mockées en local (seed de démo : 1 client admin, 1 type plante Olivier, 1 surface, 1 plante, 1 vanne)
- Configuration centralisée de l'URL API pour basculer facilement vers le backend Ktor
- Utilisation de React Query pour la gestion des requêtes

## 8. UX & Feedback
- Notifications toast pour succès/erreurs des opérations CRUD
- Dialogues de confirmation avant suppression
- États de chargement sur les tableaux et formulaires
- Validation des formulaires côté client


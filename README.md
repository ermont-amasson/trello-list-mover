# List Mover — Deux boutons Trello

Le Power-Up ajoute **deux boutons** dans l’en-tête du tableau Trello :

1. **Configurer les listes** : ouvre la fenêtre de configuration, permettant de définir la liste source et destination (et facultativement le nom du bouton d’action).
2. **Déplacer les cartes** : au clic, déplace immédiatement toutes les cartes actives de la source vers la destination, sans formulaire ou confirmation.

Le nom du second bouton peut être personnalisé dans la configuration. Les paramètres sont partagés par tableau avec `t.set('board','shared','quickMove', ...)`. L’ancienne configuration enregistrée sous cette clé est conservée lors de la mise à jour.

## Publication sur GitHub Pages

1. Remplacer les fichiers à la racine du dépôt par ceux de ce ZIP. Supprimer les anciens fichiers obsolètes `move.html` et `move.js` s'ils existent (ils ne sont plus utilisés).
2. Conserver/renseigner la clé publique de l’application Trello dans `config.js`. Ne jamais y placer l’API secret ni un token utilisateur.
3. Dans GitHub, Settings → Pages, publier depuis `main` et `/(root)`.
4. Dans https://trello.com/apps/admin, conserver l’Iframe Connector URL `https://PSEUDO.github.io/DEPOT/index.html`. Dans Trello Auth, autoriser l’origine `https://PSEUDO.github.io`.
5. Activer la capability **board-buttons**, optionnellement **show-settings** (qui permet également d’ouvrir la configuration depuis le menu Power-Ups). Désactiver `list-actions`.
6. Actualiser le tableau. Cliquer sur **Configurer les listes**, autoriser Trello si demandé, choisir les listes et enregistrer. Actualiser le tableau pour mettre à jour le libellé personnalisé du bouton d’action.

## Comportement et précautions

- Si aucune configuration n’est enregistrée, ou si une autorisation manque, le bouton de déplacement affiche un message et ne déplace aucune carte. Ouvrir le bouton de configuration pour régler le problème.
- Les deux listes doivent être distinctes et ouvertes sur le même tableau. Les cartes archivées ne sont pas déplacées.
- Le transfert est lancé sans seconde confirmation. La fonction d’API utilisée est `POST /1/lists/{id}/moveAllCards`.
- Le bouton d’action est présenté aux personnes capables de modifier le tableau. Chaque personne doit être autorisée à exécuter l’action via Trello.
- La prévention des doubles clics est locale à chaque iframe et n’empêche pas des actions simultanées par plusieurs utilisateurs.
- `theme.css` utilise les tokens Atlassian pour suivre le thème clair/sombre.
- Tests : syntaxe JavaScript et cohérence des fichiers vérifiées ; test réel avec un tableau Trello non effectué.

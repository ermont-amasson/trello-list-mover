# List Mover — Power-Up Trello

Ajoute **Déplacer toutes les cartes…** au menu `…` de chaque liste. Sélectionne une liste de destination du même tableau, puis confirme le déplacement. L'API Trello transfère toutes les cartes de la liste avec une seule requête.

## Configuration

1. Crée un Power-Up dans https://trello.com/apps/admin.
2. Dans **Trello Auth**, génère une clé API pour ce Power-Up. Mets-la dans `config.js` à la place de `REMPLACEZ_PAR_VOTRE_CLE_API`.
3. Héberge les fichiers du dossier à la racine d'un site HTTPS public (Netlify, Vercel ou GitHub Pages).
4. Dans les réglages du Power-Up, définis l'**Iframe Connector URL** sur `https://TON-DOMAINE/index.html`.
5. Active la capability **list-actions** puis ajoute le Power-Up à ton tableau.
6. Dans Trello, ouvre `…` sur une liste, puis clique **Déplacer toutes les cartes…**.
7. Lors du premier usage, clique sur **Autoriser avec Trello** pour accorder les droits read/write.
8. Sélectionne la liste cible et confirme le transfert.

## Permissions

- Le Power-Up utilise une clé API publique et un jeton personnel obtenu via l'authentification Trello.
- Ne place jamais de token utilisateur ou de secret dans `config.js`.
- Les déplacements sont effectués dans le tableau courant uniquement.
- Aucun serveur backend ou base de données n'est requis.

## Routes API

- `GET /1/boards/{boardId}/lists?filter=open&fields=id,name`
- `GET /1/lists/{listId}/cards?fields=id&filter=open`
- `POST /1/lists/{listId}/moveAllCards?idBoard={boardId}&idList={targetListId}`

## Limites

Les permissions réelles de l'utilisateur Trello s'appliquent. Le déplacement en masse ne propose pas de mécanisme d'annulation atomique. Trello peut limiter les requêtes ou afficher des erreurs d'autorisation selon le contexte du compte. Si l'autorisation est bloquée par les restrictions de cookies tiers du navigateur, voir la documentation officielle Trello REST API Client.

## Documentation officielle

- https://developer.atlassian.com/cloud/trello/power-ups/capabilities/list-actions/
- https://developer.atlassian.com/cloud/trello/power-ups/rest-api-client/
- https://developer.atlassian.com/cloud/trello/rest/api-group-lists/

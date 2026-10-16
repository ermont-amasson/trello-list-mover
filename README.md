# List Mover — bouton de tableau Trello

Cette version remplace l’action `list-actions` par **un bouton visible dans l’en-tête du tableau**, via `board-buttons`. Il ouvre un formulaire avec liste source et destination (sur le même tableau), confirmation et déplacement en une seule requête API.

## Installer sur GitHub Pages

1. Décompresse cette archive. Place **les fichiers contenus dans `trello-list-mover/`** à la racine du dépôt GitHub (pas le dossier parent).
2. Dans https://trello.com/apps/admin, crée ou ouvre ton Power-Up. Dans **Trello Auth**, génère une clé API.
3. Édite `config.js` et remplace `REMPLACEZ_PAR_VOTRE_CLE_API` par la clé API **publique** du Power-Up. Ne place jamais de secret ou de token utilisateur dans GitHub.
4. Dans **Allowed Origins**, indique `https://TON-PSEUDO.github.io` (sans chemin).
5. Active GitHub Pages : dépôt → Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
6. Dans la configuration du Power-Up, indique l'**Iframe Connector URL** `https://TON-PSEUDO.github.io/trello-list-mover/index.html` (adapte le nom du dépôt).
7. Dans **Capabilities**, active `board-buttons` et désactive `list-actions` si elle est encore activée. Enregistre et actualise le tableau.
8. Clique sur **Déplacer les cartes** en haut du tableau, puis autorise l’accès Trello lors du premier usage.
9. Choisis source et destination, vérifie le nombre de cartes et confirme.

## Remarques

- Les listes archivées sont exclues, ainsi que les cartes archivées.
- Le bouton n’apparaît qu’aux utilisateurs ayant la permission de modifier le tableau (`condition: edit`).
- L’autorisation `read,write` est déclenchée par un clic dans l’iframe, ce qui limite les blocages du popup d’autorisation.
- Le déplacement n'a pas de fonction d’annulation automatique. Fais un test sur un tableau de démonstration.
- La clé API est publique, le token OAuth de chaque membre est géré par le client REST du Power-Up.
- Si l’API client rencontre des restrictions de stockage tiers du navigateur, l’autorisation peut échouer selon les réglages du navigateur.
- Pages GitHub reste une solution d’hébergement statique : aucun backend nécessaire.

## API

- `GET /1/boards/{boardId}/lists?fields=id,name&filter=open`
- `GET /1/lists/{sourceId}/cards?fields=id&filter=open`
- `POST /1/lists/{sourceId}/moveAllCards?idBoard={boardId}&idList={destinationId}`

Documentation : https://developer.atlassian.com/cloud/trello/power-ups/capabilities/board-buttons/ et https://developer.atlassian.com/cloud/trello/power-ups/rest-api-client/

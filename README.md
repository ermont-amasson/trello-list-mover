# List Mover — Confirmation native Trello (v4)

Deux boutons dans l’en-tête : « Configurer les listes » et le bouton de déplacement au nom personnalisable.

Le bouton de déplacement ouvre une **popup native de confirmation Trello** (`type: 'confirm'`). Le transfert REST n’est appelé que par `onConfirm`. Annuler n’exécute aucun déplacement. Les paramètres existants `quickMove` sont conservés.

## Mise à jour GitHub Pages (important)

1. Décompresser et **remplacer à la racine** du dépôt `index.html`, `connector.js`, `settings.html`, `settings.js`, `theme.css`, `config.js`, `icon.svg`.
2. **Conserver sa véritable clé API** dans `config.js` (l’archive contient une valeur d’exemple).
3. Supprimer les anciens fichiers `confirm.html`, `confirm.js`, `move.html`, `move.js` pour éviter toute confusion (ils sont inutiles).
4. Valider les modifications avec Commit changes et vérifier sur le site GitHub Pages que `/connector.js` contient `type: 'confirm'`.
5. **Dans Trello Developer Portal**, changer **Iframe Connector URL** en ajoutant le paramètre `?v=4-native-confirm` : `https://PSEUDO.github.io/DEPOT/index.html?v=4-native-confirm`.
6. Actualiser Trello complètement (`Ctrl+Shift+R`). Si l’ancien comportement persiste, retirer puis réactiver le Power-Up du tableau après avoir vérifié la publication.

Les capabilities restent `board-buttons` et éventuellement `show-settings`. Aucun backend requis.

### Contrôle rapide

Sans cliquer sur **Confirmer**, aucune requête `moveAllCards` ne doit être envoyée. En cliquant sur **Annuler**, rien ne bouge. Si le transfert s’effectue sans popup, c’est une ancienne version du connecteur qui est exécutée (mauvais dépôt, déploiement, URL ou cache) : vérifier le code effectivement servi à l’adresse du connecteur, et inspecter la console réseau.

Attention : l’action déplace réellement toutes les cartes actives. Tester sur deux listes d’essai.

Validation : contrôle syntaxique local JavaScript ; non testé sur compte Trello réel.

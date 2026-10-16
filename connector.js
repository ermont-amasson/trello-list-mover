const config = window.LIST_MOVER_CONFIG;
window.TrelloPowerUp.initialize({
  'list-actions': function (t) {
    // Répondre immédiatement : cette capability a une limite de temps stricte.
    return [{
      text: 'Déplacer toutes les cartes…',
      callback: function (t) {
        return t.popup({
          title: 'Déplacer toutes les cartes',
          url: './move.html',
          height: 330
        });
      }
    }];
  }
}, { appKey: config.appKey, appName: config.appName });

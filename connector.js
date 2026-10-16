const config = window.LIST_MOVER_CONFIG;
const base = new URL('.', window.location.href);
window.TrelloPowerUp.initialize({
  'board-buttons': function () {
    return [{
      icon: {
        dark: new URL('icon.svg', base).href,
        light: new URL('icon.svg', base).href
      },
      text: 'Déplacer les cartes',
      condition: 'edit',
      callback: function (t) {
        return t.popup({
          title: 'Déplacer toutes les cartes',
          url: new URL('move.html', base).href,
          height: 390
        });
      }
    }];
  }
}, { appKey: config.appKey, appName: config.appName });

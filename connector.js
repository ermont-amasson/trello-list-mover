const config = window.LIST_MOVER_CONFIG;
const base = new URL('.', window.location.href);
const settingsUrl = new URL('settings.html', base).href;
const iconUrl = new URL('icon.svg', base).href;
const confirmationUrl = new URL('confirm.html', base).href;

function openSettings(t) {
  return t.popup({ title: 'Configurer List Mover', url: settingsUrl, height: 440 });
}

async function execute(t) {
  const saved = await t.get('board', 'shared', 'quickMove', null);
  if (!saved?.sourceId || !saved?.destinationId || saved.sourceId === saved.destinationId) {
    return t.alert({ message: 'Configure les listes source et destination avant de lancer le déplacement.' });
  }
  const client = await t.getRestApi();
  if (!(await client.getToken())) {
    return t.alert({ message: 'Autorise Trello dans « Configurer les listes » avant le premier déplacement.' });
  }
  // L'action destructive n'est exécutée que dans confirm.js, après confirmation.
  return t.popup({ title: 'Confirmer le déplacement', url: confirmationUrl, height: 280 });
}

window.TrelloPowerUp.initialize({
  'board-buttons': async function(t) {
    const saved = await t.get('board', 'shared', 'quickMove', null);
    return [
      {
        icon: { dark: iconUrl, light: iconUrl },
        text: 'Configurer les listes',
        condition: 'edit',
        callback: openSettings
      },
      {
        icon: { dark: iconUrl, light: iconUrl },
        text: saved?.label?.trim() || 'Déplacer les cartes',
        condition: 'edit',
        callback: execute
      }
    ];
  },
  'show-settings': openSettings
}, { appKey: config.appKey, appName: config.appName });

const config = window.LIST_MOVER_CONFIG;
const base = new URL('.', window.location.href);
const settingsUrl = new URL('settings.html', base).href;
const iconUrl = new URL('settings.png', base).href;
const activeRuns = new Set();

async function api(t, path, method = 'GET', params = {}) {
  const client = await t.getRestApi();
  const token = await client.getToken();
  if (!token) throw new Error('AUTH_REQUIRED');
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', config.appKey);
  url.searchParams.set('token', token);
  for (const [key,value] of Object.entries(params)) url.searchParams.set(key, value);
  const res = await fetch(url, { method });
  if (!res.ok) throw new Error(`Trello a répondu avec le code ${res.status}.`);
  return res.status === 204 ? null : res.json();
}

function openSettings(t) {
  return t.popup({ title: 'Configurer List Mover', url: settingsUrl, height: 440 });
}

async function execute(t) {
  const boardId = t.getContext().board;
  if (!boardId || activeRuns.has(boardId)) return;
  activeRuns.add(boardId);
  try {
    const saved = await t.get('board', 'shared', 'quickMove', null);
    if (!saved?.sourceId || !saved?.destinationId || saved.sourceId === saved.destinationId) {
      await t.alert({ message: 'Configure la liste source et la destination via « Configurer les listes ».' });
      return;
    }
    const client = await t.getRestApi();
    if (!(await client.getToken())) {
      await t.alert({ message: 'Autorise Trello en ouvrant « Configurer les listes » avant le premier déplacement.' });
      return;
    }
    // Vérifie l’appartenance au tableau et l’état des listes avant de déplacer.
    const lists = await api(t, `/boards/${encodeURIComponent(boardId)}/lists`, 'GET', { fields: 'id,name', filter: 'open' });
    const source = lists.find(l => l.id === saved.sourceId);
    const destination = lists.find(l => l.id === saved.destinationId);
    if (!source || !destination) throw new Error('La liste source ou destination n’existe plus, ou elle est archivée. Modifie la configuration.');
    await api(t, `/lists/${encodeURIComponent(source.id)}/moveAllCards`, 'POST', { idBoard: boardId, idList: destination.id });
    await t.alert({ message: `Cartes déplacées : ${source.name} → ${destination.name}` });
  } catch (error) {
    console.error('List Mover:', error);
    await t.alert({ message: error.message || 'Échec du déplacement.' });
  } finally {
    activeRuns.delete(boardId);
  }
}

window.TrelloPowerUp.initialize({
  'board-buttons': async function(t) {
    const saved = await t.get('board', 'shared', 'quickMove', null);
    return [
      {
        icon: { dark: iconUrl, light: iconUrl },
        text: 'Settings',
        condition: 'edit',
        callback: openSettings
      },
      {
        text: saved?.label?.trim() || 'Déplacer les cartes',
        condition: 'edit',
        callback: execute
      }
    ];
  },
  'show-settings': openSettings
}, { appKey: config.appKey, appName: config.appName });

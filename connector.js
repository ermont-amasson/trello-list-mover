// List Mover - confirmation native Trello (v4)
const cfg = window.LIST_MOVER_CONFIG;
const baseUrl = new URL('.', location.href);
const settingsUrl = new URL('settings.html', baseUrl).href;
const iconUrl = new URL('icon.svg', baseUrl).href;
const settingsIconUrl = new URL('settings.png', baseUrl).href;
let moving = false;

function openSettings(t) {
  return t.popup({ title: 'Configurer List Mover', url: settingsUrl, height: 440 });
}

async function moveAfterConfirmation(t) {
  if (moving) return;
  moving = true;
  try {
    const boardId = t.getContext().board;
    const saved = await t.get('board', 'shared', 'quickMove', null);
    if (!boardId || !saved?.sourceId || !saved?.destinationId || saved.sourceId === saved.destinationId) {
      throw new Error('Configure deux listes différentes avant le déplacement.');
    }
    const api = await t.getRestApi();
    const token = await api.getToken();
    if (!token) throw new Error('Autorisation Trello manquante : utilise le bouton de configuration.');
    const request = async (path, method = 'GET', params = {}) => {
      const url = new URL('https://api.trello.com/1' + path);
      url.searchParams.set('key', cfg.appKey);
      url.searchParams.set('token', token);
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      const result = await fetch(url, { method });
      if (!result.ok) throw new Error('Erreur Trello ' + result.status);
      return result.status === 204 ? null : result.json();
    };
    const lists = await request('/boards/' + encodeURIComponent(boardId) + '/lists', 'GET', {fields:'id,name',filter:'open'});
    const source = lists.find(l => l.id === saved.sourceId);
    const destination = lists.find(l => l.id === saved.destinationId);
    if (!source || !destination || source.id === destination.id) {
      throw new Error('La liste source ou destination n’est plus valide. Modifie la configuration.');
    }
    await request('/lists/' + encodeURIComponent(source.id) + '/moveAllCards', 'POST', {idBoard:boardId,idList:destination.id});
    await t.alert({ message: 'Cartes déplacées : ' + source.name + ' → ' + destination.name });
  } catch (error) {
    console.error('[List Mover] Déplacement impossible', error);
    await t.alert({ message: error?.message || 'Déplacement impossible.' });
  } finally {
    moving = false;
  }
}

// Important: aucune API de déplacement n'est appelée dans ce callback.
// Seul onConfirm peut déclencher moveAfterConfirmation.
function openMoveConfirmation(t) {
  return t.popup({
    type: 'confirm',
    title: 'Confirmer le déplacement',
    message: 'Déplacer toutes les cartes de la liste source vers la liste de destination configurée ?',
    confirmText: 'Déplacer les cartes',
    cancelText: 'Annuler',
    confirmStyle: 'danger',
    onConfirm: function (context) { return moveAfterConfirmation(context); }
  });
}

window.TrelloPowerUp.initialize({
  'board-buttons': async function(t) {
    const saved = await t.get('board', 'shared', 'quickMove', null);
    return [
      {icon:{dark:settingsIconUrl,light:settingsIconUrl}, text:'Settings', condition:'edit', callback:openSettings},
      {text:saved?.label?.trim() || 'Move cards', condition:'edit', callback:openMoveConfirmation}
    ];
  },
  'show-settings': openSettings
}, {appKey:cfg.appKey, appName:cfg.appName});

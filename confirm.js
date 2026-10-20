const cfg = window.LIST_MOVER_CONFIG;
const t = window.TrelloPowerUp.iframe({ appKey: cfg.appKey, appName: cfg.appName });
const summary = document.getElementById('summary');
const status = document.getElementById('status');
const confirmButton = document.getElementById('confirm');
const cancelButton = document.getElementById('cancel');
let running = false;
let settings;
let boardId;
let client;

function errorMessage(error) {
  return error?.message || 'Une erreur est survenue.';
}

async function api(path, method = 'GET', params = {}) {
  const token = await client.getToken();
  if (!token) throw new Error('Autorisation Trello manquante.');
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', cfg.appKey);
  url.searchParams.set('token', token);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { method });
  if (!response.ok) throw new Error(`Erreur Trello ${response.status}.`);
  return response.status === 204 ? null : response.json();
}

async function getValidLists() {
  const lists = await api(`/boards/${encodeURIComponent(boardId)}/lists`, 'GET', {
    fields: 'id,name', filter: 'open'
  });
  const source = lists.find(list => list.id === settings.sourceId);
  const destination = lists.find(list => list.id === settings.destinationId);
  if (!source || !destination || source.id === destination.id) {
    throw new Error('La configuration des listes n’est plus valide. Modifie les paramètres.');
  }
  return { source, destination };
}

cancelButton.addEventListener('click', () => {
  if (!running) t.closePopup();
});

confirmButton.addEventListener('click', async () => {
  if (running) return;
  running = true;
  confirmButton.disabled = true;
  cancelButton.disabled = true;
  status.textContent = 'Déplacement en cours…';
  status.className = '';
  try {
    // Vérifier à nouveau les listes au dernier moment.
    const { source, destination } = await getValidLists();
    await api(`/lists/${encodeURIComponent(source.id)}/moveAllCards`, 'POST', {
      idBoard: boardId,
      idList: destination.id
    });
    await t.closePopup();
    await t.alert({ message: `Cartes déplacées : ${source.name} → ${destination.name}` });
  } catch (error) {
    status.textContent = errorMessage(error);
    status.className = 'error';
    confirmButton.disabled = false;
    cancelButton.disabled = false;
  } finally {
    running = false;
  }
});

(async () => {
  try {
    boardId = t.getContext().board;
    if (!boardId) throw new Error('Tableau introuvable.');
    settings = await t.get('board', 'shared', 'quickMove', null);
    if (!settings?.sourceId || !settings?.destinationId) {
      throw new Error('Configure d’abord les listes source et destination.');
    }
    client = await t.getRestApi();
    const { source, destination } = await getValidLists();
    summary.textContent = `Déplacer toutes les cartes de « ${source.name} » vers « ${destination.name} » ?`;
    confirmButton.disabled = false;
  } catch (error) {
    summary.textContent = 'Impossible de préparer le déplacement.';
    status.textContent = errorMessage(error);
    status.className = 'error';
  }
})();

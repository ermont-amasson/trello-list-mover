const config = window.LIST_MOVER_CONFIG;
const t = window.TrelloPowerUp.iframe({ appKey: config.appKey, appName: config.appName });
const $ = (id) => document.getElementById(id);
const authBlock = $('auth-block');
const moveBlock = $('move-block');
const sourceSelect = $('source');
const targetSelect = $('target');
const moveButton = $('move');
const authButton = $('authorize');
const status = $('status');

let apiClient;
let boardId;
let lists = [];
let sourceCount = 0;
let countRequest = 0;
let completed = false;

function message(text, kind = '') {
  status.textContent = text;
  status.className = `status ${kind}`;
}

async function request(path, { method = 'GET', params = {} } = {}) {
  const token = await apiClient.getToken();
  if (!token) throw new Error('Autorisation Trello manquante.');
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', config.appKey);
  url.searchParams.set('token', token);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { method });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erreur Trello ${response.status}${detail ? ` : ${detail.slice(0, 160)}` : ''}`);
  }
  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function fillSelect(select, options) {
  select.replaceChildren();
  for (const list of options) {
    const option = document.createElement('option');
    option.value = list.id;
    option.textContent = list.name;
    select.appendChild(option);
  }
}

function refreshTargets() {
  const previous = targetSelect.value;
  const targets = lists.filter((list) => list.id !== sourceSelect.value);
  fillSelect(targetSelect, targets);
  if (targets.some((list) => list.id === previous)) targetSelect.value = previous;
  void refreshCount();
}

async function refreshCount() {
  const current = ++countRequest;
  sourceCount = 0;
  moveButton.disabled = true;
  if (completed) return;
  const sourceId = sourceSelect.value;
  const destinationId = targetSelect.value;
  if (!sourceId || !destinationId || sourceId === destinationId) {
    $('count').textContent = lists.length < 2 ? 'Il faut au moins deux listes ouvertes.' : 'Sélectionne deux listes différentes.';
    return;
  }
  $('count').textContent = 'Comptage des cartes…';
  try {
    const cards = await request(`/lists/${encodeURIComponent(sourceId)}/cards`, {
      params: { fields: 'id', filter: 'open' }
    });
    if (current !== countRequest || completed) return;
    sourceCount = cards.length;
    $('count').textContent = `${sourceCount} carte(s) à déplacer`;
    moveButton.disabled = sourceCount === 0;
  } catch (error) {
    if (current !== countRequest) return;
    $('count').textContent = '';
    message(error.message || 'Comptage impossible.', 'error');
  }
}

async function loadLists() {
  message('Chargement des listes…');
  lists = await request(`/boards/${encodeURIComponent(boardId)}/lists`, {
    params: { fields: 'id,name', filter: 'open' }
  });
  fillSelect(sourceSelect, lists);
  authBlock.hidden = true;
  moveBlock.hidden = false;
  message('');
  refreshTargets();
}

async function checkAuthorization() {
  apiClient = await t.getRestApi();
  const token = await apiClient.getToken();
  if (!token) {
    authBlock.hidden = false;
    moveBlock.hidden = true;
    message('');
    return;
  }
  await loadLists();
}

sourceSelect.addEventListener('change', refreshTargets);
targetSelect.addEventListener('change', () => { void refreshCount(); });

authButton.addEventListener('click', async () => {
  authButton.disabled = true;
  try {
    await apiClient.authorize({ scope: 'read,write', expiration: '30days' });
    await checkAuthorization();
  } catch (error) {
    message(error.message || 'Autorisation annulée.', 'error');
  } finally {
    authButton.disabled = false;
  }
});

moveButton.addEventListener('click', async () => {
  const sourceId = sourceSelect.value;
  const destinationId = targetSelect.value;
  if (completed || moveButton.disabled || sourceId === destinationId || !sourceCount ||
      !lists.some((list) => list.id === sourceId) || !lists.some((list) => list.id === destinationId)) return;
  const sourceName = sourceSelect.selectedOptions[0]?.textContent || 'Source';
  const targetName = targetSelect.selectedOptions[0]?.textContent || 'Destination';
  if (!window.confirm(`Déplacer toutes les cartes de « ${sourceName} » vers « ${targetName} » ? Cette action modifie le tableau.`)) return;
  ++countRequest;
  moveButton.disabled = true;
  sourceSelect.disabled = true;
  targetSelect.disabled = true;
  message('Déplacement en cours…');
  try {
    await request(`/lists/${encodeURIComponent(sourceId)}/moveAllCards`, {
      method: 'POST',
      params: { idBoard: boardId, idList: destinationId }
    });
    completed = true;
    $('count').textContent = 'Transfert effectué.';
    message(`Les cartes de « ${sourceName} » ont été déplacées vers « ${targetName} ».`, 'success');
  } catch (error) {
    message(error.message || 'Le déplacement a échoué.', 'error');
    sourceSelect.disabled = false;
    targetSelect.disabled = false;
    await refreshCount();
  }
});

(async function start() {
  try {
    boardId = t.getContext().board;
    if (!boardId) throw new Error('Ouvre cette fenêtre depuis un tableau Trello.');
    if (!config.appKey || config.appKey === 'REMPLACEZ_PAR_VOTRE_CLE_API') {
      throw new Error('Configure la clé API dans config.js.');
    }
    await checkAuthorization();
  } catch (error) {
    message(error.message || 'Impossible de charger le Power-Up.', 'error');
  }
})();

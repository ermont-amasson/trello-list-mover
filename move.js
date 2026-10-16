const config = window.LIST_MOVER_CONFIG;
const t = window.TrelloPowerUp.iframe({
  appKey: config.appKey,
  appName: config.appName
});

const $ = (id) => document.getElementById(id);
const authBlock = $('auth-block');
const moveBlock = $('move-block');
const authButton = $('authorize');
const moveButton = $('move');
const targetSelect = $('target');
const status = $('status');

let apiClient;
let sourceId;
let boardId;
let sourceCount = 0;
let destinationIds = new Set();

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
    let detail = await response.text();
    throw new Error(`Erreur Trello ${response.status}${detail ? ` : ${detail.slice(0,160)}` : ''}`);
  }
  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

async function loadLists() {
  message('Chargement…');
  const lists = await request(`/boards/${encodeURIComponent(boardId)}/lists`, {
    params: { fields: 'id,name', filter: 'open' }
  });
  const cards = await request(`/lists/${encodeURIComponent(sourceId)}/cards`, {
    params: { fields: 'id', filter: 'open' }
  });
  sourceCount = cards.length;
  const targets = lists.filter((item) => item.id !== sourceId);
  destinationIds = new Set(targets.map((item) => item.id));
  targetSelect.replaceChildren();
  for (const list of targets) {
    const option = document.createElement('option');
    option.value = list.id;
    option.textContent = list.name;
    targetSelect.appendChild(option);
  }
  $('count').textContent = `${sourceCount} carte(s) à déplacer`;
  moveButton.disabled = !sourceCount || !targets.length;
  moveBlock.hidden = false;
  authBlock.hidden = true;
  message(!sourceCount ? 'La liste source est vide.' : !targets.length ? 'Aucune autre liste disponible.' : '');
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

// L'autorisation doit être déclenchée par un véritable clic utilisateur.
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
  const destinationId = targetSelect.value;
  if (!destinationIds.has(destinationId) || destinationId === sourceId) return;
  const targetName = targetSelect.selectedOptions[0]?.textContent || 'la liste choisie';
  if (!window.confirm(`Déplacer ${sourceCount} carte(s) vers « ${targetName} » ?`)) return;
  moveButton.disabled = true;
  targetSelect.disabled = true;
  message('Déplacement en cours…');
  try {
    // Une seule opération Trello déplace les cartes de la liste source.
    await request(`/lists/${encodeURIComponent(sourceId)}/moveAllCards`, {
      method: 'POST',
      params: { idBoard: boardId, idList: destinationId }
    });
    message(`Déplacement terminé vers « ${targetName} ».`, 'success');
    $('count').textContent = 'Les cartes ont été transférées.';
  } catch (error) {
    message(error.message || 'Le déplacement a échoué.', 'error');
    moveButton.disabled = false;
    targetSelect.disabled = false;
  }
});

(async function start() {
  try {
    const context = t.getContext();
    sourceId = context.list;
    boardId = context.board;
    if (!sourceId || !boardId) throw new Error('Ouvre le Power-Up depuis le menu d’une liste Trello.');
    const source = await t.list('name');
    $('source').textContent = `Source : ${source.name}`;
    if (config.appKey === 'REMPLACEZ_PAR_VOTRE_CLE_API') {
      throw new Error('Configure ta clé API Trello dans config.js.');
    }
    await checkAuthorization();
  } catch (error) {
    message(error.message || 'Impossible de charger le Power-Up.', 'error');
  }
})();

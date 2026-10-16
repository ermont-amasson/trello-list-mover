const cfg = window.LIST_MOVER_CONFIG;
const t = window.TrelloPowerUp.iframe({ appKey: cfg.appKey, appName: cfg.appName });
const el = id => document.getElementById(id);
let lists = [];
let client;
const status = (message, kind='') => { el('status').textContent=message; el('status').className=kind; };

async function api(path) {
  const token = await client.getToken();
  if (!token) throw new Error('Autorisation manquante.');
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', cfg.appKey);
  url.searchParams.set('token', token);
  url.searchParams.set('fields', 'id,name');
  url.searchParams.set('filter', 'open');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur Trello ${response.status}.`);
  return response.json();
}
function fill(select, choices, preferred) {
  select.replaceChildren();
  for (const list of choices) {
    const option=document.createElement('option');
    option.value=list.id;
    option.textContent=list.name;
    select.append(option);
  }
  if (choices.some(l=>l.id===preferred)) select.value=preferred;
}
function updateTargets(preferred) {
  const available = lists.filter(l=>l.id!==el('source').value);
  fill(el('target'),available,preferred || el('target').value);
  el('save').disabled=available.length===0;
}
async function load() {
  const boardId=t.getContext().board;
  if (!boardId) throw new Error('Aucun tableau Trello détecté.');
  client=await t.getRestApi();
  if (!(await client.getToken())) { el('auth-block').hidden=false; el('form').hidden=true; return; }
  lists=await api(`/boards/${encodeURIComponent(boardId)}/lists`);
  const saved=await t.get('board','shared','quickMove',null);
  el('label').value=saved?.label || 'Déplacer les cartes';
  fill(el('source'),lists,saved?.sourceId);
  updateTargets(saved?.destinationId);
  el('auth-block').hidden=true;
  el('form').hidden=false;
  status(lists.length<2 ? 'Il faut au moins deux listes ouvertes.' : '');
}
el('source').addEventListener('change',()=>updateTargets());
el('authorize').addEventListener('click',async()=>{
  el('authorize').disabled=true;
  try { await client.authorize({ scope:'read,write',expiration:'30days' }); await load(); }
  catch(error) { status(error.message || 'Autorisation annulée.','error'); }
  finally { el('authorize').disabled=false; }
});
el('form').addEventListener('submit',async event=>{
  event.preventDefault();
  const label=el('label').value.trim();
  const sourceId=el('source').value;
  const destinationId=el('target').value;
  if (!lists.some(l=>l.id===sourceId) || !lists.some(l=>l.id===destinationId) || sourceId===destinationId) {
    status('Choisis deux listes différentes.','error');return;
  }
  el('save').disabled=true;
  try {
    await t.set('board','shared','quickMove',{label: label || 'Déplacer les cartes',sourceId,destinationId});
    status('Configuration enregistrée. Actualise ton tableau si le nom du bouton ne change pas immédiatement.','success');
  } catch(error) { status(error.message || 'Enregistrement impossible.','error'); }
  finally { el('save').disabled=false; }
});
(async()=>{try {
  if (!cfg.appKey || cfg.appKey==='REMPLACEZ_PAR_VOTRE_CLE_API') throw new Error('Renseigne ta clé API dans config.js.');
  await load();
} catch(error) { status(error.message || 'Chargement impossible.','error'); }})();

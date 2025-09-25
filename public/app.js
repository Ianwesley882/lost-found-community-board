const apiBase = '/api/items';

async function fetchItems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(apiBase + (qs ? '?'+qs : ''));
  return res.json();
}

function formatMeta(item) {
  const date = new Date(item.datePosted);
  return `${item.type.toUpperCase()} • ${item.category} • ${date.toLocaleDateString()}`;
}

function createCard(item) {
  const tpl = document.getElementById('cardTemplate');
  const node = tpl.content.cloneNode(true);
  node.querySelector('.thumb').src = item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
  node.querySelector('.title').textContent = item.title;
  node.querySelector('.meta').textContent = formatMeta(item);
  node.querySelector('.desc').textContent = item.description;
  node.querySelector('.view').addEventListener('click', ()=> showDetail(item.id));
  node.querySelector('.claim').addEventListener('click', ()=> claimItem(item.id));
  return node;
}

async function loadList() {
  const type = document.querySelector('.tabs .tab.active').dataset.type;
  const category = document.getElementById('category').value;
  const query = document.getElementById('search').value.trim();
  const params = {};
  if (type) params.type = type;
  if (category) params.category = category;
  if (query) params.query = query;
  const items = await fetchItems(params);
  const list = document.getElementById('list');
  list.innerHTML = '';
  if (!items.length) { list.innerHTML = '<p>No items found.</p>'; return; }
  items.forEach(i => list.appendChild(createCard(i)));
}

async function showDetail(id) {
  const res = await fetch(apiBase + '/' + id);
  if (!res.ok) return alert('Item not found');
  const item = await res.json();
  document.getElementById('detailImg').src = item.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image';
  document.getElementById('detailTitle').textContent = item.title;
  document.getElementById('detailMeta').textContent = formatMeta(item);
  document.getElementById('detailDesc').textContent = item.description;
  document.getElementById('detailContact').textContent = item.contactInfo || '—';
  document.getElementById('detail').classList.remove('hidden');
  document.getElementById('claimBtn').onclick = ()=> claimItem(item.id, true);
}

document.getElementById('closeDetail').addEventListener('click', ()=> document.getElementById('detail').classList.add('hidden'));

async function claimItem(id, close=false) {
  const ok = confirm('Mark this item as claimed?');
  if (!ok) return;
  const res = await fetch(`${apiBase}/${id}/claim`, { method: 'POST' });
  if (!res.ok) return alert('Error');
  if (close) document.getElementById('detail').classList.add('hidden');
  await loadList();
}

document.getElementById('search').addEventListener('input', debounce(loadList, 350));
document.getElementById('category').addEventListener('change', loadList);

// tabs
document.querySelectorAll('.tabs .tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tabs .tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadList();
  });
});

// add item flow (simple single-page behavior)
document.getElementById('addBtn').addEventListener('click', (e)=>{
  // show add section and scroll
  e.preventDefault();
  document.getElementById('add').scrollIntoView({behavior:'smooth'});
});

document.getElementById('cancelAdd').addEventListener('click', (e)=>{
  e.preventDefault();
  window.scrollTo({top:0,behavior:'smooth'});
});

document.getElementById('addForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch(apiBase, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) return alert('Failed to add');
  e.target.reset();
  alert('Item added!');
  window.scrollTo({top:0,behavior:'smooth'});
  loadList();
});

function debounce(fn, wait=300){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait);} }

window.addEventListener('load', ()=> loadList());
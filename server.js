const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample in-memory data (seeded from the original Flutter app)
let items = [
  {
    id: '1',
    title: 'Black iPhone 14 Pro',
    description: 'Black iPhone 14 Pro with a cracked screen protector. Found near the library entrance.',
    location: 'Central Library',
    type: 'found',
    category: 'electronics',
    datePosted: new Date(Date.now() - 2*24*3600*1000).toISOString(),
    contactInfo: 'john.doe@email.com',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
    isClaimed: false
  },
  {
    id: '2',
    title: 'Brown Leather Wallet',
    description: 'Lost my brown leather wallet containing ID and credit cards. Last seen at Coffee Corner on Main Street.',
    location: 'Coffee Corner, Main St',
    type: 'lost',
    category: 'accessories',
    datePosted: new Date(Date.now() - 5*24*3600*1000).toISOString(),
    contactInfo: 'jane.smith@email.com',
    imageUrl: 'images/s-zoom.png',
    isClaimed: false
  }
];

// API endpoints
app.get('/api/items', (req, res) => {
  // support query params: type, category, query (search)
  let results = items.filter(i => !i.isClaimed);
  const { type, category, query } = req.query;
  if (type) results = results.filter(i => i.type === type);
  if (category) results = results.filter(i => i.category === category);
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }
  res.json(results);
});

app.get('/api/items/:id', (req, res) => {
  const found = items.find(i => i.id === req.params.id);
  if (!found) return res.status(404).json({error: 'Not found'});
  res.json(found);
});

app.post('/api/items', (req, res) => {
  const { title, description, location, type, category, contactInfo, imageUrl } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'title and type are required' });
  const newItem = {
    id: uuidv4(),
    title,
    description: description || '',
    location: location || '',
    type,
    category: category || 'accessories',
    datePosted: new Date().toISOString(),
    contactInfo: contactInfo || '',
    imageUrl: imageUrl || '',
    isClaimed: false
  };
  items.unshift(newItem);
  res.status(201).json(newItem);
});

app.post('/api/items/:id/claim', (req, res) => {
  const it = items.find(i => i.id === req.params.id);
  if (!it) return res.status(404).json({error:'Not found'});
  it.isClaimed = true;
  it.dateClaimed = new Date().toISOString();
  res.json(it);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
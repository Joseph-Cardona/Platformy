const express = require('express');
require('dotenv').config();
const app = express();
const port = 5000;

const cors = require('cors');
const jwt = require('jsonwebtoken');
const corsOptions = {
  origin: [
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400
};
const {
  connectDB,
  newMessage,
  newUser,
  checkUser,
  newLevel,
  getLevelById,
  getPublishedLevels
} = require('./db.js');

app.use(express.json());
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = await newMessage(req.body.message);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/newUser', async (req, res) => {
  try {
    const user = await newUser(req.body.username, req.body.email, req.body.password); 
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT,
      { expiresIn: '1d' }
    );
    res.status(201).json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await checkUser(req.body.username, req.body.password); 
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/newLevel', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = jwt.verify(authHeader.split(' ')[1], process.env.JWT);
    const level = await newLevel(token.userId, req.body.title, req.body.map, req.body.description || '');
    res.status(201).json({
      success: true,
      level
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/getLevelById', async (req, res) => {
  try {
    const user = await getLevelById(req.body.level_id); 
    res.status(200).json({
      success: true,
      level: { id: level.id, user_id: level.user_id, title: level.title, description: level.description, map: level.map, is_published: level.is_published, created_at: level.created_at, updated_at: level.updated_at, user: level.user }
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/levels', async (req, res) => {
  try {
    const levels = await getPublishedLevels();
    res.status(200).json({
      success: true,
      levels
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function serverStarter () {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`server's running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log(`error: ${err}`);
    process.exit(1);
  }
}

serverStarter();

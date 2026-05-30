const express = require('express');
const app = express();
const port = 5000;

require('dotenv').config();
const cors = require('cors');
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
  newMessage
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

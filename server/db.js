const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const connection = process.env.DATABASE_URL;

const pool = new Pool ({
  connectionString: connection,
});

// Setup functions
async function connectDB () {
  try {
    await pool.query('SELECT 1');
    console.log('successful connection');
  } catch (err) {
    console.log('error:' + err.message);
  }
}

async function newMessage (message) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message required');
  }
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO messages (message) VALUES ($1) RETURNING *';
    const result = await client.query(query, [message.trim()]);
    return result.rows[0];
  } catch (err) {
    console.log('error: ' + err.message)
    throw err;
  } finally {
    client.release();
  }
}

async function newUser (username, email, password) {
  if (!username || typeof username !== 'string' || username.trim() === '') {
    throw new Error('Username required');
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new Error('Email required');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be 8 characters or longer');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  } catch (err) {
    console.log('error: ' + err.message)
    if (err.code === '23505') {
      if (err.constraint === 'users_username_key') {
        throw new Error('Username taken');
        throw new Eror('Email is already being used');
      }
      throw err;
    }
    throw err;
  } finally {
    client.release();
  }
}

async function checkUser (username, password) {
  if (!username || typeof username !== 'string' || username.trim() === '') {
    throw new Error('Username required');
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw new Error('Password required');
  }
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await client.query(query, [username.trim()]);
    if (result.rows.length === 0) {
      throw new Error('Invalid username or password');
    }
    const user =  result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid username or password');
    }
    return user;
  } catch (err) {
    console.log('error: ' + err.message)
    throw err;
  } finally {
    client.release();
  }
}

async function newLevel (user_id, title, map, description='') {
  if (!user_id || typeof user_id !== 'number') {
    throw new Error('User ID required');
  }
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Title required');
  }
  if (!map || !Array.isArray(map)) {
    throw new Error('Map required');
  }
  const desc = (description && typeof description == 'string' && description.trim() !== '') ? description.trim() : 'No description';
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO levels (user_id, title, description, map, is_published) VALUES ($1, $2, $3, $4::jsonb, true) RETURNING *';
    const result = await client.query(query, [user_id, title.trim(), desc, JSON.stringify(map)]);
    return result.rows[0];
  } catch (err) {
    console.log('error: ' + err);
    throw err;
  } finally {
    client.release();
  }
}

async function getLevelById (level_id) {
  if (!level_id || typeof level_id !== 'number') {
    throw new Error('Level ID required');
  }
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM levels WHERE id = $1';
    const result = await client.query(query, [level_id]);
    if (result.rows.length === 0) {
      throw new Error('Level not found');
    }
    const level = result.rows[0];
    return level;
  } catch (err) {
    console.log('error: ' + err.message)
    throw err;
  } finally {
    client.release();
  }
}

async function getPublishedLevels () {
  const client = await pool.connect();
  try {
    const query = 'select l.*, u.username FROM levels l JOIN users u ON l.user_id = u.id WHERE l.is_published = true ORDER BY l.created_at DESC';
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    console.log('error: ' + err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function getUserLevels (user_id) {
  if (!user_id || typeof user_id !== 'number') {
    throw new Error('No User ID');
  }
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM levels WHERE user_id = $1 ORDER BY updated_at DESC';
    const result = await client.query(query, [user_id]);
    return result.rows;
  } catch (err) {
    console.log('error: ' + err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function disconnectDB () {
  try {
    await pool.end();
    console.log('successful disconnection');
  } catch (err) {
    console.log('error: ' + err.message);
  }
}

module.exports = {
  pool,
  connectDB,
  disconnectDB,
  newMessage,
  newUser,
  checkUser,
  newLevel,
  getLevelById,
  getPublishedLevels,
  getUserLevels,
}

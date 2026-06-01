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
}

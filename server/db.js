const { Pool } = require('pg');

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
}

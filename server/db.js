const { Client } = require('pg');

const connection = process.env.DATABASE_URL;

const client = new Client ({
  connectionString: connection,
});

// Setup functions
async function connectDB () {
  try {
    await client.connect();
    console.log('successful connection');
  } catch (err) {
    console.log('error:');
    throw err;
  }
}

async function disconnectDB () {
  try {
    await client.end();
    console.log('successful disconnection');
  } catch (err) {
    console.log('error:');
    throw err;
  }
}

async function newMessage (message) {
  try {
    const query = 'INSERT INTO Messages (message) VALUES ($1) RETURNING *';
    const values = [message];
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.log('error:');
    throw err;
  }
}

module.exports = {
  client,
  connectDB,
  disconnectDB,
  newMessage,
}

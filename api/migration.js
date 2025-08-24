const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: process.env.DB_USER || 'insyd',
    password: process.env.DB_PASSWORD || 'insyd123',
    database: process.env.DB_NAME || 'insyd',
  });

  try {
    await client.connect();
    console.log('Running database setup...');

    console.log('Creating tables if not exists...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        post_id INTEGER REFERENCES posts(id),
        UNIQUE(user_id, post_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('All tables created.');

    console.log('Seeding initial data...');

    await client.query(
      'INSERT INTO posts (title) VALUES ($1) ON CONFLICT DO NOTHING',
      ['Modern Villa Design']
    );

    await client.query(
      'INSERT INTO users (name) VALUES ($1) ON CONFLICT DO NOTHING',
      ['User']
    );

    console.log('Seeded: 1 post, 1 user');

    await client.end();
  } catch (err) {
    console.error('DB setup failed:', err.message || err);
    await client.end();
    process.exit(1);
  }
}

run();
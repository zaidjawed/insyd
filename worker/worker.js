const { Client: PgClient } = require('pg');

exports.handler = async (event) => {
  console.log("Lambda received event:", event);

  const pgClient = new PgClient({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await pgClient.connect();

    const { actorId, postId } = event;
    if (!actorId || !postId) {
      throw new Error("Missing actorId or postId");
    }

    const users = await pgClient.query('SELECT id FROM users');
    const actorName = `User ${actorId}`;

    for (const user of users.rows) {
      await pgClient.query(
        `INSERT INTO notifications (user_id, message, read, created_at)
         VALUES ($1, $2, false, NOW())`,
        [user.id, `${actorName} liked a post!`]
      );
    }

    console.log(`Notified ${users.rows.length} users about like from ${actorId}`);

    await pgClient.end();

    return { success: true, notified: users.rows.length };
  } catch (err) {
    console.error("Worker Lambda failed:", err);
    await pgClient.end();
    throw err;
  }
};

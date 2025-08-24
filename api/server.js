const cors = require("cors");
const express = require('express');
const { createServer } = require('http');
const { Server: WebSocketServer } = require('ws');
const { Client: PgClient } = require('pg');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('./migration');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const pgClient = new PgClient({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
pgClient.connect();

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

app.use(express.json());
app.use(cors());

app.post('/like', async (req, res) => {
    let { userId, postId } = req.body;

    if (!userId || !postId) {
        return res.status(400).json({ error: 'Missing userId or postId' });
    }

    try {
        const response = await fetch(process.env.LAMBDA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ actorId: userId, postId }),
        });

        const result = await response.json();

        const message = {
            type: 'notification',
            data: { message: `User ${userId} liked a post!` }
        };
        clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(message));
            }
        });

        res.json(result);
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Failed to process like' });
    }
});

app.get('/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await pgClient.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
        [userId]
    );
    res.json(result.rows);
});

httpServer.listen(3000, () => {
    console.log('API running on http://localhost:3000');
});

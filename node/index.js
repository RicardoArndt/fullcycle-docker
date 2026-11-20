const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

const port = Number(process.env.APP_PORT || 3000);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const retryableErrors = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
    'PROTOCOL_CONNECTION_LOST'
]);

app.get('/', async (req, res) => {
    try {
        const randomName = `Person ${Math.floor(Math.random() * 1000)}`;

        await pool.query(
            'INSERT INTO people (name) VALUES (?)',
            [randomName]
        );

        const [people] = await pool.query(
            'SELECT id, name FROM people'
        );

        const response = people
            .map(person => `<li>${person.id}: ${person.name}</li>`)
            .join('');

        res.send(`<h1>Full Cycle Rocks!</h1><ul>${response}</ul>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function prepareDatabase() {
    const retryDelay = 3000;

    for (let attempt = 1; ; attempt++) {
        try {
            console.log(
                `Connecting to database at ${process.env.DB_HOST}:` +
                `${process.env.DB_PORT || 3306} ` +
                `(attempt ${attempt})...`
            );

            await pool.query(`
                CREATE TABLE IF NOT EXISTS people (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL
                )
            `);

            console.log('Table "people" is ready.');
            return;
        } catch (error) {
            if (!retryableErrors.has(error.code)) {
                throw error;
            }

            console.warn(
                `Database unavailable (${error.code}). Retrying in 3 seconds...`
            );

            await sleep(retryDelay);
        }
    }
}

async function bootstrap() {
    await prepareDatabase();

    app.listen(port, '0.0.0.0', () => {
        console.log(`App listening on port ${port}`);
    });
}

bootstrap().catch(async error => {
    console.error('Application startup failed:', error);

    try {
        await pool.end();
    } catch (closeError) {
        console.error('Failed to close database pool:', closeError);
    } finally {
        process.exitCode = 1;
    }
});

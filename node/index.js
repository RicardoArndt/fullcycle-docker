
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

app.get('/', async (req, res) => {
    try {
        const randomName = `Person ${Math.floor(Math.random() * 1000)}`;

        await pool.query(
            'INSERT INTO people (name) VALUES (?)',
            [randomName]
        );

        const [peoples] = await pool.query(
            'SELECT id, name FROM people'
        );

        const response = peoples
            .map(person => `<li>${person.id}: ${person.name}</li>`)
            .join('');

        res.send(`<h1>Full Cycle Rocks!</h1><ul>${response}</ul>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function bootstrap() {
    try {
        console.log(`Connecting to database at ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS people (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `);

        console.log('Table "people" is ready.');

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });

    } catch (error) {
        console.error('Application startup failed:', error);
        process.exit(1);
    }
}

bootstrap();

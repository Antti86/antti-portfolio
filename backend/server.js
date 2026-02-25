require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/db/pool');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test DB connection before starting API
    const result = await pool.query('SELECT NOW()');
    console.log('DB connected:', result.rows[0].now);

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

startServer();

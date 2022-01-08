import express from 'express';
import { Pool } from 'pg';

const app = express();
const port = 3000;

const pool = new Pool({
  host: 'localhost',
  database: 'webdb',
  port: 5432,
});

app.use(express.static('public'));

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory;');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
});

// 404 page
app.get('*', (req, res) => {
  res.redirect('/404.html');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

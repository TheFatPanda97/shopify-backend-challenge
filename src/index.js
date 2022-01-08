import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const port = 3000;

const pool = new Pool({
  host: 'localhost',
  database: 'webdb',
  port: 5432,
});

app.use(cors());
app.use(express.static('public'));

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory;');
    res.json(
      result.rows.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.id]: {
            name: curr.name,
            costPerUnit: curr.cost_per_unit.slice(1),
            stock: curr.stock,
            type: curr.type,
          },
        }),
        {},
      ),
    );
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

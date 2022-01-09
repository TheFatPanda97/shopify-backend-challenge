import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ValidationError } from './utils/errors';
import InventoryController from './controllers/inventory';

const app = express();
const inventory = new InventoryController();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Get all items
app.get('/api/inventory', async (__, res) => {
  try {
    const allItems = await inventory.getAllItems();
    res.json(allItems);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Add a new item
app.post('/api/inventory', async (req, res) => {
  const { name, costPerUnit, stock, type } = req.body;
  try {
    const newItems = await inventory.insertItem({ name, costPerUnit, stock, type });
    res.json(newItems);
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log(err.message);
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

// 404 page
app.get('*', (req, res) => {
  res.redirect('/404.html');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

import express from 'express';

import InventoryController from '../controllers/inventory';
import { ValidationError } from '../utils/errors';

const router = express.Router();
const inventory = new InventoryController();

// Get all items
router.get('/', async (_, res) => {
  try {
    const allItems = await inventory.getAllItems();
    res.json(allItems);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Add a new item
router.post('/', async (req, res) => {
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

export default router;

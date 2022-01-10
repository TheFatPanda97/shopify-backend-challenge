import express from 'express';

import InventoryController from '../controllers/inventory';
import { ValidationError } from '../utils/errors';

const router = express.Router();
const inventory = new InventoryController();

// Get all items
router.get('/items', async (_, res) => {
  try {
    const allItems = await inventory.getAllItems();
    res.json(allItems);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Export all data as CSV
router.get('/export-csv', async (_, res) => {
  try {
    const csv = await inventory.exportCSV();
    res.header('Content-Type', 'text/csv');
    res.attachment('inventory.csv');
    return res.send(csv);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Add a new item
router.post('/items', async (req, res) => {
  try {
    const newItems = await inventory.insertItems(req.body);
    res.json(newItems);
  } catch (err) {
    console.log(err);

    if (err instanceof ValidationError) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

// Delete items given an array of ids
router.post('/delete-items', async (req, res) => {
  try {
    const deletedItems = await inventory.deleteItems(req.body);
    res.json(deletedItems);
  } catch (err) {
    console.log(err);

    if (err instanceof ValidationError) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

// Update items given an object of items keyed by id
router.patch('/update-items', async (req, res) => {
  try {
    const updatedItems = await inventory.updateItems(req.body);
    res.json(updatedItems);
  } catch (err) {
    console.log(err);

    if (err instanceof ValidationError) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

export default router;

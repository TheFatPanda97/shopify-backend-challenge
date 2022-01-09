import { Pool } from 'pg';
import _ from 'underscore';

import { ValidationError } from '../utils/errors';
import { isPositiveInteger, isPositiveFloat } from '../utils/helpers';

class InventoryController {
  pool;

  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      database: 'webdb',
      port: 5432,
    });
  }

  static validateItemData({ name, costPerUnit, stock, type }) {
    const errors = [];

    if (!name || !_.isString(name)) {
      errors.push('Name must be a string');
    }

    if (!costPerUnit || !isPositiveFloat(costPerUnit)) {
      errors.push('Cost per unit must be a positive float');
    }

    if (!stock || !isPositiveInteger(stock)) {
      errors.push('Stock must be a positive integer');
    }

    if (!type || !_.isString(type)) {
      errors.push('Type must be a string');
    }

    return errors;
  }

  async getAllItems() {
    const result = await this.pool.query('SELECT * FROM inventory;');
    return result.rows.reduce(
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
    );
  }

  async insertItem({ name, costPerUnit, stock, type }) {
    const errors = InventoryController.validateItemData({ name, costPerUnit, stock, type });

    if (!_.isEmpty(errors)) {
      throw new ValidationError(errors);
    }

    const result = await this.pool.query(
      'INSERT INTO inventory(name, cost_per_unit, stock, type) VALUES($1, $2, $3, $4) RETURNING *',
      [name, Number(costPerUnit), Number(stock), type],
    );
    return result.rows.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          name: curr.name.trim(),
          costPerUnit: curr.cost_per_unit.slice(1),
          stock: curr.stock,
          type: curr.type.trim(),
        },
      }),
      {},
    );
  }
}

export default InventoryController;

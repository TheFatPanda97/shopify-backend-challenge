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

  static validateItemData({ name, costPerUnit, stock, type }, skipValidation = {}) {
    const errors = [];

    if ((!skipValidation.name && !name) || !_.isString(name)) {
      errors.push('Name must be a string');
    }

    if ((!skipValidation.costPerUnit && !costPerUnit) || !isPositiveFloat(costPerUnit)) {
      errors.push('Cost per unit must be a positive float');
    }

    if ((!skipValidation.stock && !stock) || !isPositiveInteger(stock)) {
      errors.push('Stock must be a positive integer');
    }

    if ((!skipValidation.type && !type) || !_.isString(type)) {
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

  async insertItems(items) {
    if (_.isEmpty(items)) {
      throw new ValidationError('Items can not be empty');
    }

    const values = items.reduce((acc, item, index) => {
      if (!_.isObject(item)) {
        throw new ValidationError('Items must be an array of objects');
      }

      const { name, costPerUnit, stock, type } = item;
      const errors = InventoryController.validateItemData({ name, costPerUnit, stock, type });

      if (!_.isEmpty(errors)) {
        throw new ValidationError(`Item ${index}: ${errors}`);
      }

      return [...acc, name, Number(costPerUnit), Number(stock), type];
    }, []);

    /**
     * An query string of the form:
     * INSERT INTO inventory(name, ..) VALUES($1,..),($5,...)... RETURNING *
     *  */
    const query = `INSERT INTO inventory(name, cost_per_unit, stock, type) VALUES${items
      .map(
        (item, itemIndex) =>
          `(${Object.keys(item)
            .map(
              (__, attributeIndex) =>
                `$${itemIndex * Object.keys(item).length + attributeIndex + 1}`,
            )
            .join(',')})`,
      )
      .join(',')} RETURNING *`;

    const result = await this.pool.query(query, values);
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

  async deleteItems(ids) {
    if (!_.isArray(ids)) {
      throw new ValidationError('Ids must be an array');
    }

    if (_.isEmpty(ids)) {
      throw new ValidationError('Ids can not be empty');
    }

    ids.forEach((id) => {
      if (!isPositiveInteger(id)) {
        throw new ValidationError('Ids must be positive integers');
      }
    });

    let query = `SELECT * FROM inventory WHERE id IN (${ids
      .map((__, index) => `$${index + 1}`)
      .join(',')});`;

    let result = await this.pool.query(query, ids);
    if (result.rowCount !== ids.length) {
      throw new ValidationError('One or more ids do not exist');
    }

    query = `DELETE FROM inventory WHERE id IN (${ids
      .map((__, index) => `$${index + 1}`)
      .join(',')}) RETURNING *`;

    result = await this.pool.query(query, ids);

    if (result.rowCount === 0) {
      throw new ValidationError('Item not found');
    }

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

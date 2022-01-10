/* eslint-disable max-len */
/* eslint-disable indent */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { parse } from 'json2csv';
import _ from 'underscore';

import { ValidationError } from '../utils/errors';
import { isPositiveInteger, isPositiveFloat } from '../utils/helpers';

dotenv.config();

/**
 * @constructor none
 * @description The controller for the inventory model
 * @example
 * const inventory = new InventoryController();
 */
class InventoryController {
  pool;

  constructor() {
    const configuration = {
      connectionString: process.env.DATABASE_URL,
    };

    if (process.env.NODE_ENV === 'production') {
      configuration.ssl = {
        rejectUnauthorized: false,
      };
    }

    this.pool = new Pool(configuration);
  }

  /**
   * @param {{name: string, costPerUnit: string|number, stock: string|number, type: string}} data
   * - The data to validate
   * @param {{name?: boolean, costPerUnit?: boolean, stock?: boolean, type?: boolean}} skipValidation
   * - An object containing the keys of the data to skip validation, default {}
   * @returns {string[]} A array of error messages
   * @description Validates the given data with the following rules:
   * - name: string, not empty
   * - costPerUnit: positive number (including 0)
   * - stock: positive integer (including 0)
   * - type: string, not empty
   */
  static validateItemData({ name, costPerUnit, stock, type }, skipValidation = {}) {
    const errors = [];

    if (!skipValidation.name) {
      if (!_.isString(name)) {
        errors.push('Name must be a string');
      } else if (name === '') {
        errors.push('Name cannot be empty');
      }
    }

    if (!skipValidation.costPerUnit && !isPositiveFloat(costPerUnit)) {
      errors.push('Cost per unit must be a positive float');
    }

    if (!skipValidation.stock && !isPositiveInteger(stock)) {
      errors.push('Stock must be a positive integer');
    }

    if (!skipValidation.type && !type) {
      if (!_.isString(type)) {
        errors.push('Type must be a string');
      } else if (type === '') {
        errors.push('Type cannot be empty');
      }
    }

    return errors;
  }

  /**
   * @param {{name: string, cost_per_unit: string, stock: string, type: string}[]} rows
   * The rows returned from the database
   * @returns {{
   *  [key: string]: {name: string, costPerUnit: string, stock: string, type: string}
   * }}
   * Data keyed by id
   * @description Parses the given rows into a data object keyed by id
   */
  static parsedReturnedItems(rows) {
    return rows.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.id]: {
          name: _.isUndefined(curr.name) || _.isNull(curr.name) ? undefined : curr.name,
          costPerUnit:
            _.isUndefined(curr.cost_per_unit) || _.isNull(curr.cost_per_unit)
              ? undefined
              : curr.cost_per_unit.slice(1),
          stock: _.isUndefined(curr.stock) || _.isNull(curr.stock) ? undefined : curr.stock,
          type: _.isUndefined(curr.type) || _.isNull(curr.type) ? undefined : curr.type,
        },
      }),
      {},
    );
  }

  /**
   *
   * @returns {Promise<{[key: string]: {name: string, costPerUnit: string, stock: string, type: string}}>}
   * A promise that resolves to the all the data keyed by id
   * @description Gets all the data from the inventory table
   */
  async getAllItems() {
    const result = await this.pool.query('SELECT * FROM inventory;');
    return InventoryController.parsedReturnedItems(result.rows);
  }

  /**
   *
   * @param {{name: string, costPerUnit: string, stock: string, type: string}[]} items
   * The items to be inserted
   * @returns {Promise<{[key: string]: {name: string, costPerUnit: string, stock: string, type: string}}>}
   * A promise that resolves to the inserted data keyed by id
   * @description Inserts the given items into the inventory table
   */
  async insertItems(items) {
    if (_.isEmpty(items)) {
      throw new ValidationError('Items can not be empty');
    }

    const values = items.reduce((acc, item, index) => {
      if (_.isArray(item) || !_.isObject(item)) {
        throw new ValidationError('Items must be an array of objects');
      }

      const { name, costPerUnit, stock, type } = item;
      const errors = InventoryController.validateItemData({ name, costPerUnit, stock, type });

      if (!_.isEmpty(errors)) {
        throw new ValidationError(`Item number ${index}: ${errors}`);
      }

      return [...acc, name.trim(), Number(costPerUnit), Number(stock), type.trim()];
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
    return InventoryController.parsedReturnedItems(result.rows);
  }

  /**
   *
   * @param {string[]} ids
   * The items to be deleted
   * @returns {Promise<{[key: string]: {name: string, costPerUnit: string, stock: string, type: string}}>}
   * A promise that resolves to the deleted data keyed by id
   * @description Deletes the given items from the inventory table
   */
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

    // check if the ids exist
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

    return result.rows.map(({ id }) => id);
  }

  /**
   *
   * @param {{
   *  [key: string]: {name: string, costPerUnit: string, stock: string, type: string}
   * }} items
   * @returns {Promise<{[key: string]: {name?: string, costPerUnit?: string, stock?: string, type?: string}}>}
   * @description Updates the given items in the inventory table. Note: not all attributes have to be provided
   * If an attribute is not provided, it will not be updated
   */
  async updateItems(items) {
    if (!_.isObject(items) && !_.isArray(items)) {
      throw new ValidationError('Items must be an object');
    }

    const ids = Object.keys(items);

    ids.forEach((id) => {
      if (!isPositiveInteger(id)) {
        throw new ValidationError('Ids must be positive integers');
      }
    });

    // check if the ids exist
    let query = `SELECT * FROM inventory WHERE id IN (${ids
      .map((__, index) => `$${index + 1}`)
      .join(',')});`;

    let result = await this.pool.query(query, ids);
    if (result.rowCount !== ids.length) {
      throw new ValidationError('One or more ids do not exist');
    }

    const values = Object.entries(items).reduce((acc, [id, item]) => {
      if (_.isArray(item) || !_.isObject(item)) {
        throw new ValidationError('Items must be an array of objects');
      }

      if (_.isEmpty(item)) {
        throw new ValidationError('Item can not be empty');
      }

      const { name, costPerUnit, stock, type } = item;
      const errors = InventoryController.validateItemData(
        { name, costPerUnit, stock, type },
        {
          name: _.isUndefined(name),
          costPerUnit: _.isUndefined(costPerUnit),
          stock: _.isUndefined(stock),
          type: _.isUndefined(type),
        },
      );

      if (!_.isEmpty(errors)) {
        throw new ValidationError(`Item id ${id}: ${errors}`);
      }

      return [
        ...acc,
        Number(id),
        _.isUndefined(name) ? null : name.trim(),
        _.isUndefined(costPerUnit) ? null : Number(costPerUnit),
        _.isUndefined(stock) ? null : Number(stock),
        _.isUndefined(type) ? null : type.trim(),
      ];
    }, []);

    /**
     * An query string of the form:
     * UPDATE inventory
     * SET name = CASE
     *                WHEN tmp.name IS NULL THEN inventory.name
     *                ELSE tmp.name
     *     END
     * ...
     * FROM (values ($1, ...), ($6, ...)) AS tmp (id, name, ...)
     * WHERE inventory.id = tmp.id;
     *  */
    query = `
      UPDATE inventory
      SET name = CASE
                    WHEN tmp.name IS NULL THEN inventory.name
                    ELSE tmp.name
          END,
          cost_per_unit = CASE
                    WHEN tmp.cost_per_unit::MONEY IS NULL THEN inventory.cost_per_unit
                    ELSE tmp.cost_per_unit::MONEY
          END,
          stock = CASE
                    WHEN tmp.stock::INT IS NULL THEN inventory.stock
                    ELSE tmp.stock::INT
          END,
          type = CASE
                    WHEN tmp.type IS NULL THEN inventory.type
                    ELSE tmp.type
          END
      FROM (VALUES${Object.entries(items)
        .map(
          (__, itemIndex) =>
            `(${[...new Array(5)]
              .map((___, attributeIndex) => `$${itemIndex * 5 + attributeIndex + 1}`)
              .join(',')})`,
        )
        .join(',')})
        AS tmp (id, name, cost_per_unit, stock, type)
      WHERE inventory.id = tmp.id::INT
      RETURNING *, tmp.cost_per_unit::MONEY;
    `;

    result = await this.pool.query(query, values);
    return InventoryController.parsedReturnedItems(result.rows);
  }

  /**
   *
   * @returns {Promise<string>}
   * @description Returns the current date into a CSV
   */
  async exportCSV() {
    const query = 'SELECT * FROM inventory';
    const result = await this.pool.query(query);

    const fields = ['id', 'name', 'cost_per_unit', 'stock', 'type'];
    const opts = { fields };

    return parse(result.rows, opts);
  }
}

export default InventoryController;

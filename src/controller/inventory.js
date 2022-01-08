import { Pool } from 'pg';

class Inventory {
  pool;

  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      database: 'webdb',
      port: 5432,
    });
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
    const result = await this.pool.query(
      'INSERT INTO inventory(name, cost_per_unit, stock, type) VALUES($1, $2, $3, $4) RETURNING *',
      [name, costPerUnit, stock, type],
    );
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
}

export default Inventory;

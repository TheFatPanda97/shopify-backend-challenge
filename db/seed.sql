DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost_per_unit MONEY NOT NULL,
    stock INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    CHECK (name <> ''),
    CHECK (type <> '')
);
INSERT INTO inventory (name, cost_per_unit, stock, type) 
VALUES (
  'apple',
  '0.50',
  '1000',
  'fruit'
);
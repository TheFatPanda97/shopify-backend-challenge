# Overview

This repo contains the source code for the Shopify Summer 2022 [Backend Developer Intern Challenge](https://docs.google.com/document/d/1z9LZ_kZBUbg-O2MhZVVSqTmvDko5IJWHtuFmIu_Xg1A/edit). I hope you enjoy reading through it 😄

# Project Description

This project is a simple CRUD application that allows you to create, read, update, and delete inventory items. The application is built with Express.js and hosted on Heroku with PostgreSQL as the database.

# Project Structure

**Technologies used:**

- node.js (node runtime)
- Express.js (javascript web framework)
- heroku (hosting platform)
- postgreSQL (database)
- html, css, javascript, and bootstrap (frontend)

**Important Folders:**

```
db/
├─ seed.sql (seed data for the database)
public (frontend code)/
src/
├─ controllers (controllers for each functionality)/
├─ routes (api endpoints for each functionality)/
├─ utils/
│  ├─ helpers.js (helper functions for the apps)
├─ index.js (api entry point)
```

# Setup

**Prerequisites:**

- Node.js v14+
- PostgreSQL

### Steps:

1. clone the repo
2. in your psql terminal, create a new database called `webdb`
3. run the command `sh setup.sh` to create the tables and seed the database. Note: if you are on a windows machine, you will need some extra steps such as setting up [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) to run the bash script.
4. run the command `npm run dev` to start the server
5. open the link `localhost:3000` to see the application

# Future Consideration

The application is designed to be very extendable. Currently, the only functionality implemented is `inventory`, but you can easily implement new functionalities by adding controllers and routes to the project.

# API

### `/api/inventory/items`:

- method: GET
- description: Returns all inventory items
- return type:

```
{
  id: {
    name: string,
    costPerunit: string,
    stock: number,
    type: string,
  }
}
```
- return example:

```json
{
  "1": {
    "name": "Water 1",
    "costPerUnit": "1.00",
    "stock": 10001,
    "type": "grocery"
  }
}
```

### `/api/inventory/export-csv`:

- method: GET
- description: Returns all inventory items in a csv file
- return type: `inventory.csv`
- return example:
```csv
"id","name","cost_per_unit","stock","type"
2,"Water","$0.70",1000,"food"
8,"Water","$0.70",1000,"food"
9,"Water","$0.70",1000,"grocery"
10,"Water","$0.70",1000,"food"
11,"Water","$0.70",1000,"grocery"
12,"Water","$0.70",1000,"food"
13,"give me water","$1.00",100,"grocery"
3,"Water 2","$2.00",10002,"food"
1,"Water 1","$1.00",10001,"grocery"
```

### `/api/inventory/items`:

- method: POST
- description: Add new items to the inventory and returns the new items if successful
- body type:
```
{
  id: {
    name: string,
    costPerunit: number,
    stock: number,
    type: string,
  }
}
```
- body example:
```json
{
  "1": {
    "name": "Water 1",
    "costPerUnit": 1,
    "stock": 10001,
    "type": "grocery"
  }
}
```
- return type:
```
{
  id: {
    name: string,
    costPerunit: string,
    stock: number,
    type: string,
  }
}
```
- return example:
```json
{
  "1": {
    "name": "Water 1",
    "costPerUnit": "1.00",
    "stock": 10001,
    "type": "grocery"
  }
}
```

### `/api/inventory/delete-items`:

- method: POST
- description: Delete items from the inventory and returns the ids of the deleted items if successful
- body type:
```
number[]
```
- body example:
```json
[1]
```

- return type:
```
number[]
```
- return example:
```json
[1]
```

### `/api/inventory/update-items`:

- method: POST
- description: Update items from the inventory and returns the updated attributes if successful
- body type:
```
{
  id: {
    name?: string,
    costPerunit?: number,
    stock?: number,
    type?: string,
  }
}
```
- body example:
```json
{
  "1": {
    "name": "Water 2",
    "type": "not grocery"
  }
}
```

- return type:
```
{
  id: {
    name?: string,
    costPerunit?: number,
    stock?: number,
    type?: string,
  }
}
```
- return example:
```json
{
  "1": {
    "name": "Water 2",
    "type": "not grocery"
  }
}
```
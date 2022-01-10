# Overview

This repo contains the source code for the Shopify Summer 2022 [Backend Developer Intern Challenge](https://docs.google.com/document/d/1z9LZ_kZBUbg-O2MhZVVSqTmvDko5IJWHtuFmIu_Xg1A/edit). I hope you enjoy reading through it 😄

# Project Description

This project is a simple CRUD application that allows you to create, read, update, and delete inventory items. The application is built with Express.js and hosted on Heroku with PostgreSQL as the database.

# Setup
Prerequisites:
- Node.js v14+
- PostgreSQL

### Steps:
1. clone the repo
2. in your psql terminal, create a new database called `webdb`
3. run the command `sh setup.sh` to create the tables and seed the database. Note: if you are on a windows machine, you will need some extra steps such as setting up [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) to run the bash script.
4. run the command `npm run dev` to start the server
5. open the link `localhost:3000` to see the application

# API

### `/api/inventory/items`:
- method: GET
- return: 
```
{
  [id]: {
    [name]: [string],
    [costPerunit]: [string],
    [stock]: [number],
    [type]: [string],
  }
}
```
- description: Returns all inventory items
- example:

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

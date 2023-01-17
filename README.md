# Cosmos-governance

Governance proposals notification/alert bot for Cosmos-based chains. 
Get all new proposals from any chain you want!

## Requirements

node.js >=17.*

## Setup

```
git clone https://github.com/testnetrunn/cosmos-governance.git
cd cosmos-governance
```

```
npm install
npx prisma db push
cp .env.sample .env
```

edit `.env` file.

edit `settings.json` file for adding new chain. 

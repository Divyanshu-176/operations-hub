# Backend Server

Express.js API server for Operations Hub.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (or it will auto-create on first run):
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_dum31zConSsh@ep-shy-morning-ah5kbj54-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   ```

3. **Start server:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /health` - Health check and database connection test
- `POST /api/manufacturing` - Create manufacturing record
- `GET /api/manufacturing` - Get all manufacturing records
- `POST /api/testing` - Create testing record
- `GET /api/testing` - Get all testing records
- `POST /api/field` - Create field service record
- `GET /api/field` - Get all field service records
- `POST /api/sales` - Create sales record
- `GET /api/sales` - Get all sales records

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:8080)



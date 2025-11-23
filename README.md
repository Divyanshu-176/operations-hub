# Operations Hub

Operations management system with PostgreSQL database integration for Manufacturing, Testing, Field Service, and Sales data entry.

## Architecture

```
Frontend (React) → Backend API (Express) → PostgreSQL (Neon.tech) → PowerBI/Zoho → Dashboard
```

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

Or use the combined command:
```bash
npm run setup:all
```

### 2. Set Up Database

1. Go to **Neon.tech Dashboard** → **SQL Editor**
2. Open `database/schema.sql` in your project
3. **Copy ALL the SQL code**
4. **Paste** into Neon.tech SQL Editor
5. Click **"Run"** to execute

This creates 4 tables:
- `manufacturing_records`
- `testing_records`
- `field_records`
- `sales_records`

### 3. Run the Application

**Option A: Double-click `START.bat`** (Windows - Easiest)

**Option B: Command Line**
```bash
npm run dev:all
```

This starts:
- Backend server on http://localhost:3001
- Frontend on http://localhost:8080

### 4. Access the Application

Open your browser: **http://localhost:8080**

## Project Structure

```
operations-hub/
├── server/                 # Backend API (Express + PostgreSQL)
│   ├── index.js           # API server
│   ├── package.json       # Backend dependencies
│   └── .env              # Database config (auto-created)
├── database/
│   └── schema.sql        # Run this in Neon.tech
├── src/
│   ├── pages/            # Form pages (Manufacturing, Testing, Field, Sales)
│   ├── services/
│   │   └── api.ts        # Frontend API client
│   └── ...
├── START.bat             # Double-click to start (Windows)
└── package.json          # Frontend dependencies
```

## API Endpoints

### Manufacturing
- `POST /api/manufacturing` - Create manufacturing record
- `GET /api/manufacturing` - Get all records

### Testing
- `POST /api/testing` - Create testing record
- `GET /api/testing` - Get all records

### Field Service
- `POST /api/field` - Create field service record
- `GET /api/field` - Get all records

### Sales
- `POST /api/sales` - Create sales record
- `GET /api/sales` - Get all records

### Health Check
- `GET /health` - Check server and database status

## Connect PowerBI or Zoho

### For PowerBI:

1. Open **PowerBI Desktop**
2. **Get Data** → **Database** → **PostgreSQL database**
3. Enter connection details:
   - Server: `ep-shy-morning-ah5kbj54-pooler.c-3.us-east-1.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `npg_dum31zConSsh`
4. Select the 4 tables
5. Create dashboards
6. Publish to PowerBI Service
7. Get embed URL
8. Add to `src/pages/Dashboard.tsx`:
   ```tsx
   <iframe 
     src="YOUR_POWERBI_EMBED_URL" 
     className="w-full h-screen border-0"
     title="Dashboard"
   />
   ```

### For Zoho Analytics:

1. Go to **Zoho Analytics**
2. Create **Data Source** → **PostgreSQL**
3. Enter same connection details as above
4. Import tables and create dashboards
5. Get embed code and add to `src/pages/Dashboard.tsx`

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
cd server && npm install
```

### "DATABASE_URL is not set"
The `.env` file auto-creates on first run. If you see this error, check `server/.env` exists.

### "relation does not exist" (database tables)
**You must run the SQL schema in Neon.tech!**
1. Open `database/schema.sql`
2. Copy all SQL
3. Paste in Neon.tech SQL Editor
4. Run it

### Port already in use
Change port in `server/.env`:
```env
PORT=3002
```

### Database connection fails
- Verify connection string in `server/.env`
- Check Neon.tech database is running
- Ensure SQL schema was executed

## Scripts

- `npm run dev` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm run dev:all` - Start both frontend and backend
- `npm run setup:all` - Install all dependencies
- `npm run build` - Build for production

## Technologies

- **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** PostgreSQL (Neon.tech)
- **Visualization:** PowerBI or Zoho Analytics

## License

Private project

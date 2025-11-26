const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
require('dotenv').config();

// Check if .env file exists, if not, create a template
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found. Creating template...');
  const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_dum31zConSsh@ep-shy-morning-ah5kbj54-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Server Configuration
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
`;
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with default values');
  // Reload env after creating file
  require('dotenv').config({ override: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('Please set DATABASE_URL in server/.env file');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// Manufacturing endpoints
app.post('/api/manufacturing', async (req, res) => {
  try {
    const { production_count, scrap_count, shift, machine_id } = req.body;
    
    const result = await pool.query(
      `INSERT INTO manufacturing_records (production_count, scrap_count, shift, machine_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [production_count, scrap_count, shift, machine_id]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating manufacturing record:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/manufacturing', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM manufacturing_records ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching manufacturing records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Testing endpoints
app.post('/api/testing', async (req, res) => {
  try {
    const { batch_id, passed, failed, defect_type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO testing_records (batch_id, passed, failed, defect_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [batch_id, passed, failed, defect_type]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating testing record:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/testing', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM testing_records ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching testing records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Field Service endpoints
app.post('/api/field', async (req, res) => {
  try {
    const { customer_issue, solution_given, technician_name } = req.body;
    
    const result = await pool.query(
      `INSERT INTO field_records (customer_issue, solution_given, technician_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [customer_issue, solution_given, technician_name]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating field record:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/field', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM field_records ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching field records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sales endpoints
app.post('/api/sales', async (req, res) => {
  try {
    const { order_id, customer_name, quantity, dispatch_date, payment_status } = req.body;
    
    const result = await pool.query(
      `INSERT INTO sales_records (order_id, customer_name, quantity, dispatch_date, payment_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, customer_name, quantity, dispatch_date, payment_status]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating sales record:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sales_records ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching sales records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize Gemini client (uses GEMINI_API_KEY from environment)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Chat with Gemini + database context
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set in server/.env' });
    }

    // Fetch recent data from each table (small samples to keep prompt size manageable)
    const [manufacturing, testing, field, sales] = await Promise.all([
      pool.query('SELECT * FROM manufacturing_records ORDER BY created_at DESC LIMIT 30'),
      pool.query('SELECT * FROM testing_records ORDER BY created_at DESC LIMIT 30'),
      pool.query('SELECT * FROM field_records ORDER BY created_at DESC LIMIT 30'),
      pool.query('SELECT * FROM sales_records ORDER BY created_at DESC LIMIT 30'),
    ]);

    const context = {
      manufacturing_records: manufacturing.rows,
      testing_records: testing.rows,
      field_records: field.rows,
      sales_records: sales.rows,
    };

    const prompt =
      "You are an operations assistant. Answer questions using ONLY the data provided from these PostgreSQL tables: " +
      "manufacturing_records, testing_records, field_records, sales_records.\n\n" +
      "Here is the latest data in JSON format:\n" +
      JSON.stringify(context, null, 2) +
      "\n\nUser question:\n" +
      message;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const answer = geminiResponse.text || 'No answer generated.';

    res.json({ answer });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

// Test database connection on startup
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`📅 Database time: ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in server/.env');
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  await testConnection();
});


-- Operations Hub Database Schema
-- Run this SQL in your Neon.tech PostgreSQL database

-- Manufacturing Records Table
CREATE TABLE IF NOT EXISTS manufacturing_records (
    id SERIAL PRIMARY KEY,
    production_count INTEGER NOT NULL,
    scrap_count INTEGER NOT NULL,
    shift VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testing Records Table
CREATE TABLE IF NOT EXISTS testing_records (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL,
    passed INTEGER NOT NULL,
    failed INTEGER NOT NULL,
    defect_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Field Service Records Table
CREATE TABLE IF NOT EXISTS field_records (
    id SERIAL PRIMARY KEY,
    customer_issue TEXT NOT NULL,
    solution_given TEXT NOT NULL,
    technician_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Records Table
CREATE TABLE IF NOT EXISTS sales_records (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    dispatch_date DATE NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_manufacturing_created_at ON manufacturing_records(created_at);
CREATE INDEX IF NOT EXISTS idx_manufacturing_machine_id ON manufacturing_records(machine_id);
CREATE INDEX IF NOT EXISTS idx_testing_batch_id ON testing_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_testing_created_at ON testing_records(created_at);
CREATE INDEX IF NOT EXISTS idx_field_created_at ON field_records(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales_records(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales_records(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_dispatch_date ON sales_records(dispatch_date);


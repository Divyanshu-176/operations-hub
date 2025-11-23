// API service for connecting to backend PostgreSQL API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ManufacturingRecord {
  production_count: number;
  scrap_count: number;
  shift: string;
  machine_id: string;
}

export interface TestingRecord {
  batch_id: string;
  passed: number;
  failed: number;
  defect_type: string;
}

export interface FieldRecord {
  customer_issue: string;
  solution_given: string;
  technician_name: string;
}

export interface SalesRecord {
  order_id: string;
  customer_name: string;
  quantity: number;
  dispatch_date: string;
  payment_status: string;
}

export const api = {
  manufacturing: {
    create: async (data: ManufacturingRecord) => {
      const response = await fetch(`${API_BASE_URL}/manufacturing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save manufacturing record' }));
        throw new Error(error.error || 'Failed to save manufacturing record');
      }
      
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/manufacturing`);
      if (!response.ok) throw new Error('Failed to fetch manufacturing records');
      return response.json();
    },
  },

  testing: {
    create: async (data: TestingRecord) => {
      const response = await fetch(`${API_BASE_URL}/testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save testing record' }));
        throw new Error(error.error || 'Failed to save testing record');
      }
      
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/testing`);
      if (!response.ok) throw new Error('Failed to fetch testing records');
      return response.json();
    },
  },

  field: {
    create: async (data: FieldRecord) => {
      const response = await fetch(`${API_BASE_URL}/field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save field record' }));
        throw new Error(error.error || 'Failed to save field record');
      }
      
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/field`);
      if (!response.ok) throw new Error('Failed to fetch field records');
      return response.json();
    },
  },

  sales: {
    create: async (data: SalesRecord) => {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save sales record' }));
        throw new Error(error.error || 'Failed to save sales record');
      }
      
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/sales`);
      if (!response.ok) throw new Error('Failed to fetch sales records');
      return response.json();
    },
  },
};



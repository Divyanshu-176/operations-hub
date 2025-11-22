// Mock API service to simulate backend calls
// Replace this with your actual AWS DynamoDB API calls when ready

interface ManufacturingRecord {
  production_count: number;
  scrap_count: number;
  shift: string;
  machine_id: string;
}

interface TestingRecord {
  batch_id: string;
  passed: number;
  failed: number;
  defect_type: string;
}

interface FieldRecord {
  customer_issue: string;
  solution_given: string;
  technician_name: string;
}

interface SalesRecord {
  order_id: string;
  customer_name: string;
  quantity: number;
  dispatch_date: string;
  payment_status: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  manufacturing: {
    create: async (data: ManufacturingRecord) => {
      await delay(500); // Simulate network delay
      console.log("Manufacturing record submitted:", data);
      return { success: true, data };
    },
  },

  testing: {
    create: async (data: TestingRecord) => {
      await delay(500);
      console.log("Testing record submitted:", data);
      return { success: true, data };
    },
  },

  field: {
    create: async (data: FieldRecord) => {
      await delay(500);
      console.log("Field service record submitted:", data);
      return { success: true, data };
    },
  },

  sales: {
    create: async (data: SalesRecord) => {
      await delay(500);
      console.log("Sales record submitted:", data);
      return { success: true, data };
    },
  },
};

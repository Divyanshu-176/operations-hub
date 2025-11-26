import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { format } from "date-fns";

interface ManufacturingRecord {
  id: number;
  production_count: number;
  scrap_count: number;
  shift: string;
  machine_id: string;
  created_at: string;
}

interface TestingRecord {
  id: number;
  batch_id: string;
  passed: number;
  failed: number;
  defect_type: string;
  created_at: string;
}

interface FieldRecord {
  id: number;
  customer_issue: string;
  solution_given: string;
  technician_name: string;
  created_at: string;
}

interface SalesRecord {
  id: number;
  order_id: string;
  customer_name: string;
  quantity: number;
  dispatch_date: string;
  payment_status: string;
  created_at: string;
}

const Recent = () => {
  // Fetch manufacturing records with auto-refresh every 5 seconds
  const { data: manufacturingData, isLoading: manufacturingLoading } = useQuery({
    queryKey: ["manufacturing-recent"],
    queryFn: async () => {
      const response = await api.manufacturing.getAll();
      return (response.data || []).slice(0, 5) as ManufacturingRecord[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch testing records with auto-refresh every 5 seconds
  const { data: testingData, isLoading: testingLoading } = useQuery({
    queryKey: ["testing-recent"],
    queryFn: async () => {
      const response = await api.testing.getAll();
      return (response.data || []).slice(0, 5) as TestingRecord[];
    },
    refetchInterval: 5000,
  });

  // Fetch field records with auto-refresh every 5 seconds
  const { data: fieldData, isLoading: fieldLoading } = useQuery({
    queryKey: ["field-recent"],
    queryFn: async () => {
      const response = await api.field.getAll();
      return (response.data || []).slice(0, 5) as FieldRecord[];
    },
    refetchInterval: 5000,
  });

  // Fetch sales records with auto-refresh every 5 seconds
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-recent"],
    queryFn: async () => {
      const response = await api.sales.getAll();
      return (response.data || []).slice(0, 5) as SalesRecord[];
    },
    refetchInterval: 5000,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>
              Last 5 records from each department (updates every 5 seconds)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="field" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="field">Field Service</TabsTrigger>
                <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
              </TabsList>

              {/* Field Service Tab */}
              <TabsContent value="field" className="mt-4">
                {fieldLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : fieldData && fieldData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer Issue</TableHead>
                        <TableHead>Solution Given</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fieldData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{record.customer_issue}</TableCell>
                          <TableCell className="max-w-xs truncate">{record.solution_given}</TableCell>
                          <TableCell>{record.technician_name}</TableCell>
                          <TableCell>{formatDate(record.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No records found</div>
                )}
              </TabsContent>

              {/* Manufacturing Tab */}
              <TabsContent value="manufacturing" className="mt-4">
                {manufacturingLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : manufacturingData && manufacturingData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Production Count</TableHead>
                        <TableHead>Scrap Count</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Machine ID</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manufacturingData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>{record.production_count}</TableCell>
                          <TableCell>{record.scrap_count}</TableCell>
                          <TableCell className="capitalize">{record.shift}</TableCell>
                          <TableCell>{record.machine_id}</TableCell>
                          <TableCell>{formatDate(record.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No records found</div>
                )}
              </TabsContent>

              {/* Sales Tab */}
              <TabsContent value="sales" className="mt-4">
                {salesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : salesData && salesData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Dispatch Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>{record.order_id}</TableCell>
                          <TableCell>{record.customer_name}</TableCell>
                          <TableCell>{record.quantity}</TableCell>
                          <TableCell>{record.dispatch_date}</TableCell>
                          <TableCell className="capitalize">{record.payment_status}</TableCell>
                          <TableCell>{formatDate(record.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No records found</div>
                )}
              </TabsContent>

              {/* Testing Tab */}
              <TabsContent value="testing" className="mt-4">
                {testingLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : testingData && testingData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Passed</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Defect Type</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testingData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>{record.batch_id}</TableCell>
                          <TableCell>{record.passed}</TableCell>
                          <TableCell>{record.failed}</TableCell>
                          <TableCell>{record.defect_type}</TableCell>
                          <TableCell>{formatDate(record.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No records found</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Recent;



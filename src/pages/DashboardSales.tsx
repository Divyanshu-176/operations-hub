import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { RefreshCw } from "lucide-react";

interface SalesRecord {
  id: number;
  order_id: string;
  customer_name: string;
  quantity: number;
  dispatch_date: string;
  payment_status: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardSales = () => {
  const [dateRange, setDateRange] = useState(365);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");

  const { data: allData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["sales-all"],
    queryFn: async () => {
      const response = await api.sales.getAll();
      return (response.data || []) as SalesRecord[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds when database updates
  });

  const handleRefresh = () => {
    refetch();
  };

  const filteredData = useMemo(() => {
    if (!allData) return [];
    
    const cutoffDate = subDays(new Date(), dateRange);
    let filtered = allData.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= cutoffDate;
    });

    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter(record => record.payment_status === selectedPaymentStatus);
    }

    if (selectedCustomer !== "all") {
      filtered = filtered.filter(record => record.customer_name === selectedCustomer);
    }

    return filtered;
  }, [allData, dateRange, selectedPaymentStatus, selectedCustomer]);

  // KPIs (assuming a unit price for revenue calculation - you can adjust this)
  const UNIT_PRICE = 100; // Adjust based on your actual pricing
  const kpis = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalOrders: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
      };
    }

    const totalOrders = filteredData.length;
    const totalQuantity = filteredData.reduce((sum, r) => sum + r.quantity, 0);
    const totalRevenue = totalQuantity * UNIT_PRICE; // Simplified revenue calculation
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalQuantity, totalRevenue, avgOrderValue };
  }, [filteredData]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    const statusMap = new Map<string, { count: number; quantity: number }>();
    
    filteredData.forEach(record => {
      const existing = statusMap.get(record.payment_status) || { count: 0, quantity: 0 };
      statusMap.set(record.payment_status, {
        count: existing.count + 1,
        quantity: existing.quantity + record.quantity,
      });
    });

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      orders: data.count,
      quantity: data.quantity,
    }));
  }, [filteredData]);

  const paymentPieData = useMemo(() => {
    return paymentStatusData.map(item => ({
      name: item.name,
      value: item.orders,
    }));
  }, [paymentStatusData]);

  // Customer performance
  const customerData = useMemo(() => {
    const customerMap = new Map<string, { orders: number; quantity: number }>();
    
    filteredData.forEach(record => {
      const existing = customerMap.get(record.customer_name) || { orders: 0, quantity: 0 };
      customerMap.set(record.customer_name, {
        orders: existing.orders + 1,
        quantity: existing.quantity + record.quantity,
      });
    });

    return Array.from(customerMap.entries())
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        quantity: data.quantity,
        revenue: data.quantity * UNIT_PRICE,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredData]);

  // Time series
  const timeSeriesData = useMemo(() => {
    const dayMap = new Map<string, { orders: number; quantity: number }>();
    
    filteredData.forEach(record => {
      const day = format(new Date(record.created_at), "MMM dd");
      const existing = dayMap.get(day) || { orders: 0, quantity: 0 };
      dayMap.set(day, {
        orders: existing.orders + 1,
        quantity: existing.quantity + record.quantity,
      });
    });

    return Array.from(dayMap.entries())
      .map(([day, data]) => ({
        day,
        orders: data.orders,
        quantity: data.quantity,
        revenue: data.quantity * UNIT_PRICE,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [filteredData]);

  // Dispatch date analysis
  const dispatchData = useMemo(() => {
    const monthMap = new Map<string, { orders: number; quantity: number }>();
    
    filteredData.forEach(record => {
      try {
        const month = format(new Date(record.dispatch_date), "MMM yyyy");
        const existing = monthMap.get(month) || { orders: 0, quantity: 0 };
        monthMap.set(month, {
          orders: existing.orders + 1,
          quantity: existing.quantity + record.quantity,
        });
      } catch {
        // Skip invalid dates
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        orders: data.orders,
        quantity: data.quantity,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredData]);

  const uniquePaymentStatuses = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.payment_status))).sort();
  }, [allData]);

  const uniqueCustomers = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.customer_name))).sort();
  }, [allData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
            <p className="text-muted-foreground">Real-time sales and revenue analytics</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefetching} variant="outline" size="lg">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter data by date range, payment status, and customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date Range (Days)</Label>
                <Input
                  type="number"
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value) || 30)}
                  min={1}
                  max={365}
                />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniquePaymentStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueCustomers.map(customer => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Units sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Estimated revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.avgOrderValue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
              <CardDescription>Orders by payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ orders: { label: "Orders", color: "#0088FE" }, quantity: { label: "Quantity", color: "#00C49F" } }}>
                <BarChart data={paymentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="orders" fill="#0088FE" />
                  <Bar dataKey="quantity" fill="#00C49F" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Payment Status Pie */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Breakdown</CardTitle>
              <CardDescription>Percentage of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Customers</CardTitle>
              <CardDescription>Orders and quantity by customer</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ orders: { label: "Orders", color: "#0088FE" }, quantity: { label: "Quantity", color: "#00C49F" } }}>
                <BarChart data={customerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="orders" fill="#0088FE" />
                  <Bar dataKey="quantity" fill="#00C49F" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Sales Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends Over Time</CardTitle>
              <CardDescription>Daily orders, quantity, and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ orders: { label: "Orders", color: "#0088FE" }, quantity: { label: "Quantity", color: "#00C49F" }, revenue: { label: "Revenue", color: "#FF8042" } }}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#0088FE" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="quantity" stroke="#00C49F" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF8042" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Dispatch Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Analysis</CardTitle>
              <CardDescription>Orders by dispatch month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ orders: { label: "Orders", color: "#0088FE" }, quantity: { label: "Quantity", color: "#00C49F" } }}>
                <BarChart data={dispatchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="orders" fill="#0088FE" />
                  <Bar dataKey="quantity" fill="#00C49F" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSales;

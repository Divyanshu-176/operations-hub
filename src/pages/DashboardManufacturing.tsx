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
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { RefreshCw } from "lucide-react";

interface ManufacturingRecord {
  id: number;
  production_count: number;
  scrap_count: number;
  shift: string;
  machine_id: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardManufacturing = () => {
  const [dateRange, setDateRange] = useState(30); // days
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [selectedMachine, setSelectedMachine] = useState<string>("all");

  const { data: allData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["manufacturing-all"],
    queryFn: async () => {
      const response = await api.manufacturing.getAll();
      return (response.data || []) as ManufacturingRecord[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds when database updates
  });

  const handleRefresh = () => {
    refetch();
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    if (!allData) return [];
    
    const cutoffDate = subDays(new Date(), dateRange);
    let filtered = allData.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= cutoffDate;
    });

    if (selectedShift !== "all") {
      filtered = filtered.filter(record => record.shift === selectedShift);
    }

    if (selectedMachine !== "all") {
      filtered = filtered.filter(record => record.machine_id === selectedMachine);
    }

    return filtered;
  }, [allData, dateRange, selectedShift, selectedMachine]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalProduction: 0,
        totalScrap: 0,
        efficiency: 0,
        avgProduction: 0,
      };
    }

    const totalProduction = filteredData.reduce((sum, r) => sum + r.production_count, 0);
    const totalScrap = filteredData.reduce((sum, r) => sum + r.scrap_count, 0);
    const efficiency = totalProduction > 0 ? ((totalProduction - totalScrap) / totalProduction * 100) : 0;
    const avgProduction = totalProduction / filteredData.length;

    return { totalProduction, totalScrap, efficiency, avgProduction };
  }, [filteredData]);

  // Data for charts
  const shiftData = useMemo(() => {
    const shiftMap = new Map<string, { production: number; scrap: number }>();
    
    filteredData.forEach(record => {
      const existing = shiftMap.get(record.shift) || { production: 0, scrap: 0 };
      shiftMap.set(record.shift, {
        production: existing.production + record.production_count,
        scrap: existing.scrap + record.scrap_count,
      });
    });

    return Array.from(shiftMap.entries()).map(([shift, data]) => ({
      name: shift.charAt(0).toUpperCase() + shift.slice(1),
      production: data.production,
      scrap: data.scrap,
    }));
  }, [filteredData]);

  const machineData = useMemo(() => {
    const machineMap = new Map<string, { production: number; scrap: number }>();
    
    filteredData.forEach(record => {
      const existing = machineMap.get(record.machine_id) || { production: 0, scrap: 0 };
      machineMap.set(record.machine_id, {
        production: existing.production + record.production_count,
        scrap: existing.scrap + record.scrap_count,
      });
    });

    return Array.from(machineMap.entries())
      .map(([machine, data]) => ({
        name: machine,
        production: data.production,
        scrap: data.scrap,
      }))
      .sort((a, b) => b.production - a.production)
      .slice(0, 10); // Top 10 machines
  }, [filteredData]);

  const timeSeriesData = useMemo(() => {
    const dayMap = new Map<string, { production: number; scrap: number }>();
    
    filteredData.forEach(record => {
      const day = format(new Date(record.created_at), "MMM dd");
      const existing = dayMap.get(day) || { production: 0, scrap: 0 };
      dayMap.set(day, {
        production: existing.production + record.production_count,
        scrap: existing.scrap + record.scrap_count,
      });
    });

    return Array.from(dayMap.entries())
      .map(([day, data]) => ({
        day,
        production: data.production,
        scrap: data.scrap,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [filteredData]);

  const pieData = useMemo(() => {
    return shiftData.map(item => ({
      name: item.name,
      value: item.production,
    }));
  }, [shiftData]);

  // Get unique machines and shifts for filters
  const uniqueMachines = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.machine_id))).sort();
  }, [allData]);

  const uniqueShifts = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.shift))).sort();
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
            <h1 className="text-3xl font-bold tracking-tight">Manufacturing Dashboard</h1>
            <p className="text-muted-foreground">Real-time production and scrap analytics</p>
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
            <CardDescription>Filter data by date range, shift, and machine</CardDescription>
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
                <Label>Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {uniqueShifts.map(shift => (
                      <SelectItem key={shift} value={shift}>
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Machine ID</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Machines</SelectItem>
                    {uniqueMachines.map(machine => (
                      <SelectItem key={machine} value={machine}>
                        {machine}
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
              <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalProduction.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Units produced</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scrap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kpis.totalScrap.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Units scrapped</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.efficiency.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Production efficiency</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.avgProduction.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Per record</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Production vs Scrap by Shift */}
          <Card>
            <CardHeader>
              <CardTitle>Production vs Scrap by Shift</CardTitle>
              <CardDescription>Comparison of production and scrap by shift</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ production: { label: "Production", color: "#0088FE" }, scrap: { label: "Scrap", color: "#FF8042" } }}>
                <BarChart data={shiftData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="production" fill="#0088FE" />
                  <Bar dataKey="scrap" fill="#FF8042" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Production Distribution by Shift (Pie) */}
          <Card>
            <CardHeader>
              <CardTitle>Production Distribution by Shift</CardTitle>
              <CardDescription>Percentage of production by shift</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Machines */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Machines</CardTitle>
              <CardDescription>Production and scrap by machine</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ production: { label: "Production", color: "#0088FE" }, scrap: { label: "Scrap", color: "#FF8042" } }}>
                <BarChart data={machineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="production" fill="#0088FE" />
                  <Bar dataKey="scrap" fill="#FF8042" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Time Series */}
          <Card>
            <CardHeader>
              <CardTitle>Production Over Time</CardTitle>
              <CardDescription>Daily production and scrap trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ production: { label: "Production", color: "#0088FE" }, scrap: { label: "Scrap", color: "#FF8042" } }}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="production" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="scrap" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardManufacturing;

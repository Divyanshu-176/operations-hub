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

interface TestingRecord {
  id: number;
  batch_id: string;
  passed: number;
  failed: number;
  defect_type: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const DashboardTesting = () => {
  const [dateRange, setDateRange] = useState(30);
  const [selectedDefectType, setSelectedDefectType] = useState<string>("all");

  const { data: allData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["testing-all"],
    queryFn: async () => {
      const response = await api.testing.getAll();
      return (response.data || []) as TestingRecord[];
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

    if (selectedDefectType !== "all") {
      filtered = filtered.filter(record => record.defect_type === selectedDefectType);
    }

    return filtered;
  }, [allData, dateRange, selectedDefectType]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalPassed: 0,
        totalFailed: 0,
        passRate: 0,
        totalTested: 0,
      };
    }

    const totalPassed = filteredData.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = filteredData.reduce((sum, r) => sum + r.failed, 0);
    const totalTested = totalPassed + totalFailed;
    const passRate = totalTested > 0 ? (totalPassed / totalTested * 100) : 0;

    return { totalPassed, totalFailed, passRate, totalTested };
  }, [filteredData]);

  // Defect type distribution
  const defectData = useMemo(() => {
    const defectMap = new Map<string, { passed: number; failed: number }>();
    
    filteredData.forEach(record => {
      const existing = defectMap.get(record.defect_type) || { passed: 0, failed: 0 };
      defectMap.set(record.defect_type, {
        passed: existing.passed + record.passed,
        failed: existing.failed + record.failed,
      });
    });

    return Array.from(defectMap.entries())
      .map(([defect, data]) => ({
        name: defect,
        passed: data.passed,
        failed: data.failed,
        total: data.passed + data.failed,
      }))
      .sort((a, b) => b.failed - a.failed)
      .slice(0, 10);
  }, [filteredData]);

  const defectPieData = useMemo(() => {
    return defectData.map(item => ({
      name: item.name,
      value: item.failed,
    }));
  }, [defectData]);

  const timeSeriesData = useMemo(() => {
    const dayMap = new Map<string, { passed: number; failed: number }>();
    
    filteredData.forEach(record => {
      const day = format(new Date(record.created_at), "MMM dd");
      const existing = dayMap.get(day) || { passed: 0, failed: 0 };
      dayMap.set(day, {
        passed: existing.passed + record.passed,
        failed: existing.failed + record.failed,
      });
    });

    return Array.from(dayMap.entries())
      .map(([day, data]) => ({
        day,
        passed: data.passed,
        failed: data.failed,
        passRate: data.passed + data.failed > 0 ? (data.passed / (data.passed + data.failed) * 100) : 0,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [filteredData]);

  const batchData = useMemo(() => {
    return filteredData
      .map(record => ({
        name: record.batch_id,
        passed: record.passed,
        failed: record.failed,
        passRate: record.passed + record.failed > 0 ? (record.passed / (record.passed + record.failed) * 100) : 0,
      }))
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 10);
  }, [filteredData]);

  const uniqueDefectTypes = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.defect_type))).sort();
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
            <h1 className="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
            <p className="text-muted-foreground">Real-time quality testing analytics</p>
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
            <CardDescription>Filter data by date range and defect type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Defect Type</Label>
                <Select value={selectedDefectType} onValueChange={setSelectedDefectType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Defect Types</SelectItem>
                    {uniqueDefectTypes.map(defect => (
                      <SelectItem key={defect} value={defect}>
                        {defect}
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
              <CardTitle className="text-sm font-medium">Total Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{kpis.totalPassed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Units passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kpis.totalFailed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Units failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalTested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total units</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Passed vs Failed by Defect Type */}
          <Card>
            <CardHeader>
              <CardTitle>Passed vs Failed by Defect Type</CardTitle>
              <CardDescription>Top 10 defect types</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ passed: { label: "Passed", color: "#00C49F" }, failed: { label: "Failed", color: "#FF8042" } }}>
                <BarChart data={defectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="passed" fill="#00C49F" />
                  <Bar dataKey="failed" fill="#FF8042" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Defect Type Distribution (Pie) */}
          <Card>
            <CardHeader>
              <CardTitle>Defect Type Distribution</CardTitle>
              <CardDescription>Failed units by defect type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={defectPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {defectPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Batches by Pass Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Batches by Pass Rate</CardTitle>
              <CardDescription>Best performing batches</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ passRate: { label: "Pass Rate %", color: "#0088FE" } }}>
                <BarChart data={batchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="passRate" fill="#0088FE" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Time Series */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Trends Over Time</CardTitle>
              <CardDescription>Daily passed, failed, and pass rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ passed: { label: "Passed", color: "#00C49F" }, failed: { label: "Failed", color: "#FF8042" }, passRate: { label: "Pass Rate %", color: "#0088FE" } }}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="passed" stroke="#00C49F" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="failed" stroke="#FF8042" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="passRate" stroke="#0088FE" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardTesting;

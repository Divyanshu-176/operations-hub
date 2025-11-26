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

interface FieldRecord {
  id: number;
  customer_issue: string;
  solution_given: string;
  technician_name: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardFieldService = () => {
  const [dateRange, setDateRange] = useState(30);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");

  const { data: allData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["field-all"],
    queryFn: async () => {
      const response = await api.field.getAll();
      return (response.data || []) as FieldRecord[];
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

    if (selectedTechnician !== "all") {
      filtered = filtered.filter(record => record.technician_name === selectedTechnician);
    }

    return filtered;
  }, [allData, dateRange, selectedTechnician]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalIssues: 0,
        uniqueTechnicians: 0,
        avgIssuesPerDay: 0,
        totalSolutions: 0,
      };
    }

    const totalIssues = filteredData.length;
    const uniqueTechnicians = new Set(filteredData.map(r => r.technician_name)).size;
    const days = dateRange;
    const avgIssuesPerDay = days > 0 ? totalIssues / days : 0;
    const totalSolutions = filteredData.length;

    return { totalIssues, uniqueTechnicians, avgIssuesPerDay, totalSolutions };
  }, [filteredData, dateRange]);

  // Technician performance
  const technicianData = useMemo(() => {
    const techMap = new Map<string, number>();
    
    filteredData.forEach(record => {
      const count = techMap.get(record.technician_name) || 0;
      techMap.set(record.technician_name, count + 1);
    });

    return Array.from(techMap.entries())
      .map(([name, count]) => ({
        name,
        issues: count,
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 10);
  }, [filteredData]);

  const technicianPieData = useMemo(() => {
    return technicianData.map(item => ({
      name: item.name,
      value: item.issues,
    }));
  }, [technicianData]);

  // Time series
  const timeSeriesData = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    filteredData.forEach(record => {
      const day = format(new Date(record.created_at), "MMM dd");
      const count = dayMap.get(day) || 0;
      dayMap.set(day, count + 1);
    });

    return Array.from(dayMap.entries())
      .map(([day, count]) => ({
        day,
        issues: count,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [filteredData]);

  // Issue keywords (simple extraction from customer_issue)
  const issueKeywords = useMemo(() => {
    const keywordMap = new Map<string, number>();
    const commonWords = ['error', 'broken', 'not working', 'slow', 'down', 'issue', 'problem', 'fault'];
    
    filteredData.forEach(record => {
      const issueLower = record.customer_issue.toLowerCase();
      commonWords.forEach(word => {
        if (issueLower.includes(word)) {
          const count = keywordMap.get(word) || 0;
          keywordMap.set(word, count + 1);
        }
      });
    });

    return Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredData]);

  const uniqueTechnicians = useMemo(() => {
    if (!allData) return [];
    return Array.from(new Set(allData.map(r => r.technician_name))).sort();
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
            <h1 className="text-3xl font-bold tracking-tight">Field Service Dashboard</h1>
            <p className="text-muted-foreground">Real-time customer issue and solution analytics</p>
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
            <CardDescription>Filter data by date range and technician</CardDescription>
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
                <Label>Technician</Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {uniqueTechnicians.map(tech => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
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
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalIssues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Issues reported</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.uniqueTechnicians}</div>
              <p className="text-xs text-muted-foreground">Active technicians</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Issues/Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.avgIssuesPerDay.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Daily average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solutions Provided</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalSolutions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total solutions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Technician Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Technicians</CardTitle>
              <CardDescription>Issues handled by technician</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ issues: { label: "Issues", color: "#0088FE" } }}>
                <BarChart data={technicianData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="issues" fill="#0088FE" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Technician Distribution (Pie) */}
          <Card>
            <CardHeader>
              <CardTitle>Technician Distribution</CardTitle>
              <CardDescription>Workload by technician</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <PieChart>
                  <Pie
                    data={technicianPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {technicianPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Issue Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issue Keywords</CardTitle>
              <CardDescription>Most mentioned keywords in issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: "Count", color: "#FF8042" } }}>
                <BarChart data={issueKeywords}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="#FF8042" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Time Series */}
          <Card>
            <CardHeader>
              <CardTitle>Issues Over Time</CardTitle>
              <CardDescription>Daily issue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ issues: { label: "Issues", color: "#0088FE" } }}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="issues" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardFieldService;

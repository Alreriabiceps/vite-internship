import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Building2,
  GraduationCap,
  Shield,
  TrendingUp,
  Activity,
  MapPin,
  Target,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../../lib/api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [period, setPeriod] = useState("month");
  const [reportData, setReportData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const reportTypes = [
    { value: "overview", label: "Platform Overview", icon: Activity },
    { value: "user-registrations", label: "User Registrations", icon: Users },
    {
      value: "student-programs",
      label: "Student Programs",
      icon: GraduationCap,
    },
    {
      value: "company-industries",
      label: "Company Industries",
      icon: Building2,
    },
    {
      value: "verification-status",
      label: "Verification Status",
      icon: Shield,
    },
    {
      value: "internship-readiness",
      label: "Internship Readiness",
      icon: Target,
    },
    { value: "activity-trends", label: "Activity Trends", icon: TrendingUp },
    {
      value: "engagement-metrics",
      label: "Engagement Metrics",
      icon: Activity,
    },
    {
      value: "geographic-distribution",
      label: "Geographic Distribution",
      icon: MapPin,
    },
  ];

  const fetchReportData = async (reportType = selectedReport) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        period: period,
      });

      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/reports?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const result = await response.json();
      setReportData(result.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, period, dateRange]);

  const handleReportChange = (newReport) => {
    setSelectedReport(newReport);
    setActiveTab(newReport);
  };

  const handleExportReport = () => {
    // Placeholder for export functionality
    toast.success("Export functionality coming soon!");
  };

  const renderOverviewCards = () => {
    if (!reportData.overview) return null;

    const { overview } = reportData;
    const cards = [
      {
        title: "Total Users",
        value: overview.totalUsers,
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Students",
        value: overview.totalStudents,
        icon: GraduationCap,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Total Companies",
        value: overview.totalCompanies,
        icon: Building2,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Verified Companies",
        value: overview.verifiedCompanies,
        icon: Shield,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        subtitle: `${overview.verificationRate}% verification rate`,
      },
      {
        title: "Internship Ready",
        value: overview.internshipReadyStudents,
        icon: Target,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        subtitle: `${overview.readinessRate}% readiness rate`,
      },
      {
        title: "Hidden Profiles",
        value: overview.hiddenStudents + overview.hiddenCompanies,
        icon: Activity,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        subtitle: `${overview.hiddenStudents} students, ${overview.hiddenCompanies} companies`,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderBarChart = (data, dataKey, nameKey = "_id") => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (data, dataKey, nameKey = "_id") => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = (data, dataKey, nameKey = "_id") => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = (data, dataKey, nameKey = "_id") => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "overview":
        return <div className="space-y-6">{renderOverviewCards()}</div>;

      case "user-registrations":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {renderAreaChart(reportData.registrations, "count", "_id")}
              </CardContent>
            </Card>
          </div>
        );

      case "student-programs":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Program Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(reportData.programStats, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Program Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.programStats?.map((program, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {program._id || "Unknown"}
                      </span>
                      <Badge variant="secondary">
                        {program.count} students
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "company-industries":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Industry Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.industryStats, "count")}
              </CardContent>
            </Card>
          </div>
        );

      case "verification-status":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(reportData.verificationStats, "count")}
              </CardContent>
            </Card>
          </div>
        );

      case "internship-readiness":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internship Readiness by Program</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.readinessStats, "readinessRate")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Readiness Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.readinessStats?.map((program, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">
                          {program._id || "Unknown"}
                        </span>
                        <p className="text-sm text-gray-600">
                          {program.ready} ready / {program.total} total
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {program.readinessRate?.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "activity-trends":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLineChart(reportData.studentActivity, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Company Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLineChart(reportData.companyActivity, "count")}
              </CardContent>
            </Card>
          </div>
        );

      case "engagement-metrics":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.engagement?.studentsWithData}
                    </p>
                    <p className="text-sm text-gray-600">
                      Students with Profile Data
                    </p>
                    <p className="text-xs text-gray-500">
                      {reportData.engagement?.studentEngagementRate}% engagement
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.engagement?.companiesWithData}
                    </p>
                    <p className="text-sm text-gray-600">
                      Companies with Profile Data
                    </p>
                    <p className="text-xs text-gray-500">
                      {reportData.engagement?.companyEngagementRate}% engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "geographic-distribution":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.studentLocations?.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {location._id || "Unknown"}
                      </span>
                      <Badge variant="secondary">
                        {location.count} students
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Company Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.companyLocations?.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {location._id || "Unknown"}
                      </span>
                      <Badge variant="secondary">
                        {location.count} companies
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Select a report type to view data
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchReportData()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReport} onValueChange={handleReportChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          renderReportContent()
        )}
      </div>
    </div>
  );
};

export default Reports;

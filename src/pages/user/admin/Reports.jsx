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
      value: "student-year-levels",
      label: "Student Year Levels",
      icon: GraduationCap,
    },
    {
      value: "company-industries",
      label: "Company Industries",
      icon: Building2,
    },
    {
      value: "company-sizes",
      label: "Company Sizes",
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
    {
      value: "internship-postings",
      label: "Internship Postings",
      icon: Building2,
    },
    {
      value: "applications",
      label: "Applications",
      icon: Users,
    },
    {
      value: "evaluations",
      label: "Evaluations",
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
    try {
      if (!reportData || Object.keys(reportData).length === 0) {
        toast.error("No data to export");
        return;
      }

      // Convert report data to CSV format
      let csvContent = "";
      const reportName = reportTypes.find((r) => r.value === selectedReport)?.label || "Report";
      csvContent += `${reportName}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Handle different report types
      switch (selectedReport) {
        case "overview":
          csvContent += "Metric,Value\n";
          Object.entries(reportData.overview || {}).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              csvContent += `${key},\n`;
              Object.entries(value).forEach(([subKey, subValue]) => {
                csvContent += `  ${subKey},${subValue}\n`;
              });
            } else {
              csvContent += `${key},${value}\n`;
            }
          });
          break;

        case "user-registrations":
          csvContent += "Date,Total,Students,Companies,Admins\n";
          (reportData.registrations || []).forEach((reg) => {
            csvContent += `${reg.dateLabel || reg._id},${reg.count},${reg.students || 0},${reg.companies || 0},${reg.admins || 0}\n`;
          });
          break;

        case "student-programs":
        case "student-year-levels":
        case "company-industries":
        case "company-sizes":
          const dataKey = selectedReport.includes("student")
            ? selectedReport.includes("program")
              ? "programStats"
              : "yearLevelStats"
            : selectedReport.includes("industry")
            ? "industryStats"
            : "sizeStats";
          csvContent += "Category,Count,Percentage\n";
          (reportData[dataKey] || []).forEach((item) => {
            csvContent += `${item._id || "Unknown"},${item.count},${item.percentage || 0}%\n`;
          });
          break;

        case "internship-postings":
          csvContent += "Metric,Value\n";
          const postings = reportData.internshipPostings || {};
          csvContent += `Total Postings,${postings.total || 0}\n`;
          csvContent += `Active,${postings.active || 0}\n`;
          csvContent += `Closed,${postings.closed || 0}\n`;
          csvContent += `Pending Approval,${postings.pendingApproval || 0}\n`;
          csvContent += `Approved,${postings.approved || 0}\n`;
          csvContent += `Rejected,${postings.rejected || 0}\n\n`;
          csvContent += "Status,Count\n";
          (postings.byStatus || []).forEach((item) => {
            csvContent += `${item._id},${item.count}\n`;
          });
          break;

        case "applications":
          csvContent += "Metric,Value\n";
          const apps = reportData.applications || {};
          csvContent += `Total Applications,${apps.total || 0}\n`;
          csvContent += `Total Positions,${apps.totalPositions || 0}\n`;
          csvContent += `Application to Position Ratio,${apps.applicationToPositionRatio || 0}\n\n`;
          csvContent += "Company,Applications\n";
          (apps.byCompany || []).forEach((item) => {
            csvContent += `${item.companyName},${item.count}\n`;
          });
          break;

        case "evaluations":
          csvContent += "Metric,Value\n";
          const evals = reportData.evaluations || {};
          csvContent += `Total,${evals.total || 0}\n`;
          csvContent += `Pending,${evals.pending || 0}\n`;
          csvContent += `In Progress,${evals.inProgress || 0}\n`;
          csvContent += `Submitted,${evals.submitted || 0}\n`;
          csvContent += `Submission Rate,${evals.submissionRate || 0}%\n`;
          break;

        default:
          csvContent += JSON.stringify(reportData, null, 2);
      }

      // Create download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
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
        title: "Active Users",
        value: overview.activeUsers || 0,
        icon: Activity,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        subtitle: `${overview.activeUserRate || 0}% active rate`,
      },
      {
        title: "Internship Postings",
        value: overview.totalPostings || 0,
        icon: Building2,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      {
        title: "Total Applications",
        value: overview.totalApplications || 0,
        icon: Users,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
      },
      {
        title: "Total Evaluations",
        value: overview.totalEvaluations || 0,
        icon: Target,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
      },
      {
        title: "Hidden Profiles",
        value: (overview.hiddenStudents || 0) + (overview.hiddenCompanies || 0),
        icon: Activity,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        subtitle: `${overview.hiddenStudents || 0} students, ${overview.hiddenCompanies || 0} companies`,
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

    // Use dateLabel if available, otherwise use nameKey
    const labelKey = data[0]?.dateLabel ? "dateLabel" : nameKey;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={labelKey} 
            angle={-45}
            textAnchor="end"
            height={80}
          />
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

    // Use dateLabel if available, otherwise use nameKey
    const labelKey = data[0]?.dateLabel ? "dateLabel" : nameKey;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={labelKey}
            angle={-45}
            textAnchor="end"
            height={80}
          />
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
        return (
          <div className="space-y-6">
            {renderOverviewCards()}
            {reportData.overview?.recentActivity && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.overview.recentActivity.users || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Users</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.overview.recentActivity.students || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Students</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {reportData.overview.recentActivity.companies || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Companies</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">
                        {reportData.overview.recentActivity.postings || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Postings</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-600">
                        {reportData.overview.recentActivity.evaluations || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Evaluations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "user-registrations":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.registrations && reportData.registrations.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.registrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        name="Total"
                      />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stroke="#00C49F"
                        fill="#00C49F"
                        fillOpacity={0.6}
                        name="Students"
                      />
                      <Area
                        type="monotone"
                        dataKey="companies"
                        stroke="#FF8042"
                        fill="#FF8042"
                        fillOpacity={0.6}
                        name="Companies"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available
                  </div>
                )}
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
            <Card>
              <CardHeader>
                <CardTitle>Industry Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.industryStats?.map((industry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {industry._id || "Unknown"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {industry.count} companies
                        </Badge>
                        {industry.percentage && (
                          <span className="text-sm text-gray-500">
                            {industry.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "student-year-levels":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Year Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.yearLevelStats, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Year Level Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.yearLevelStats?.map((yearLevel, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {yearLevel._id || "Unknown"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {yearLevel.count} students
                        </Badge>
                        {yearLevel.percentage && (
                          <span className="text-sm text-gray-500">
                            {yearLevel.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "company-sizes":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(reportData.sizeStats, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Size Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.sizeStats?.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {size._id || "Unknown"} employees
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {size.count} companies
                        </Badge>
                        {size.percentage && (
                          <span className="text-sm text-gray-500">
                            {size.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "internship-postings":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.internshipPostings?.total || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Postings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.internshipPostings?.active || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Postings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {reportData.internshipPostings?.pendingApproval || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Postings by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(reportData.internshipPostings?.byStatus, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Postings by Industry</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.internshipPostings?.byIndustry, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Postings by Work Type</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.internshipPostings?.byWorkType, "count")}
              </CardContent>
            </Card>
          </div>
        );

      case "applications":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.applications?.total || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Applications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.applications?.totalPositions || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Positions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {reportData.applications?.applicationToPositionRatio || 0}
                    </p>
                    <p className="text-sm text-gray-600">Applications per Position</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Applications by Industry</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(reportData.applications?.byIndustry, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Companies by Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.applications?.byCompany?.map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {company.companyName || "Unknown"}
                      </span>
                      <Badge variant="secondary">
                        {company.count} applications
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "evaluations":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.evaluations?.total || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Evaluations</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {reportData.evaluations?.pending || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {reportData.evaluations?.inProgress || 0}
                    </p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {reportData.evaluations?.submitted || 0}
                    </p>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.evaluations?.submissionRate || 0}% rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Evaluations by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(reportData.evaluations?.byStatus, "count")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Evaluations Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.evaluations?.overTime && reportData.evaluations.overTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.evaluations.overTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        name="Total"
                      />
                      <Area
                        type="monotone"
                        dataKey="pending"
                        stroke="#FFBB28"
                        fill="#FFBB28"
                        fillOpacity={0.6}
                        name="Pending"
                      />
                      <Area
                        type="monotone"
                        dataKey="submitted"
                        stroke="#00C49F"
                        fill="#00C49F"
                        fillOpacity={0.6}
                        name="Submitted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available
                  </div>
                )}
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
                <CardTitle>Registration Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.studentActivity && reportData.companyActivity ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={reportData.studentActivity.map((item, index) => ({
                        ...item,
                        dateLabel: item.dateLabel || item._id,
                        students: item.count,
                        companies: reportData.companyActivity[index]?.count || 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#00C49F"
                        strokeWidth={2}
                        name="Students"
                      />
                      <Line
                        type="monotone"
                        dataKey="companies"
                        stroke="#FF8042"
                        strokeWidth={2}
                        name="Companies"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available
                  </div>
                )}
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

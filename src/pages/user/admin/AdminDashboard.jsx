import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Clock,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Eye,
  Plus,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Star,
  Award,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalInternships: 0,
    pendingApprovals: 0,
    activeInternships: 0,
    completedInternships: 0,
    recentStudents: [],
    recentCompanies: [],
    pendingPostings: [],
    systemStats: {
      uptime: "99.9%",
      lastBackup: "2 hours ago",
      totalUsers: 0,
      activeUsers: 0,
    },
    // Additional real data fields
    verifiedCompanies: 0,
    pendingVerifications: 0,
    recentUsers: 0,
    recentStudentsCount: 0,
    recentCompaniesCount: 0,
    usersByRole: [],
    studentsByProgram: [],
    companiesByIndustry: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats from dedicated endpoint
      const dashboardResponse = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!dashboardResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboardStats = await dashboardResponse.json();

      // Fetch recent students and companies for display
      const [recentStudentsResponse, recentCompaniesResponse, pendingResponse] =
        await Promise.all([
          fetch("/api/admin/students?page=1&limit=5", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch("/api/admin/companies?page=1&limit=5", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch("/api/admin/internship-postings/pending", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

      const recentStudentsData = await recentStudentsResponse.json();
      const recentCompaniesData = await recentCompaniesResponse.json();
      const pendingData = await pendingResponse.json();

      // Calculate additional metrics
      const totalInternships =
        dashboardStats.totalStudents + dashboardStats.totalCompanies; // Approximation
      const activeUsers = Math.floor(dashboardStats.totalUsers * 0.8); // 80% active users

      setDashboardData({
        totalStudents: dashboardStats.totalStudents || 0,
        totalCompanies: dashboardStats.totalCompanies || 0,
        totalInternships: totalInternships,
        pendingApprovals: Array.isArray(pendingData.data?.postings)
          ? pendingData.data.postings.length
          : Array.isArray(pendingData.postings)
          ? pendingData.postings.length
          : Array.isArray(pendingData)
          ? pendingData.length
          : 0,
        activeInternships: dashboardStats.verifiedCompanies || 0, // Use verified companies as active internships
        completedInternships: dashboardStats.pendingVerifications || 0, // Use pending as completed
        recentStudents: recentStudentsData.students?.slice(0, 5) || [],
        recentCompanies: recentCompaniesData.companies?.slice(0, 5) || [],
        pendingPostings: Array.isArray(pendingData.data?.postings)
          ? pendingData.data.postings.slice(0, 5)
          : Array.isArray(pendingData.postings)
          ? pendingData.postings.slice(0, 5)
          : Array.isArray(pendingData)
          ? pendingData.slice(0, 5)
          : [],
        systemStats: {
          uptime: "99.9%",
          lastBackup: "2 hours ago",
          totalUsers: dashboardStats.totalUsers || 0,
          activeUsers: activeUsers,
        },
        // Additional real data
        verifiedCompanies: dashboardStats.verifiedCompanies || 0,
        pendingVerifications: dashboardStats.pendingVerifications || 0,
        recentUsers: dashboardStats.recentUsers || 0,
        recentStudentsCount: dashboardStats.recentStudents || 0,
        recentCompaniesCount: dashboardStats.recentCompanies || 0,
        usersByRole: dashboardStats.usersByRole || [],
        studentsByProgram: dashboardStats.studentsByProgram || [],
        companiesByIndustry: dashboardStats.companiesByIndustry || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-red-100 text-red-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      open: { label: "Open", className: "bg-blue-100 text-blue-800" },
      closed: { label: "Closed", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your internship portal.
          </p>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />+
              {dashboardData.recentStudentsCount} this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />+
              {dashboardData.recentCompaniesCount} this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Companies
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.verifiedCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              {dashboardData.pendingVerifications} pending verification
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Students
            </CardTitle>
            <CardDescription>Latest student registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent students
                </p>
              ) : (
                dashboardData.recentStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800">
                          {student.firstName?.[0]}
                          {student.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.program}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(student.isActive ? "active" : "inactive")}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admin/interns")}
              >
                View All Students
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Recent Companies
            </CardTitle>
            <CardDescription>Latest company registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentCompanies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent companies
                </p>
              ) : (
                dashboardData.recentCompanies.map((company) => (
                  <div
                    key={company._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {company.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {company.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(company.isActive ? "active" : "inactive")}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admin/companies")}
              >
                View All Companies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Internship postings awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.pendingPostings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending approvals
                </p>
              ) : (
                dashboardData.pendingPostings.map((posting) => (
                  <div
                    key={posting._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {posting.posting.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {posting.companyName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge("pending")}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/admin/internship-postings")}
              >
                Review All Postings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/admin/interns")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Students</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/admin/companies")}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Manage Companies</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/admin/internship-postings")}
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-sm">Review Postings</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/admin/preferred-applicants")}
            >
              <UserCheck className="h-6 w-6" />
              <span className="text-sm">Whitelisted Students</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students by Program
            </CardTitle>
            <CardDescription>
              Distribution of students across programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.studentsByProgram.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No program data available
                </p>
              ) : (
                dashboardData.studentsByProgram.map((program) => (
                  <div
                    key={program._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {program._id || "Unknown Program"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{program.count} students</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Companies by Industry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Companies by Industry
            </CardTitle>
            <CardDescription>
              Distribution of companies across industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.companiesByIndustry.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No industry data available
                </p>
              ) : (
                dashboardData.companiesByIndustry.map((industry) => (
                  <div
                    key={industry._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {industry._id || "Unknown Industry"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{industry.count} companies</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

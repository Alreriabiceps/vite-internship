import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentInternships, setRecentInternships] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls later
      setStats({
        totalInternships: 5,
        activeInternships: 3,
        totalApplications: 24,
        pendingApplications: 8,
      });

      setRecentInternships([
        {
          id: 1,
          title: "Frontend Developer Intern",
          department: "Engineering",
          location: "Manila, Philippines",
          applicants: 12,
          status: "Active",
          postedDate: "2024-01-15",
        },
        {
          id: 2,
          title: "Marketing Intern",
          department: "Marketing",
          location: "Remote",
          applicants: 8,
          status: "Active",
          postedDate: "2024-01-10",
        },
        {
          id: 3,
          title: "Data Analyst Intern",
          department: "Analytics",
          location: "Makati, Philippines",
          applicants: 4,
          status: "Closed",
          postedDate: "2024-01-05",
        },
      ]);

      setRecentApplications([
        {
          id: 1,
          studentName: "John Doe",
          internshipTitle: "Frontend Developer Intern",
          appliedDate: "2024-01-20",
          status: "Pending",
          studentProgram: "BS Information System",
        },
        {
          id: 2,
          studentName: "Jane Smith",
          internshipTitle: "Marketing Intern",
          appliedDate: "2024-01-19",
          status: "Under Review",
          studentProgram: "BS Business Administration",
        },
        {
          id: 3,
          studentName: "Mike Johnson",
          internshipTitle: "Data Analyst Intern",
          appliedDate: "2024-01-18",
          status: "Accepted",
          studentProgram: "BS Computer Science",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white rounded-lg shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 bg-white rounded-lg shadow-sm"></div>
              <div className="h-64 bg-white rounded-lg shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 ring-4 ring-gray-200 shadow-lg">
                <AvatarImage
                  src={user?.profilePicUrl}
                  alt={user?.companyName || user?.firstName}
                />
                <AvatarFallback className="text-xl font-bold bg-gray-900 text-white">
                  {user?.companyName?.[0] || user?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.companyName || `${user?.firstName} ${user?.lastName}`}
                </h1>
                <p className="text-lg text-gray-600 flex items-center mb-1">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Dashboard
                </p>
                <p className="text-sm text-gray-500">
                  Manage your internships and connect with talented students
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button asChild variant="outline" size="lg">
                <Link to="/profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Link to="/my-internships">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Internship
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-gray-900">
                <Briefcase className="h-4 w-4 mr-2 text-gray-700" />
                Total Internships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalInternships}
              </div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-gray-900">
                <TrendingUp className="h-4 w-4 mr-2 text-gray-700" />
                Active Internships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeInternships}
              </div>
              <p className="text-xs text-gray-500">
                Currently accepting applications
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-gray-900">
                <Users className="h-4 w-4 mr-2 text-gray-700" />
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-gray-900">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-700" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Internships */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Briefcase className="h-5 w-5 mr-3 text-gray-700" />
                  Recent Internships
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/my-internships">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInternships.map((internship) => (
                  <div
                    key={internship.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {internship.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {internship.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Building2 className="h-3 w-3 mr-1" />
                          {internship.department}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-3 w-3 mr-1" />
                          {internship.applicants} applicants
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            internship.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            internship.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {internship.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Users className="h-5 w-5 mr-3 text-gray-700" />
                  Recent Applications
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/browse-interns">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {application.studentName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {application.internshipTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {application.studentProgram}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            application.status === "Accepted"
                              ? "default"
                              : application.status === "Under Review"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            application.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : application.status === "Under Review"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {application.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;


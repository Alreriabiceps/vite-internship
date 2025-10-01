import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { companiesAPI, studentsAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
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
      console.log("📊 Fetching company dashboard data...");

      // Fetch company profile to get real data
      const companyResponse = await companiesAPI.getProfile();
      const companyData = companyResponse.data?.data || companyResponse.data;
      console.log("🏢 Company data:", companyData);

      // Get OJT slots (internship positions)
      const ojtSlots = companyData.ojtSlots || [];
      const preferredApplicants = companyData.preferredApplicants || [];

      // Calculate stats
      const totalInternships = ojtSlots.length;
      const activeInternships = ojtSlots.filter(
        (slot) => slot.status === "open"
      ).length;
      const totalApplications = preferredApplicants.length;
      const pendingApplications = preferredApplicants.length; // All are pending until accepted

      setStats({
        totalInternships,
        activeInternships,
        totalApplications,
        pendingApplications,
      });

      console.log("📈 Stats calculated:", {
        totalInternships,
        activeInternships,
        totalApplications,
        pendingApplications,
      });

      // Format internships for display
      const formattedInternships = ojtSlots.slice(0, 3).map((slot) => ({
        id: slot._id,
        title: slot.title || "Internship Position",
        department: slot.department || companyData.departments || "General",
        location: slot.location || companyData.location || "Not specified",
        applicants: preferredApplicants.length, // Total applicants for now
        status: slot.status === "open" ? "Active" : "Closed",
        postedDate: slot.createdAt || new Date().toISOString(),
      }));

      setRecentInternships(formattedInternships);
      console.log("💼 Recent internships:", formattedInternships);

      // Fetch student details for preferred applicants (recent applications)
      if (preferredApplicants.length > 0) {
        console.log("👥 Fetching student details for preferred applicants...");

        const recentApplicantIds = preferredApplicants
          .slice(0, 3)
          .map((app) => app.studentId);
        const studentPromises = recentApplicantIds.map((id) =>
          studentsAPI.getById(id).catch((err) => {
            console.error(`Error fetching student ${id}:`, err);
            return null;
          })
        );

        const studentResponses = await Promise.all(studentPromises);
        const students = studentResponses
          .filter((res) => res !== null)
          .map((res) => res.data?.data || res.data);

        const formattedApplications = students.map((student, index) => {
          const applicantData = preferredApplicants[index];
          return {
            id: student._id,
            studentName: `${student.firstName} ${student.lastName}`,
            internshipTitle: "General Internship Position", // Could be mapped from slot if available
            appliedDate: applicantData?.addedAt || new Date().toISOString(),
            status: "Pending", // Default status
            studentProgram: student.program || "Not specified",
          };
        });

        setRecentApplications(formattedApplications);
        console.log("📋 Recent applications:", formattedApplications);
      } else {
        setRecentApplications([]);
        console.log("📋 No preferred applicants found");
      }

      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");

      // Set empty data on error
      setStats({
        totalInternships: 0,
        activeInternships: 0,
        totalApplications: 0,
        pendingApplications: 0,
      });
      setRecentInternships([]);
      setRecentApplications([]);
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 sm:ring-4 ring-gray-200 shadow-lg flex-shrink-0">
                <AvatarImage
                  src={user?.profilePicUrl}
                  alt={user?.companyName || user?.firstName}
                />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-gray-900 text-white">
                  {user?.companyName?.[0] || user?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                  {user?.companyName || `${user?.firstName} ${user?.lastName}`}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 flex items-center mb-1">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  Company Dashboard
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Manage your internships and connect with talented students
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="default"
                className="w-full sm:w-auto"
              >
                <Link to="/company/profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button
                asChild
                size="default"
                className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto"
              >
                <Link to="/company/post-internship">
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
              {recentInternships.length > 0 ? (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    No internship positions posted yet
                  </p>
                  <Button asChild size="sm">
                    <Link to="/company/post-internship">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Internship
                    </Link>
                  </Button>
                </div>
              )}
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
                  <Link to="/company/browse-interns">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
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
                            Added{" "}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    No students shortlisted yet
                  </p>
                  <Button asChild size="sm">
                    <Link to="/company/browse-interns">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Students
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

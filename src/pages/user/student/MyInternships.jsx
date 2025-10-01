import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Briefcase,
  Plus,
  Edit,
  Eye,
  Users,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const MyInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls later
      const mockInternships = [
        {
          id: 1,
          title: "Frontend Developer Intern",
          department: "Engineering",
          location: "Manila, Philippines",
          type: "Remote",
          duration: "3 months",
          stipend: "₱8,000/month",
          applicants: 12,
          status: "Active",
          postedDate: "2024-01-15",
          deadline: "2024-02-15",
          description:
            "Join our engineering team to work on cutting-edge web applications using React and modern frontend technologies.",
          requirements: ["React", "JavaScript", "CSS", "Git"],
        },
        {
          id: 2,
          title: "Marketing Intern",
          department: "Marketing",
          location: "Remote",
          type: "Remote",
          duration: "6 months",
          stipend: "₱6,000/month",
          applicants: 8,
          status: "Active",
          postedDate: "2024-01-10",
          deadline: "2024-02-10",
          description:
            "Support our marketing team in creating engaging content and managing social media campaigns.",
          requirements: [
            "Social Media",
            "Content Creation",
            "Analytics",
            "Communication",
          ],
        },
        {
          id: 3,
          title: "Data Analyst Intern",
          department: "Analytics",
          location: "Makati, Philippines",
          type: "Hybrid",
          duration: "4 months",
          stipend: "₱10,000/month",
          applicants: 4,
          status: "Closed",
          postedDate: "2024-01-05",
          deadline: "2024-01-25",
          description:
            "Analyze business data and create reports to help drive strategic decisions.",
          requirements: ["Python", "SQL", "Excel", "Statistics"],
        },
        {
          id: 4,
          title: "UI/UX Design Intern",
          department: "Design",
          location: "Quezon City, Philippines",
          type: "On-site",
          duration: "3 months",
          stipend: "₱7,000/month",
          applicants: 6,
          status: "Draft",
          postedDate: "2024-01-20",
          deadline: "2024-02-20",
          description:
            "Design user interfaces and experiences for our mobile and web applications.",
          requirements: [
            "Figma",
            "Adobe Creative Suite",
            "User Research",
            "Prototyping",
          ],
        },
      ];

      setInternships(mockInternships);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      internship.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white rounded-lg shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-64 bg-white rounded-lg shadow-sm"></div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Internships
              </h1>
              <p className="text-lg text-gray-600">
                Manage your internship postings and applications
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Link to="/post-internship">
                <Plus className="h-4 w-4 mr-2" />
                Post New Internship
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <Card
              key={internship.id}
              className="bg-white shadow-lg border-gray-200 hover:shadow-xl transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {internship.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {internship.department}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {internship.location}
                    </div>
                  </div>
                  {getStatusBadge(internship.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration: {internship.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Stipend: {internship.stipend}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {internship.applicants} applicants
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline:{" "}
                    {new Date(internship.deadline).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-3">
                  {internship.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {internship.requirements.slice(0, 3).map((req, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {internship.requirements.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{internship.requirements.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    Applicants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <Card className="bg-white shadow-lg border-gray-200">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No internships found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by posting your first internship opportunity."}
              </p>
              <Button
                asChild
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Link to="/post-internship">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Internship
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyInternships;




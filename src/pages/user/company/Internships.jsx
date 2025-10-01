import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { companiesAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

const Internships = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching company internships...");

      const response = await companiesAPI.getProfile();
      const companyData = response.data?.data || response.data;
      console.log("🏢 Company data:", companyData);

      const ojtSlots = companyData.ojtSlots || [];
      console.log("💼 Found internships:", ojtSlots.length);

      setInternships(ojtSlots);
    } catch (error) {
      console.error("❌ Error fetching internships:", error);
      toast.error("Failed to load internships");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this internship posting?"
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Deleting internship:", slotId);
      await companiesAPI.deleteSlot(slotId);

      toast.success("Internship deleted successfully");
      fetchInternships(); // Refresh list
    } catch (error) {
      console.error("❌ Error deleting internship:", error);
      toast.error("Failed to delete internship");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: "Open",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      closed: {
        label: "Closed",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      filled: {
        label: "Filled",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    const config = statusConfig[status] || statusConfig.open;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Internship Positions
          </h1>
          <p className="text-gray-600 mt-1">Manage your internship postings</p>
        </div>
        <Button
          onClick={() => navigate("/company/post-internship")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Internship
        </Button>
      </div>

      {/* Internships List */}
      {internships.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Internships Posted Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start attracting talented students by posting your first
              internship position
            </p>
            <Button
              onClick={() => navigate("/company/post-internship")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Internship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {internships.map((internship) => (
            <Card
              key={internship._id}
              className="hover:shadow-lg transition-shadow border-2 border-gray-100"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Side - Info */}
                  <div className="flex-1 space-y-4">
                    {/* Title & Status */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {internship.title || "Internship Position"}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {internship.department || "General"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">
                            {internship.location || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-medium">
                            {internship.duration
                              ? `${internship.duration}h`
                              : "Flexible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Positions</p>
                          <p className="font-medium">
                            {internship.positions || 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Allowance</p>
                          <p className="font-medium">
                            {internship.allowance?.min &&
                            internship.allowance?.max
                              ? `₱${internship.allowance.min}-${internship.allowance.max}`
                              : "Negotiable"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {internship.workType || "On-site"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {internship.schedule || "Full-time"}
                      </Badge>
                      {internship.applicationDeadline && (
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Deadline:{" "}
                          {new Date(
                            internship.applicationDeadline
                          ).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {internship.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {internship.description}
                      </p>
                    )}

                    {/* Posted Date */}
                    <p className="text-xs text-gray-500">
                      Posted on{" "}
                      {new Date(
                        internship.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col items-end gap-3 ml-4">
                    {getStatusBadge(internship.status)}

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // TODO: Navigate to view/edit page
                          toast.info("View details coming soon!");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // TODO: Navigate to edit page
                          toast.info("Edit functionality coming soon!");
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={() => handleDelete(internship._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Internships;

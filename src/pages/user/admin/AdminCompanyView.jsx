import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Building2,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Target,
  Award,
  CheckCircle,
  Star,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  X,
  ShieldCheck,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCompanyView = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      console.log("🎯 Fetching company profile:", companyId);

      const response = await fetch(`/api/companies/${companyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }

      const result = await response.json();
      console.log("📦 Company profile response:", result);

      if (result.success && result.data) {
        setCompany(result.data);
      } else {
        toast.error("Company not found");
        navigate("/admin/companies");
      }
    } catch (error) {
      console.error("❌ Error fetching company profile:", error);
      toast.error("Failed to load company profile");
      navigate("/admin/companies");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Open
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Closed
          </Badge>
        );
      case "filled":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Filled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Unknown
          </Badge>
        );
    }
  };

  const getApprovalStatusBadge = (approvalStatus) => {
    const approvalConfig = {
      pending: {
        label: "Pending Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="h-3 w-3" />,
      },
      approved: {
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <X className="h-3 w-3" />,
      },
    };
    const config = approvalConfig[approvalStatus] || approvalConfig.pending;
    return (
      <Badge className={config.className}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Company Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/admin/companies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/companies")}
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Companies
          </Button>
        </div>

        {/* Company Header */}
        <Card className="mb-4 sm:mb-6 lg:mb-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Company Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-gray-200 shadow-lg">
                  <AvatarImage src={company.logoUrl} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-lg sm:text-2xl">
                    {company.companyName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {company.companyName}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                      {company.industry}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        {company.companySize} employees
                      </Badge>
                      {company.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/companies/${companyId}/edit`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Company
                    </Button>
                    {company.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(company.website, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                {company.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About {company.companyName}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Location */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-sm text-gray-600">
                    {company.location || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                  <p className="text-sm text-gray-600">
                    {company.contactPerson?.email || company.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Size */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Company Size</h3>
                  <p className="text-sm text-gray-600">
                    {company.companySize} employees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Internship Listings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Internship Postings
            </h2>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300"
              >
                {company.ojtSlots?.filter((slot) => slot.status === "open")
                  .length || 0}{" "}
                Open Positions
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300"
              >
                {company.ojtSlots?.length || 0} Total Postings
              </Badge>
            </div>
          </div>

          {!company.ojtSlots || company.ojtSlots.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Internships Posted
                </h3>
                <p className="text-gray-600">
                  This company hasn't posted any internship opportunities yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {company.ojtSlots.map((slot) => (
                <Card
                  key={slot._id}
                  className="hover:shadow-md transition-shadow border border-gray-200"
                >
                  <CardContent className="p-6">
                    {/* Internship Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {slot.title}
                        </h3>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(slot.status)}
                          {getApprovalStatusBadge(slot.approvalStatus)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {slot.department}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {slot.description}
                      </p>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span>{slot.duration} months</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span>{slot.location || company.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span>
                          {slot.positions} position
                          {slot.positions > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        <span>{slot.workType}</span>
                      </div>
                    </div>

                    {/* Skills Preview */}
                    {slot.skillRequirements?.mustHave?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Required Skills:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {slot.skillRequirements.mustHave
                            .slice(0, 3)
                            .map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {slot.skillRequirements.mustHave.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                            >
                              +{slot.skillRequirements.mustHave.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Deadline */}
                    {slot.applicationDeadline && (
                      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span>
                            Deadline:{" "}
                            {new Date(
                              slot.applicationDeadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate(
                            `/admin/internship-postings?company=${companyId}&slot=${slot._id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/admin/internship-postings?company=${companyId}&slot=${slot._id}&action=edit`
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyView;

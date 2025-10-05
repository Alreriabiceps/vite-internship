import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { studentsAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import Modal from "../../../components/ui/modal";
import {
  Search,
  Building2,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  Eye,
  X,
  CheckCircle,
  Clock,
  Star,
  Mail,
  Phone,
  Calendar,
  Award,
  Briefcase,
  Heart,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const InterestedCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch companies interested in the student
  useEffect(() => {
    fetchInterestedCompanies();
  }, []);

  const fetchInterestedCompanies = async () => {
    try {
      setLoading(true);
      console.log("🎯 Fetching interested companies for student:", user?.id);

      const response = await studentsAPI.getInterestedCompanies();
      console.log("📦 API Response:", response);

      if (response.data.success) {
        const companiesData = response.data.data || [];
        console.log("✅ Found companies:", companiesData.length);
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } else {
        console.log("❌ No companies found or API error");
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      console.error("❌ Error fetching interested companies:", error);
      toast.error("Failed to load interested companies");
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter((company) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        company.companyName?.toLowerCase().includes(searchLower) ||
        company.industry?.toLowerCase().includes(searchLower) ||
        company.location?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredCompanies(filtered);
  };

  const viewCompanyProfile = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const handleAccept = async (companyId) => {
    try {
      console.log("🎯 Accepting company interest:", companyId);

      const response = await studentsAPI.acceptCompanyInterest(companyId);
      console.log("📦 Accept response:", response);

      if (response.data.success) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, status: "accepted" }
              : company
          )
        );
        toast.success("Internship offer accepted! 🎉");
      } else {
        toast.error("Failed to accept offer");
      }
    } catch (error) {
      console.error("❌ Error accepting company interest:", error);
      toast.error("Failed to accept offer");
    }
  };

  const handleReject = async (companyId) => {
    try {
      console.log("🎯 Declining company interest:", companyId);

      const response = await studentsAPI.declineCompanyInterest(companyId);
      console.log("📦 Decline response:", response);

      if (response.data.success) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? { ...company, status: "rejected" }
              : company
          )
        );
        toast.success("Internship offer declined.");
      } else {
        toast.error("Failed to decline offer");
      }
    } catch (error) {
      console.error("❌ Error declining company interest:", error);
      toast.error("Failed to decline offer");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Declined
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Interested Companies
          </h1>
          <p className="text-gray-600 mt-1">
            Companies that are interested in hiring you
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchInterestedCompanies}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-lg border-2 border-pink-200">
            <Heart className="h-5 w-5 text-pink-600 fill-pink-600" />
            <div>
              <p className="text-sm font-bold text-pink-700">
                {companies.filter((c) => c.status === "pending").length} Pending
              </p>
              <p className="text-xs text-pink-600">offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between py-2">
        <p className="text-xs text-gray-600">
          Showing{" "}
          <span className="font-semibold">{filteredCompanies.length}</span> of{" "}
          {companies.length} companies
        </p>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="text-gray-600 hover:text-gray-900 h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Search
          </Button>
        )}
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? "No companies found"
                : "No companies interested yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Companies will appear here when they express interest in your profile"}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={fetchInterestedCompanies}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Check for Updates
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-blue-400 rounded-xl overflow-hidden relative"
              onClick={() => viewCompanyProfile(company)}
            >
              <CardContent className="p-6">
                {/* Company Header */}
                <div className="flex flex-col items-center text-center mb-5">
                  <Avatar className="h-20 w-20 border-3 border-white shadow-lg ring-2 ring-blue-100 mb-3">
                    <AvatarImage src={company.logo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                      {company.companyName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {company.companyName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem]">
                    {company.industry}
                  </p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(company.status)}
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                      {company.companySize} employees
                    </Badge>
                  </div>
                </div>

                {/* Company Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-700 p-2 bg-blue-50 rounded-lg">
                    <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 p-2 bg-green-50 rounded-lg">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">
                      {company.internshipDetails.positions} positions
                    </span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    Their Message
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                    "{company.message}"
                  </p>
                </div>

                {/* Skills Preview */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {company.skillsRequired.mustHave
                      .split(", ")
                      .slice(0, 2)
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-xs bg-red-100 text-red-700 border-0"
                        >
                          {skill}
                        </Badge>
                      ))}
                    {company.skillsRequired.mustHave.split(", ").length > 2 && (
                      <Badge className="text-xs bg-gray-200 text-gray-700 border-0">
                        +
                        {company.skillsRequired.mustHave.split(", ").length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {company.status === "pending" && (
                  <div className="flex gap-2 mb-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(company.id);
                      }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(company.id);
                      }}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}

                {/* View Profile Button */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md group-hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewCompanyProfile(company);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Company Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Company Profile Modal */}
      {selectedCompany && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={`${selectedCompany.companyName} - Company Profile`}
        >
          <div className="space-y-6">
            {/* Company Header */}
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-xl">
                <AvatarImage src={selectedCompany.logo} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                  {selectedCompany.companyName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCompany.companyName}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedCompany.description}
              </p>
              <div className="flex justify-center gap-2">
                {getStatusBadge(selectedCompany.status)}
                <Badge className="bg-blue-100 text-blue-700">
                  {selectedCompany.companySize} employees
                </Badge>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedCompany.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{selectedCompany.companySize} employees</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="text-sm">
                    <p className="font-medium">
                      {selectedCompany.representative.name}
                    </p>
                    <p className="text-gray-600">
                      {selectedCompany.representative.email}
                    </p>
                    <p className="text-gray-600">
                      {selectedCompany.representative.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Internship Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  Internship Program
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold">
                      {selectedCompany.internshipDetails.positions}
                    </p>
                    <p className="text-xs text-gray-600">Positions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-bold">
                      {selectedCompany.internshipDetails.duration}h
                    </p>
                    <p className="text-xs text-gray-600">Duration</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold">Multiple</p>
                    <p className="text-xs text-gray-600">Departments</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-bold">Yes</p>
                    <p className="text-xs text-gray-600">Benefits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  Skills Required
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    Must Have
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.skillsRequired.mustHave
                      .split(", ")
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-xs bg-red-100 text-red-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Preferred
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.skillsRequired.preferred
                      .split(", ")
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-xs bg-blue-100 text-blue-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Nice to Have
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.skillsRequired.niceToHave
                      .split(", ")
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-xs bg-green-100 text-green-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Message */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-pink-600" />
                  Their Message
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 italic">
                  "{selectedCompany.message}"
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {selectedCompany.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleAccept(selectedCompany.id);
                    closeModal();
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Offer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleReject(selectedCompany.id);
                    closeModal();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline Offer
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterestedCompanies;

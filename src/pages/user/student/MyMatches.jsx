import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Search,
  Building2,
  MapPin,
  Users,
  Globe,
  Eye,
  X,
  CheckCircle,
  Clock,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

const MyMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [archivedCompanies, setArchivedCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredArchivedCompanies, setFilteredArchivedCompanies] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchInterestedCompanies();
    } else if (user === null) {
      // If user is explicitly null (not loading), set loading to false
      setLoading(false);
    }
  }, [user?._id, user?.id, user]);

  useEffect(() => {
    filterCompanies();
  }, [companies, archivedCompanies, searchTerm]);

  const fetchInterestedCompanies = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      console.log("🔍 Fetching interested companies for user:", userId);
      console.log("🔍 Full user object:", user);

      const response = await studentsAPI.getInterestedCompanies();
      console.log("📦 Interested companies response:", response);

      if (response.data && response.data.success) {
        const companiesData = response.data.data || [];

        // Load stored data from localStorage
        const userId = user?._id || user?.id;
        const storedArchived = JSON.parse(
          localStorage.getItem(`archivedCompanies_${userId}`) || "[]"
        );
        const storedAccepted = JSON.parse(
          localStorage.getItem(`acceptedCompanies_${userId}`) || "[]"
        );

        // Create sets for efficient lookup
        const archivedCompanyIds = new Set(
          storedArchived.map((company) => company.id)
        );
        const acceptedCompanyIds = new Set(
          storedAccepted.map((company) => company.id)
        );

        // Filter out archived companies from API data
        const activeCompanies = companiesData
          .filter((company) => !archivedCompanyIds.has(company.id))
          .map((company) => ({
            ...company,
            status: acceptedCompanyIds.has(company.id)
              ? "accepted"
              : company.status,
          }));

        // Combine stored archived with any new rejected companies from API
        const allArchived = [
          ...storedArchived,
          ...companiesData.filter(
            (company) =>
              company.status === "rejected" &&
              !storedArchived.some((stored) => stored.id === company.id)
          ),
        ];

        setCompanies(activeCompanies);
        setArchivedCompanies(allArchived);
        setFilteredCompanies(activeCompanies);
        setFilteredArchivedCompanies(allArchived);
      } else {
        // Load from localStorage even if API fails
        const userId = user?._id || user?.id;
        const storedArchived = JSON.parse(
          localStorage.getItem(`archivedCompanies_${userId}`) || "[]"
        );
        const storedAccepted = JSON.parse(
          localStorage.getItem(`acceptedCompanies_${userId}`) || "[]"
        );

        setCompanies(storedAccepted);
        setArchivedCompanies(storedArchived);
        setFilteredCompanies(storedAccepted);
        setFilteredArchivedCompanies(storedArchived);
      }
    } catch (error) {
      console.error("❌ Error fetching interested companies:", error);

      // Load from localStorage on error
      const userId = user?._id || user?.id;
      const storedArchived = JSON.parse(
        localStorage.getItem(`archivedCompanies_${userId}`) || "[]"
      );
      const storedAccepted = JSON.parse(
        localStorage.getItem(`acceptedCompanies_${userId}`) || "[]"
      );

      setCompanies(storedAccepted);
      setArchivedCompanies(storedArchived);
      setFilteredCompanies(storedAccepted);
      setFilteredArchivedCompanies(storedArchived);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    const searchLower = searchTerm.toLowerCase();

    const filteredActive = companies.filter(
      (company) =>
        company.companyName?.toLowerCase().includes(searchLower) ||
        company.industry?.toLowerCase().includes(searchLower) ||
        company.location?.toLowerCase().includes(searchLower)
    );

    const filteredArchived = archivedCompanies.filter(
      (company) =>
        company.companyName?.toLowerCase().includes(searchLower) ||
        company.industry?.toLowerCase().includes(searchLower) ||
        company.location?.toLowerCase().includes(searchLower)
    );

    setFilteredCompanies(filteredActive);
    setFilteredArchivedCompanies(filteredArchived);
  };

  const handleAccept = async (companyId) => {
    try {
      console.log("✅ Accepting company:", companyId);

      const response = await studentsAPI.acceptCompanyInterest(companyId);
      console.log("📦 Accept response:", response);

      if (response.data && response.data.success) {
        // Update the company status in the active companies list
        const updatedCompanies = companies.map((company) =>
          company.id === companyId
            ? { ...company, status: "accepted" }
            : company
        );

        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);

        // Save to localStorage
        const acceptedCompany = companies.find((c) => c.id === companyId);
        if (acceptedCompany) {
          const userId = user?._id || user?.id;
          const storedAccepted = JSON.parse(
            localStorage.getItem(`acceptedCompanies_${userId}`) || "[]"
          );
          const updatedAccepted = [
            ...storedAccepted.filter((c) => c.id !== companyId),
            { ...acceptedCompany, status: "accepted" },
          ];
          localStorage.setItem(
            `acceptedCompanies_${userId}`,
            JSON.stringify(updatedAccepted)
          );
        }

        toast.success("Company accepted! You can now connect with them.");
      } else {
        toast.error("Failed to accept company interest");
      }
    } catch (error) {
      console.error("❌ Error accepting company:", error);
      toast.error("Failed to accept company interest");
    }
  };

  const handleReject = async (companyId) => {
    try {
      console.log("❌ Rejecting company:", companyId);

      const response = await studentsAPI.declineCompanyInterest(companyId);
      console.log("📦 Reject response:", response);

      if (response.data && response.data.success) {
        // Find the company to move to archive
        const companyToArchive = companies.find((c) => c.id === companyId);

        if (companyToArchive) {
          // Remove from active companies
          const updatedCompanies = companies.filter((c) => c.id !== companyId);
          setCompanies(updatedCompanies);
          setFilteredCompanies(updatedCompanies);

          // Add to archived companies
          const updatedArchived = [
            ...archivedCompanies,
            { ...companyToArchive, status: "rejected" },
          ];
          setArchivedCompanies(updatedArchived);
          setFilteredArchivedCompanies(updatedArchived);

          // Save to localStorage
          const userId = user?._id || user?.id;
          localStorage.setItem(
            `archivedCompanies_${userId}`,
            JSON.stringify(updatedArchived)
          );
        }

        toast.success("Company declined and moved to archive.");
      } else {
        toast.error("Failed to decline company interest");
      }
    } catch (error) {
      console.error("❌ Error rejecting company:", error);
      toast.error("Failed to decline company interest");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <X className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getPendingOffersCount = () => {
    return companies.filter((company) => company.status === "pending").length;
  };

  const viewCompanyProfile = (companyId) => {
    navigate(`/student/company/${companyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Matches
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Companies that have shown interest in you
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {getPendingOffersCount() > 0 && (
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs sm:text-sm">
                  {getPendingOffersCount()} Pending Offers
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300 text-xs sm:text-sm"
              >
                {activeTab === "active"
                  ? `${filteredCompanies.length} Active`
                  : `${filteredArchivedCompanies.length} Archived`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-gray-500 text-sm sm:text-base"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === "active" ? "default" : "outline"}
                onClick={() => setActiveTab("active")}
                className={
                  activeTab === "active"
                    ? "bg-gray-800 hover:bg-gray-900 text-sm"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                }
              >
                Active Matches
              </Button>
              <Button
                variant={activeTab === "archived" ? "default" : "outline"}
                onClick={() => setActiveTab("archived")}
                className={
                  activeTab === "archived"
                    ? "bg-gray-800 hover:bg-gray-900 text-sm"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                }
              >
                Archived
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {activeTab === "active" ? (
          filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Active Matches
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No companies match your search criteria."
                    : "No companies have shown interest in you yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col"
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    {/* Main Content - grows to fill available space */}
                    <div className="flex-1 flex flex-col">
                      {/* Company Header */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-gray-200">
                          <AvatarImage src={company.logoUrl} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm sm:text-lg">
                            {company.companyName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">
                            {company.companyName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                            {company.industry}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {getStatusBadge(company.status)}
                          </div>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          <span className="line-clamp-1">
                            {company.location || "Location not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          <span>{company.companySize} employees</span>
                        </div>
                        {company.website && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                            <span className="line-clamp-1">
                              Website available
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description Preview */}
                      {company.description && (
                        <div className="mb-3 sm:mb-4">
                          <p className="text-xs text-gray-500 mb-1">About:</p>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
                            {company.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - always at bottom */}
                    <div className="mt-auto space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 text-sm sm:text-base"
                        onClick={() => viewCompanyProfile(company.id)}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        View Company
                      </Button>

                      {company.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gray-800 hover:bg-gray-900 text-sm sm:text-base"
                            onClick={() => handleAccept(company.id)}
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 text-sm sm:text-base"
                            onClick={() => handleReject(company.id)}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : // Archived Companies
        filteredArchivedCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <X className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Archived Companies
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "No archived companies match your search criteria."
                  : "You haven't declined any companies yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredArchivedCompanies.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-md transition-shadow border border-gray-200 opacity-75 h-full flex flex-col"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  {/* Main Content - grows to fill available space */}
                  <div className="flex-1 flex flex-col">
                    {/* Company Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-gray-200">
                        <AvatarImage src={company.logoUrl} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm sm:text-lg">
                          {company.companyName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">
                          {company.companyName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          {company.industry}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadge(company.status)}
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span className="line-clamp-1">
                          {company.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span>{company.companySize} employees</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - always at bottom */}
                  <div className="mt-auto">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 text-sm sm:text-base"
                      onClick={() => viewCompanyProfile(company.id)}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      View Company
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

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
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Search,
  Building2,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  CheckCircle,
  Star,
  Mail,
  Phone,
  Filter,
  Eye,
  Shield,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const ExploreCompanies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedIndustry]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log("🏢 Fetching companies...");

      const response = await companiesAPI.getAll();
      console.log("📦 Companies response:", response);

      if (response.data && response.data.success) {
        setCompanies(response.data.data);
      } else {
        toast.error("Failed to load companies");
      }
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.companyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by industry
    if (selectedIndustry !== "All") {
      filtered = filtered.filter(
        (company) => company.industry === selectedIndustry
      );
    }

    setFilteredCompanies(filtered);
  };

  const viewCompanyProfile = (companyId) => {
    navigate(`/student/company/${companyId}`);
  };

  const uniqueIndustries = [
    "All",
    ...new Set(companies.map((company) => company.industry).filter(Boolean)),
  ];

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
                Explore Companies
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Research companies and discover their internship opportunities
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-gray-600 border-gray-300 text-xs sm:text-sm self-start sm:self-auto"
            >
              {filteredCompanies.length} Companies
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
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

            {/* Industry Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by industry:
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {uniqueIndustries.map((industry) => (
                  <Button
                    key={industry}
                    variant={
                      selectedIndustry === industry ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedIndustry(industry)}
                    className={
                      selectedIndustry === industry
                        ? "bg-gray-800 hover:bg-gray-900 text-xs sm:text-sm"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm"
                    }
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Companies Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedIndustry !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "No companies are currently available."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredCompanies.map((company) => (
              <Card
                key={company._id}
                className="hover:shadow-md transition-shadow border border-gray-200 cursor-pointer group h-full flex flex-col"
                onClick={() => viewCompanyProfile(company._id)}
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
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 group-hover:text-gray-700">
                          {company.companyName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          {company.industry}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {company.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
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

                    {/* Internship Count */}
                    <div className="mb-3 sm:mb-4 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">
                          Available Internships:
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                        >
                          {company.ojtSlots?.filter(
                            (slot) => slot.status === "open" && slot.isActive
                          ).length || 0}{" "}
                          Open
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* View Profile Button - always at bottom */}
                  <div className="mt-auto">
                    <Button
                      className="w-full bg-gray-800 hover:bg-gray-900 text-sm sm:text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewCompanyProfile(company._id);
                      }}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Explore Company
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

export default ExploreCompanies;

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import {
  Search,
  Building2,
  Users,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  Star,
  CheckCircle,
  Globe,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterVerified, setFilterVerified] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      // Mock companies data
      const mockCompanies = [
        {
          _id: "1",
          companyName: "Tech Solutions Inc.",
          industry: "Technology",
          companySize: "51-200",
          website: "https://techsolutions.com",
          description:
            "Leading technology company providing innovative solutions",
          address: {
            street: "123 Tech Ave",
            city: "Innovation City",
            province: "Techland",
            zipCode: "90001",
          },
          contactPerson: {
            name: "John Manager",
            position: "HR Manager",
            email: "hr@techsolutions.com",
            phone: "555-123-4567",
          },
          ojtSlots: [
            { title: "Frontend Developer", count: 3 },
            { title: "Backend Developer", count: 2 },
          ],
          preferredApplicants: [
            { program: "Computer Science" },
            { program: "Information Technology" },
          ],
          rating: 4.5,
          isVerified: true,
        },
        {
          _id: "2",
          companyName: "Digital Innovations Ltd.",
          industry: "Software Development",
          companySize: "11-50",
          website: "https://digitalinnovations.com",
          description: "Cutting-edge software development company",
          address: {
            street: "456 Digital St",
            city: "Tech Hub",
            province: "Innovation State",
            zipCode: "90002",
          },
          contactPerson: {
            name: "Sarah Director",
            position: "HR Director",
            email: "hr@digitalinnovations.com",
            phone: "555-987-6543",
          },
          ojtSlots: [
            { title: "Mobile Developer", count: 2 },
            { title: "UI/UX Designer", count: 1 },
          ],
          preferredApplicants: [
            { program: "Computer Science" },
            { program: "Design" },
          ],
          rating: 4.2,
          isVerified: false,
        },
      ];

      setCompanies(mockCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      !searchTerm ||
      company.companyProfile?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company.companyProfile?.industry
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company.companyProfile?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesIndustry =
      !filterIndustry ||
      filterIndustry === "all" ||
      company.companyProfile?.industry === filterIndustry;
    const matchesSize =
      !filterSize ||
      filterSize === "all" ||
      company.companyProfile?.companySize === filterSize;
    const matchesVerified =
      !filterVerified ||
      filterVerified === "all" ||
      (filterVerified === "verified" && company.companyProfile?.isVerified) ||
      (filterVerified === "unverified" && !company.companyProfile?.isVerified);

    return matchesSearch && matchesIndustry && matchesSize && matchesVerified;
  });

  const getCompanySizeLabel = (size) => {
    switch (size) {
      case "1-10":
        return "1-10 employees";
      case "11-50":
        return "11-50 employees";
      case "51-200":
        return "51-200 employees";
      case "201-500":
        return "201-500 employees";
      case "500+":
        return "500+ employees";
      default:
        return size;
    }
  };

  const getRatingStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Loading company profiles...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Companies</h1>
        <p className="text-muted-foreground">
          Browse and manage company profiles
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find companies based on your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Industry</label>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Company Size</label>
              <Select value={filterSize} onValueChange={setFilterSize}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sizes</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Verification</label>
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  <SelectItem value="verified">Verified only</SelectItem>
                  <SelectItem value="unverified">Unverified only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCompanies.length} of {companies.length} companies
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterIndustry("");
                setFilterSize("");
                setFilterVerified("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={company.companyProfile?.logo} />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg truncate">
                      {company.companyProfile?.companyName}
                    </h3>
                    {company.companyProfile?.isVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {company.companyProfile?.industry}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Company Size */}
              {company.companyProfile?.companySize && (
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">
                    {getCompanySizeLabel(company.companyProfile.companySize)}
                  </span>
                </div>
              )}

              {/* Rating */}
              {company.companyProfile?.rating && (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(company.companyProfile.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({company.companyProfile.rating}/5)
                    </span>
                  </div>
                </div>
              )}

              {/* OJT Slots */}
              {company.companyProfile?.ojtSlots !== undefined && (
                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">OJT Slots:</span>
                  <span className="font-medium">
                    {company.companyProfile.ojtSlots}
                  </span>
                </div>
              )}

              {/* Description */}
              {company.companyProfile?.description && (
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {company.companyProfile.description}
                  </p>
                </div>
              )}

              {/* Website */}
              {company.companyProfile?.website && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.companyProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {company.companyProfile.website}
                  </a>
                </div>
              )}

              {/* Location */}
              {company.companyProfile?.address && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">
                    {company.companyProfile.address}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-1 text-sm text-muted-foreground">
                {company.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Profile
                </Button>
                {user?.role === "student" && (
                  <Button size="sm" className="flex-1">
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Companies;

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
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
import Modal from "../../../components/ui/modal";
import {
  Search,
  Building2,
  MapPin,
  Clock,
  Users,
  Calendar,
  Briefcase,
  DollarSign,
  Target,
  FileText,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState("All");
  const [appliedInternships, setAppliedInternships] = useState(new Set());

  useEffect(() => {
    fetchInternships();
    loadAppliedInternships();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [searchTerm, selectedWorkType, internships]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching all internship postings...");

      // Fetch all companies
      const response = await companiesAPI.getAll();
      const companies = response.data?.data || response.data || [];

      console.log("🏢 Found companies:", companies.length);

      // Extract all OJT slots from all companies
      const allInternships = [];
      companies.forEach((company) => {
        if (company.ojtSlots && company.ojtSlots.length > 0) {
          company.ojtSlots.forEach((slot) => {
            // Only include open positions
            if (slot.status === "open") {
              allInternships.push({
                ...slot,
                company: {
                  _id: company._id,
                  companyName: company.companyName,
                  industry: company.industry,
                  logoUrl: company.logoUrl,
                  location: company.location || company.address?.city,
                },
              });
            }
          });
        }
      });

      console.log("💼 Total open internships:", allInternships.length);
      setInternships(allInternships);
      setFilteredInternships(allInternships);
    } catch (error) {
      console.error("❌ Error fetching internships:", error);
      toast.error("Failed to load internship opportunities");
      setInternships([]);
      setFilteredInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedInternships = () => {
    const saved = localStorage.getItem(`appliedInternships_${user?.id}`);
    if (saved) {
      setAppliedInternships(new Set(JSON.parse(saved)));
    }
  };

  const saveAppliedInternships = (applied) => {
    localStorage.setItem(
      `appliedInternships_${user?.id}`,
      JSON.stringify([...applied])
    );
  };

  const filterInternships = () => {
    let filtered = [...internships];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (internship) =>
          internship.title?.toLowerCase().includes(searchLower) ||
          internship.department?.toLowerCase().includes(searchLower) ||
          internship.company?.companyName
            ?.toLowerCase()
            .includes(searchLower) ||
          internship.company?.industry?.toLowerCase().includes(searchLower) ||
          internship.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by work type
    if (selectedWorkType !== "All") {
      filtered = filtered.filter(
        (internship) => internship.workType === selectedWorkType
      );
    }

    setFilteredInternships(filtered);
  };

  const viewInternshipDetails = (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  const handleApply = (internshipId) => {
    const newApplied = new Set(appliedInternships);
    newApplied.add(internshipId);
    setAppliedInternships(newApplied);
    saveAppliedInternships(newApplied);
    toast.success("Application submitted successfully! 🎉");
  };

  const isApplied = (internshipId) => {
    return appliedInternships.has(internshipId);
  };

  const uniqueWorkTypes = [
    "All",
    ...new Set(internships.map((i) => i.workType)),
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Browse Internship Opportunities
          </h1>
          <p className="text-gray-600 mt-1">
            Discover and apply to internship positions from top companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Sparkles className="h-3 w-3 mr-1" />
            {filteredInternships.length} Opportunities
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by position, company, location, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Work Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              {uniqueWorkTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedWorkType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedWorkType(type)}
                  className={
                    selectedWorkType === type
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {type}
                  {type !== "All" && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center"
                    >
                      {internships.filter((i) => i.workType === type).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internship Cards */}
      {filteredInternships.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Internships Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <Card
              key={internship._id}
              className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 cursor-pointer group"
              onClick={() => viewInternshipDetails(internship)}
            >
              <CardContent className="p-5 space-y-4">
                {/* Company Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {internship.company.companyName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {internship.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {internship.company.companyName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span>{internship.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>
                      {internship.location || "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{internship.duration} months</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-teal-600 font-bold">₱</span>
                    <span>
                      {internship.allowance
                        ? `₱${internship.allowance.toLocaleString()}`
                        : "Negotiable"}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {internship.workType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {internship.positions}{" "}
                    {internship.positions > 1 ? "slots" : "slot"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-orange-600 border-orange-300"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Deadline:{" "}
                    {new Date(
                      internship.applicationDeadline
                    ).toLocaleDateString()}
                  </Badge>
                </div>

                {/* Description Preview */}
                {internship.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {internship.description}
                  </p>
                )}

                {/* Apply Button */}
                <Button
                  className={
                    isApplied(internship._id)
                      ? "w-full bg-green-600 hover:bg-green-700"
                      : "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isApplied(internship._id)) {
                      handleApply(internship._id);
                    }
                  }}
                  disabled={isApplied(internship._id)}
                >
                  {isApplied(internship._id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Internship Details Modal */}
      {selectedInternship && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedInternship.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedInternship.company.companyName}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
            {/* Key Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium uppercase">
                    Department
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.department}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="text-xs text-red-600 font-medium uppercase">
                    Location
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.location || "Not specified"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium uppercase">
                    Duration
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.duration} months
                </p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-teal-600">₱</span>
                  <span className="text-xs text-teal-600 font-medium uppercase">
                    Allowance
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.allowance
                    ? `₱${selectedInternship.allowance.toLocaleString()}`
                    : "Negotiable"}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium uppercase">
                    Positions
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.positions}{" "}
                  {selectedInternship.positions > 1 ? "slots" : "slot"}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium uppercase">
                    Work Type
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInternship.workType}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedInternship.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">
                    About This Position
                  </h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedInternship.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {selectedInternship.responsibilities?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">
                    Key Responsibilities
                  </h4>
                </div>
                <ul className="space-y-2">
                  {selectedInternship.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {selectedInternship.qualifications?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">
                    Requirements & Qualifications
                  </h4>
                </div>
                <ul className="space-y-2">
                  {selectedInternship.qualifications.map((qual, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {selectedInternship.benefits?.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">What We Offer</h4>
                </div>
                <ul className="space-y-2">
                  {selectedInternship.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dates */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Important Dates
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedInternship.startDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Application Deadline
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(
                      selectedInternship.applicationDeadline
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Apply Button in Modal */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button
                className={
                  isApplied(selectedInternship._id)
                    ? "w-full bg-green-600 hover:bg-green-700"
                    : "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }
                onClick={() => {
                  if (!isApplied(selectedInternship._id)) {
                    handleApply(selectedInternship._id);
                    setShowModal(false);
                  }
                }}
                disabled={isApplied(selectedInternship._id)}
                size="lg"
              >
                {isApplied(selectedInternship._id) ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Already Applied
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Apply for This Position
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BrowseInternships;

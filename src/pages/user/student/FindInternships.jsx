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
import Modal from "../../../components/ui/modal";
import {
  Search,
  Building2,
  MapPin,
  Clock,
  Users,
  Calendar,
  Briefcase,
  Target,
  FileText,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const FindInternships = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  }, []);

  useEffect(() => {
    filterInternships();
  }, [internships, searchTerm, selectedWorkType]);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadAppliedInternships();
    }
  }, [user?._id, user?.id]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching internships...");

      const response = await companiesAPI.getAll();
      console.log("📦 Internships response:", response);

      if (response.data && response.data.success) {
        const allInternships = [];
        response.data.data.forEach((company) => {
          if (company.ojtSlots && company.ojtSlots.length > 0) {
            company.ojtSlots.forEach((slot) => {
              if (slot.isActive) {
                allInternships.push({
                  ...slot,
                  company: {
                    _id: company._id,
                    companyName: company.companyName,
                    logo: company.logoUrl,
                    location: company.location,
                  },
                });
              }
            });
          }
        });
        setInternships(allInternships);
      } else {
        toast.error("Failed to load internships");
      }
    } catch (error) {
      console.error("❌ Error fetching internships:", error);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedInternships = async () => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    try {
      // First try to get from backend
      const response = await studentsAPI.getApplications();
      if (response.data && response.data.success) {
        const backendApplications = response.data.data.map((app) => app.slotId);
        setAppliedInternships(new Set(backendApplications));
        // Update localStorage with backend data
        localStorage.setItem(
          `appliedInternships_${userId}`,
          JSON.stringify(backendApplications)
        );
        return;
      }
    } catch (error) {
      console.log(
        "Could not fetch applications from backend, using localStorage"
      );
    }

    // Fallback to localStorage
    const applied = JSON.parse(
      localStorage.getItem(`appliedInternships_${userId}`) || "[]"
    );
    setAppliedInternships(new Set(applied));
  };

  const saveAppliedInternships = (appliedSet) => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    const appliedArray = Array.from(appliedSet);
    localStorage.setItem(
      `appliedInternships_${userId}`,
      JSON.stringify(appliedArray)
    );
  };

  const filterInternships = () => {
    let filtered = internships;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (internship) =>
          internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          internship.company?.companyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          internship.department
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          internship.location
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          internship.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
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

  const viewCompanyProfile = (companyId) => {
    navigate(`/student/company/${companyId}`);
  };

  const handleApply = async () => {
    if (!selectedInternship) return;

    try {
      console.log("📝 Applying to internship:", selectedInternship);

      // Call API to submit application
      await companiesAPI.applyToInternship(
        selectedInternship.company._id,
        selectedInternship._id
      );

      // Update local state
      const newApplied = new Set(appliedInternships);
      newApplied.add(selectedInternship._id);
      setAppliedInternships(newApplied);
      saveAppliedInternships(newApplied);

      toast.success("Application submitted successfully! 🎉");
    } catch (error) {
      console.error("❌ Error applying:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    }
  };

  const isApplied = (internshipId) => {
    return appliedInternships.has(internshipId);
  };

  const uniqueWorkTypes = [
    "All",
    ...new Set(
      internships.map((internship) => internship.workType).filter(Boolean)
    ),
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
                Find Internships
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Discover and apply to internship positions from top companies
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-gray-600 border-gray-300 text-xs sm:text-sm self-start sm:self-auto"
            >
              {filteredInternships.length} Opportunities
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
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-gray-500 text-sm sm:text-base"
              />
            </div>

            {/* Work Type Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by work type:
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {uniqueWorkTypes.map((workType) => (
                  <Button
                    key={workType}
                    variant={
                      selectedWorkType === workType ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedWorkType(workType)}
                    className={
                      selectedWorkType === workType
                        ? "bg-gray-800 hover:bg-gray-900 text-xs sm:text-sm"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm"
                    }
                  >
                    {workType}{" "}
                    {workType !== "All" &&
                      internships.filter((i) => i.workType === workType).length}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Internships Grid */}
        {filteredInternships.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Internships Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedWorkType !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "No internships are currently available."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredInternships.map((internship) => (
              <Card
                key={internship._id}
                className="hover:shadow-md transition-shadow border border-gray-200 cursor-pointer group h-full flex flex-col"
                onClick={() => {
                  setSelectedInternship(internship);
                  setShowModal(true);
                }}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  {/* Main Content - grows to fill available space */}
                  <div className="flex-1 flex flex-col">
                    {/* Company Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg font-bold text-gray-600">
                          {internship.company?.companyName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 group-hover:text-gray-700">
                          {internship.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {internship.company?.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Internship Info */}
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span>{internship.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span>
                          {internship.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span>{internship.duration} months</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      <Badge variant="outline" className="text-xs">
                        {internship.workType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {internship.positions} slot
                        {internship.positions > 1 ? "s" : ""}
                      </Badge>
                      {internship.applicationDeadline && (
                        <Badge variant="outline" className="text-xs">
                          Deadline:{" "}
                          {new Date(
                            internship.applicationDeadline
                          ).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {/* Description Preview */}
                    {internship.description && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
                          {internship.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Apply Button - always at bottom */}
                  <div className="mt-auto">
                    <Button
                      className={
                        isApplied(internship._id)
                          ? "w-full bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                          : "w-full bg-gray-800 hover:bg-gray-900 text-sm sm:text-base"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isApplied(internship._id)) {
                          setSelectedInternship(internship);
                          setShowModal(true);
                        }
                      }}
                      disabled={isApplied(internship._id)}
                    >
                      {isApplied(internship._id) ? (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Apply Now
                        </>
                      )}
                    </Button>
                  </div>
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
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedInternship.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedInternship.company?.companyName}
                  </p>
                </div>
              </div>
            }
          >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Key Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Department
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedInternship.department}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Duration
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedInternship.duration} months
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Positions
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedInternship.positions}{" "}
                    {selectedInternship.positions > 1 ? "slots" : "slot"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Location
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedInternship.location || "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium uppercase">
                      Work Type
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedInternship.workType}
                  </p>
                </div>

                {selectedInternship.applicationDeadline && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium uppercase">
                        Deadline
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        selectedInternship.applicationDeadline
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* About This Position */}
              {selectedInternship.description && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      About This Position
                    </h4>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 leading-relaxed">
                      {selectedInternship.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Responsibilities */}
              {selectedInternship.responsibilities?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Key Responsibilities
                    </h4>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedInternship.responsibilities.map((resp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {selectedInternship.qualifications?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Qualifications
                    </h4>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedInternship.qualifications.map((qual, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedInternship.benefits?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Benefits
                    </h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedInternship.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white pt-4 border-t space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    viewCompanyProfile(selectedInternship.company._id);
                    setShowModal(false);
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Company Profile
                </Button>
                <Button
                  className={
                    isApplied(selectedInternship._id)
                      ? "w-full bg-gray-600 hover:bg-gray-700"
                      : "w-full bg-gray-800 hover:bg-gray-900"
                  }
                  onClick={() => {
                    if (!isApplied(selectedInternship._id)) {
                      if (
                        window.confirm(
                          "Are you sure you want to apply for this position?"
                        )
                      ) {
                        handleApply();
                        setShowModal(false);
                      }
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
    </div>
  );
};

export default FindInternships;

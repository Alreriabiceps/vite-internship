import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { companiesAPI, studentsAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import Modal from "../../../components/ui/modal";
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
} from "lucide-react";
import toast from "react-hot-toast";

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedInternships, setAppliedInternships] = useState(new Set());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadAppliedInternships();
    }
  }, [user?._id, user?.id]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      console.log("🎯 Fetching company profile:", companyId);

      const response = await companiesAPI.getById(companyId);
      console.log("📦 Company profile response:", response);

      if (response.data.success && response.data.data) {
        setCompany(response.data.data);
      } else {
        toast.error("Company not found");
        navigate("/student/browse-internships");
      }
    } catch (error) {
      console.error("❌ Error fetching company profile:", error);
      toast.error("Failed to load company profile");
      navigate("/student/browse-internships");
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

  const showApplyConfirmation = (slot) => {
    setSelectedSlot(slot);
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!selectedSlot) return;

    try {
      console.log("🎯 Applying to internship slot:", selectedSlot._id);

      const response = await companiesAPI.applyToInternship(
        companyId,
        selectedSlot._id
      );
      console.log("📦 Apply response:", response);

      if (response.data.success) {
        // Add to applied internships
        const userId = user?._id || user?.id;
        const newApplied = [...appliedInternships, selectedSlot._id];
        setAppliedInternships(new Set(newApplied));
        localStorage.setItem(
          `appliedInternships_${userId}`,
          JSON.stringify(newApplied)
        );

        toast.success("Application submitted successfully! 🎉");
        setShowApplyModal(false);
        setSelectedSlot(null);
      } else {
        toast.error("Failed to submit application");
      }
    } catch (error) {
      console.error("❌ Error applying to internship:", error);
      toast.error("Failed to submit application");
    }
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedSlot(null);
  };

  const isApplied = (slotId) => {
    return appliedInternships.has(slotId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
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
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
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
          <Button onClick={() => navigate("/student/browse-internships")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Internships
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
            onClick={() => navigate("/student/browse-internships")}
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Internships
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

                  {/* Company Links */}
                  <div className="flex flex-col gap-2">
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
                    {company.linkedinUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(company.linkedinUrl, "_blank")
                        }
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        LinkedIn
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
              Available Internships
            </h2>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              {company.ojtSlots?.filter((slot) => slot.status === "open")
                .length || 0}{" "}
              Open Positions
            </Badge>
          </div>

          {!company.ojtSlots || company.ojtSlots.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Internships Available
                </h3>
                <p className="text-gray-600">
                  This company hasn't posted any internship opportunities yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {company.ojtSlots
                .filter((slot) => slot.isActive)
                .map((slot) => (
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
                          {getStatusBadge(slot.status)}
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
                                +{slot.skillRequirements.mustHave.length - 3}{" "}
                                more
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

                      {/* Apply Button */}
                      <Button
                        className={
                          isApplied(slot._id)
                            ? "w-full bg-gray-600 hover:bg-gray-700"
                            : slot.status === "open"
                            ? "w-full bg-gray-800 hover:bg-gray-900"
                            : "w-full bg-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                          if (slot.status === "open" && !isApplied(slot._id)) {
                            showApplyConfirmation(slot);
                          }
                        }}
                        disabled={slot.status !== "open" || isApplied(slot._id)}
                      >
                        {isApplied(slot._id) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Applied
                          </>
                        ) : slot.status === "open" ? (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Apply Now
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            {slot.status === "closed" ? "Closed" : "Filled"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply Confirmation Modal */}
      {selectedSlot && (
        <Modal
          isOpen={showApplyModal}
          onClose={closeApplyModal}
          title={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Application
                </h3>
                <p className="text-sm text-gray-600">
                  Review details before applying
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Internship Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                {selectedSlot.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span>{selectedSlot.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span>{selectedSlot.duration} months</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{selectedSlot.location || company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>
                    {selectedSlot.positions} position
                    {selectedSlot.positions > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-4 w-4 text-gray-600" />
                  <span>{selectedSlot.workType}</span>
                </div>
                {selectedSlot.applicationDeadline && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span>
                      Deadline:{" "}
                      {new Date(
                        selectedSlot.applicationDeadline
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedSlot.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedSlot.description}
                </p>
              </div>
            )}

            {/* Skills Required */}
            {selectedSlot.skillRequirements?.mustHave?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSlot.skillRequirements.mustHave.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {selectedSlot.responsibilities?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Responsibilities
                </h4>
                <ul className="space-y-1">
                  {selectedSlot.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {selectedSlot.benefits?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                <ul className="space-y-1">
                  {selectedSlot.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Ready to Apply?
                  </h4>
                  <p className="text-sm text-blue-700">
                    By clicking "Confirm Application", you will submit your
                    application to this internship position. Make sure you meet
                    the requirements and are ready to commit to this
                    opportunity.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={closeApplyModal}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-900"
                onClick={handleApply}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Application
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CompanyProfile;

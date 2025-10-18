import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import Modal from "../../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Eye,
  EyeOff,
  Search,
  Building2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Shield,
  ShieldCheck,
  ShieldX,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  Target,
  Gift,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../../lib/api";

const AdminInternshipPostings = () => {
  const [loading, setLoading] = useState(false);
  const [postings, setPostings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch internship postings");
      }

      const result = await response.json();
      setPostings(result.data.postings);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Error fetching internship postings:", error);
      toast.error("Failed to load internship postings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, [currentPage, searchTerm, statusFilter]);

  const handleToggleVisibility = async (companyId, slotIndex) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings/${companyId}/${slotIndex}/toggle-visibility`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchPostings(); // Refresh the list
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to toggle posting visibility");
    }
  };

  const handleViewDetails = (posting) => {
    setSelectedPosting(posting);
    setShowModal(true);
  };

  const handleApprove = async (companyId, slotIndex) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings/${companyId}/${slotIndex}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve posting");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchPostings(); // Refresh the list
    } catch (error) {
      console.error("Error approving posting:", error);
      toast.error("Failed to approve posting");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings/${selectedPosting.companyId}/${
          selectedPosting.slotIndex
        }/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject posting");
      }

      const result = await response.json();
      toast.success(result.message);
      setShowRejectModal(false);
      setRejectionReason("");
      fetchPostings(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting posting:", error);
      toast.error("Failed to reject posting");
    }
  };

  const handleConfirmApprove = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings/${selectedPosting.companyId}/${
          selectedPosting.slotIndex
        }/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve posting");
      }

      const result = await response.json();
      toast.success(result.message);
      setShowApproveModal(false);
      fetchPostings(); // Refresh the list
    } catch (error) {
      console.error("Error approving posting:", error);
      toast.error("Failed to approve posting");
    }
  };

  const handleUndoApproval = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/admin/internship-postings/${selectedPosting.companyId}/${
          selectedPosting.slotIndex
        }/undo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to undo approval");
      }

      const result = await response.json();
      toast.success(result.message);
      setShowUndoModal(false);
      fetchPostings(); // Refresh the list
    } catch (error) {
      console.error("Error undoing approval:", error);
      toast.error("Failed to undo approval");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactive
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <Badge
        variant="default"
        className="bg-blue-100 text-blue-800 flex items-center gap-1"
      >
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 flex items-center gap-1"
      >
        <ShieldX className="h-3 w-3" />
        Pending
      </Badge>
    );
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Internship Postings
          </h1>
          <p className="text-gray-600">
            Manage all internship job postings from companies
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search postings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end">
              <p className="text-sm text-gray-600">
                Total: {pagination.totalPostings || 0} postings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Internship Postings ({pagination.totalPostings || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : postings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No internship postings found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postings.map((posting) => (
                    <TableRow key={posting._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {posting.companyName || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {posting.companyIndustry || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {posting.posting?.title || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-48">
                            {posting.posting?.description || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {posting.posting?.department || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {typeof posting.posting.duration === "number"
                              ? `${posting.posting.duration} months`
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(posting.posting.isActive)}
                      </TableCell>
                      <TableCell>
                        {getApprovalStatusBadge(posting.posting.approvalStatus)}
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(posting.isCompanyVerified)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(posting)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {posting.posting.approvalStatus === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPosting(posting);
                                  setShowApproveModal(true);
                                }}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPosting(posting);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <ShieldX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {posting.posting.approvalStatus === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPosting(posting);
                                setShowUndoModal(true);
                              }}
                              className="text-orange-600 hover:bg-orange-50"
                              title="Undo Approval"
                            >
                              <ShieldX className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleVisibility(
                                posting.companyId,
                                posting._id.split("_")[1]
                              )
                            }
                            className={
                              posting.posting.isActive
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {posting.posting.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Internship Details
              </h3>
              <p className="text-xs text-gray-500">
                Complete position information
              </p>
            </div>
          </div>
        }
      >
        {selectedPosting && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
            {/* Hero Section */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {selectedPosting.posting?.title || "Internship Position"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {selectedPosting.posting?.department || "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedPosting.posting?.isActive)}
                    {selectedPosting.posting?.status ? (
                      <Badge variant="outline" className="bg-white">
                        {selectedPosting.posting.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white">
                        {selectedPosting.posting?.isActive ? "Open" : "Closed"}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-white">
                      {selectedPosting.posting?.workType || "On-site"}
                    </Badge>
                    {getVerificationBadge(selectedPosting.isCompanyVerified)}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedPosting.posting?.location ||
                        (selectedPosting.companyAddress &&
                        typeof selectedPosting.companyAddress === "object"
                          ? `${selectedPosting.companyAddress.street || ""}, ${
                              selectedPosting.companyAddress.city || ""
                            }, ${selectedPosting.companyAddress.province || ""}`
                              .replace(/^,\s*|,\s*$/g, "")
                              .replace(/,\s*,/g, ",")
                          : selectedPosting.companyAddress || "Not specified")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900">
                      {typeof selectedPosting.posting?.duration === "number"
                        ? `${selectedPosting.posting.duration} months`
                        : "Flexible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                      Positions
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedPosting.posting?.positions || 1}{" "}
                      {(selectedPosting.posting?.positions || 1) > 1
                        ? "slots"
                        : "slot"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedPosting.posting?.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    About This Position
                  </h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedPosting.posting.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {selectedPosting.posting?.responsibilities &&
              selectedPosting.posting.responsibilities.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Key Responsibilities
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedPosting.posting.responsibilities.map(
                      (resp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Requirements */}
            {selectedPosting.posting?.requirements &&
              selectedPosting.posting.requirements.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Requirements & Qualifications
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedPosting.posting.requirements.map((req, idx) => (
                      <li
                        key={`req-${idx}`}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                    {selectedPosting.posting.qualifications &&
                      selectedPosting.posting.qualifications.length > 0 &&
                      selectedPosting.posting.qualifications.map(
                        (qual, idx) => (
                          <li
                            key={`qual-${idx}`}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                            <span>{qual}</span>
                          </li>
                        )
                      )}
                  </ul>
                </div>
              )}

            {/* Benefits */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Gift className="h-4 w-4 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">What We Offer</h4>
              </div>
              <ul className="space-y-2">
                {/* Dynamic benefits from database */}
                {selectedPosting.posting?.benefits &&
                  selectedPosting.posting.benefits.length > 0 &&
                  selectedPosting.posting.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}

                {/* Static benefits if no dynamic ones */}
                {(!selectedPosting.posting?.benefits ||
                  selectedPosting.posting.benefits.length === 0) && (
                  <>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>
                        {selectedPosting.posting?.allowance
                          ? `Competitive monthly allowance of ₱${selectedPosting.posting.allowance.toLocaleString()}`
                          : "Competitive compensation package"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>
                        {selectedPosting.posting?.workType === "Hybrid"
                          ? "Flexible work schedule with hybrid work options"
                          : selectedPosting.posting?.workType === "Remote"
                          ? "Remote work opportunities"
                          : "On-site work experience"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>Hands-on experience with real projects</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>Mentorship from experienced professionals</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>
                        Opportunities for professional growth and learning
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>Certificate of completion</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Important Dates */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Important Dates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      START
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPosting.posting?.startDate
                        ? new Date(
                            selectedPosting.posting.startDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">DUE</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      Application Deadline
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedPosting.posting?.applicationDeadline
                        ? new Date(
                            selectedPosting.posting.applicationDeadline
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">END</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">End Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPosting.posting?.endDate
                        ? new Date(
                            selectedPosting.posting.endDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <Button
                variant={
                  selectedPosting.posting?.isActive ? "destructive" : "default"
                }
                onClick={() => {
                  handleToggleVisibility(
                    selectedPosting.companyId,
                    selectedPosting._id.split("_")[1]
                  );
                  setShowModal(false);
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
              >
                {selectedPosting.posting?.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
        }}
        title="Reject Internship Posting"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this internship posting..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Posting
            </Button>
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirm Approval"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                Approve Internship Posting
              </h3>
              <p className="text-sm text-green-700">
                Are you sure you want to approve this internship posting? Once
                approved, it will be visible to students.
              </p>
            </div>
          </div>

          {selectedPosting && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Posting Details:
              </h4>
              <p className="text-sm text-gray-600">
                <strong>Company:</strong> {selectedPosting.companyName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Position:</strong> {selectedPosting.posting?.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Department:</strong>{" "}
                {selectedPosting.posting?.department}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleConfirmApprove}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Yes, Approve
            </Button>
            <Button
              onClick={() => setShowApproveModal(false)}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Undo Approval Modal */}
      <Modal
        isOpen={showUndoModal}
        onClose={() => setShowUndoModal(false)}
        title="Undo Approval"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <ShieldX className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">Undo Approval</h3>
              <p className="text-sm text-orange-700">
                Are you sure you want to undo the approval? This will reset the
                posting back to pending status.
              </p>
            </div>
          </div>

          {selectedPosting && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Posting Details:
              </h4>
              <p className="text-sm text-gray-600">
                <strong>Company:</strong> {selectedPosting.companyName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Position:</strong> {selectedPosting.posting?.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Department:</strong>{" "}
                {selectedPosting.posting?.department}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUndoApproval}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ShieldX className="h-4 w-4 mr-2" />
              Yes, Undo Approval
            </Button>
            <Button
              onClick={() => setShowUndoModal(false)}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInternshipPostings;

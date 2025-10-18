import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { companiesAPI } from "../../../lib/api";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import Modal from "../../../components/ui/modal";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Save,
  FileText,
  Target,
  Gift,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Internships = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    internship: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    internship: null,
  });
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getProfile();
      const companyData = response.data?.data || response.data;
      setInternships(companyData.ojtSlots || []);
    } catch (error) {
      console.error("❌ Error fetching internships:", error);
      toast.error("Failed to load internships");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (internship) => {
    setViewModal({ isOpen: true, internship });
  };

  const handleEdit = (internship) => {
    setEditFormData({
      title: internship.title || "",
      department: internship.department || "",
      location: internship.location || "",
      duration: internship.duration || "",
      positions: internship.positions || 1,
      workType: internship.workType || "On-site",
      allowance: internship.allowance || 0,
      description: internship.description || "",
      responsibilities: Array.isArray(internship.responsibilities)
        ? internship.responsibilities.join("\n")
        : "",
      qualifications: Array.isArray(internship.qualifications)
        ? internship.qualifications.join("\n")
        : "",
      benefits: Array.isArray(internship.benefits)
        ? internship.benefits.join("\n")
        : "",
      applicationDeadline: internship.applicationDeadline
        ? internship.applicationDeadline.split("T")[0]
        : "",
      startDate: internship.startDate ? internship.startDate.split("T")[0] : "",
    });
    setEditModal({ isOpen: true, internship });
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const startDate = new Date(editFormData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(editFormData.duration));

      const updateData = {
        title: editFormData.title,
        department: editFormData.department,
        location: editFormData.location,
        duration: parseInt(editFormData.duration),
        positions: parseInt(editFormData.positions),
        workType: editFormData.workType,
        allowance: parseInt(editFormData.allowance) || 0,
        description: editFormData.description,
        responsibilities: editFormData.responsibilities
          .split("\n")
          .filter((r) => r.trim()),
        qualifications: editFormData.qualifications
          .split("\n")
          .filter((q) => q.trim()),
        benefits: editFormData.benefits.split("\n").filter((b) => b.trim()),
        applicationDeadline: editFormData.applicationDeadline,
        startDate: editFormData.startDate,
        endDate: endDate.toISOString().split("T")[0],
      };

      await companiesAPI.updateSlot(editModal.internship._id, updateData);
      toast.success("Internship updated successfully!");
      setEditModal({ isOpen: false, internship: null });
      fetchInternships();
    } catch (error) {
      console.error("❌ Error updating internship:", error);
      toast.error("Failed to update internship");
    } finally {
      setSaving(false);
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
      await companiesAPI.deleteSlot(slotId);
      toast.success("Internship deleted successfully");
      fetchInternships();
    } catch (error) {
      console.error("❌ Error deleting internship:", error);
      toast.error("Failed to delete internship");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: "Open",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      closed: {
        label: "Closed",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      filled: {
        label: "Filled",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };
    const config = statusConfig[status] || statusConfig.open;
    return <Badge className={config.className}>{config.label}</Badge>;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Internship Positions
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your internship postings
              </p>
            </div>
            <Button
              onClick={() => navigate("/company/post-internship")}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Internship
            </Button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <Card
                key={internship._id}
                className="hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardContent className="p-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                          {internship.title || "Internship Position"}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {internship.department || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(internship.status)}
                      {getApprovalStatusBadge(internship.approvalStatus)}
                      <Button
                        onClick={() =>
                          navigate(
                            `/company/browse-interns?internshipId=${internship._id}`
                          )
                        }
                        className="relative bg-gray-800 hover:bg-gray-900 text-white p-2"
                        size="sm"
                      >
                        <Users className="h-4 w-4" />
                        {internship.applicants?.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            {internship.applicants.length}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Important Info Section */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 font-medium">
                          Location
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {internship.location || "Not specified"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 font-medium">
                          Duration
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {internship.duration
                          ? `${internship.duration} months`
                          : "Flexible"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(internship)}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(internship)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(internship._id)}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Modal - Beautiful Design */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, internship: null })}
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
        {viewModal.internship && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
            {/* Hero Section */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {viewModal.internship.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Building2 className="h-4 w-4" />
                    <span>{viewModal.internship.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(viewModal.internship.status)}
                    {getApprovalStatusBadge(
                      viewModal.internship.approvalStatus
                    )}
                    <Badge variant="outline" className="bg-white">
                      {viewModal.internship.workType}
                    </Badge>
                  </div>
                  {viewModal.internship.approvalStatus === "rejected" &&
                    viewModal.internship.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong>{" "}
                          {viewModal.internship.rejectionReason}
                        </p>
                      </div>
                    )}
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
                      {viewModal.internship.location || "Not specified"}
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
                      {viewModal.internship.duration} months
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
                      {viewModal.internship.positions}{" "}
                      {viewModal.internship.positions > 1 ? "slots" : "slot"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {viewModal.internship.description && (
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
                  {viewModal.internship.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {viewModal.internship.responsibilities?.length > 0 && (
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
                  {viewModal.internship.responsibilities.map((resp, idx) => (
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
            {viewModal.internship.qualifications?.length > 0 && (
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
                  {viewModal.internship.qualifications.map((qual, idx) => (
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
            {viewModal.internship.benefits?.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Gift className="h-4 w-4 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">What We Offer</h4>
                </div>
                <ul className="space-y-2">
                  {viewModal.internship.benefits.map((benefit, idx) => (
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

            {/* Important Dates */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Important Dates
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      START
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        viewModal.internship.startDate
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
                      {new Date(
                        viewModal.internship.applicationDeadline
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal - Beautiful Form */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, internship: null })}
        title={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Edit Internship
              </h3>
              <p className="text-xs text-gray-500">Update position details</p>
            </div>
          </div>
        }
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-600" />
              Basic Information
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Position Title *
                </Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="edit-department"
                    className="text-sm font-medium"
                  >
                    Department *
                  </Label>
                  <Input
                    id="edit-department"
                    value={editFormData.department}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        department: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-location"
                    className="text-sm font-medium"
                  >
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Position Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-duration" className="text-sm font-medium">
                  Duration (months) *
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={editFormData.duration}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      duration: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-positions" className="text-sm font-medium">
                  Number of Positions
                </Label>
                <Input
                  id="edit-positions"
                  type="number"
                  min="1"
                  value={editFormData.positions}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      positions: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-workType" className="text-sm font-medium">
                  Work Type
                </Label>
                <select
                  id="edit-workType"
                  value={editFormData.workType}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      workType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-allowance" className="text-sm font-medium">
                  Allowance (₱)
                </Label>
                <Input
                  id="edit-allowance"
                  type="number"
                  min="0"
                  value={editFormData.allowance}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      allowance: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              Important Dates
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-startDate" className="text-sm font-medium">
                  Start Date *
                </Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      startDate: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-deadline" className="text-sm font-medium">
                  Application Deadline *
                </Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editFormData.applicationDeadline}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      applicationDeadline: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="edit-description"
              className="text-sm font-medium flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Position Description *
            </Label>
            <Textarea
              id="edit-description"
              rows={3}
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>

          {/* Responsibilities */}
          <div>
            <Label
              htmlFor="edit-responsibilities"
              className="text-sm font-medium"
            >
              Responsibilities (one per line)
            </Label>
            <Textarea
              id="edit-responsibilities"
              rows={3}
              value={editFormData.responsibilities}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  responsibilities: e.target.value,
                })
              }
              className="mt-1"
              placeholder="Enter each responsibility on a new line"
            />
          </div>

          {/* Qualifications */}
          <div>
            <Label
              htmlFor="edit-qualifications"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Target className="h-4 w-4" />
              Qualifications (one per line)
            </Label>
            <Textarea
              id="edit-qualifications"
              rows={3}
              value={editFormData.qualifications}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  qualifications: e.target.value,
                })
              }
              className="mt-1"
              placeholder="Enter each qualification on a new line"
            />
          </div>

          {/* Benefits */}
          <div>
            <Label
              htmlFor="edit-benefits"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Gift className="h-4 w-4" />
              Benefits & Perks (one per line)
            </Label>
            <Textarea
              id="edit-benefits"
              rows={2}
              value={editFormData.benefits}
              onChange={(e) =>
                setEditFormData({ ...editFormData, benefits: e.target.value })
              }
              className="mt-1"
              placeholder="Enter each benefit on a new line"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => setEditModal({ isOpen: false, internship: null })}
              variant="outline"
              disabled={saving}
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

export default Internships;

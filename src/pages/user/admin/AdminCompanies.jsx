import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Modal from "../../../components/ui/modal";
import {
  Building2,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Globe,
  Eye,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  EyeOff,
  Key,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedVerification, setSelectedVerification] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCompanyForPassword, setSelectedCompanyForPassword] =
    useState(null);
  const [newPassword, setNewPassword] = useState("");

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedCompanyForVerification, setSelectedCompanyForVerification] =
    useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [companiesPerPage] = useState(10);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [
    searchTerm,
    selectedIndustry,
    selectedStatus,
    selectedVerification,
    companies,
  ]);

  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/companies?page=${page}&limit=${companiesPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      setCompanies(data.companies || []);
      setTotalPages(data.totalPages || 1);
      setTotalCompanies(data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((company) =>
        `${company.companyName} ${company.email} ${company.contactPerson} ${company.industry}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (selectedIndustry !== "All") {
      filtered = filtered.filter(
        (company) => company.industry === selectedIndustry
      );
    }

    // Status filter
    if (selectedStatus !== "All") {
      if (selectedStatus === "active") {
        filtered = filtered.filter((company) => company.isActive);
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter((company) => !company.isActive);
      }
    }

    // Verification filter
    if (selectedVerification !== "All") {
      if (selectedVerification === "verified") {
        filtered = filtered.filter((company) => company.isVerified);
      } else if (selectedVerification === "unverified") {
        filtered = filtered.filter((company) => !company.isVerified);
      }
    }

    setFilteredCompanies(filtered);
  };

  const handleViewCompany = async (companyId) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleToggleProfileVisibility = async (companyId) => {
    try {
      const response = await fetch(
        `/api/admin/companies/${companyId}/toggle-visibility`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle profile visibility");
      }

      const data = await response.json();
      toast.success(data.message);

      // Update the company in the list
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === companyId
            ? { ...company, isProfileHidden: data.isProfileHidden }
            : company
        )
      );

      // Update filtered companies as well
      setFilteredCompanies((prevFiltered) =>
        prevFiltered.map((company) =>
          company._id === companyId
            ? { ...company, isProfileHidden: data.isProfileHidden }
            : company
        )
      );
    } catch (error) {
      console.error("Error toggling profile visibility:", error);
      toast.error("Failed to toggle profile visibility");
    }
  };

  const openResetPasswordModal = (company) => {
    setSelectedCompanyForPassword(company);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/companies/${selectedCompanyForPassword._id}/reset-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      const data = await response.json();
      toast.success(data.message);
      setShowPasswordModal(false);
      setSelectedCompanyForPassword(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    }
  };

  const openVerificationModal = (company, status) => {
    setSelectedCompanyForVerification(company);
    setVerificationStatus(status);
    setVerificationNotes(company.verificationNotes || "");
    setShowVerificationModal(true);
  };

  const handleVerification = async () => {
    try {
      const response = await fetch(
        `/api/companies/${selectedCompanyForVerification._id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            isVerified: verificationStatus === "approve",
            verificationNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update verification");
      }

      const data = await response.json();
      toast.success(data.message);

      // Update the company in the list
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === selectedCompanyForVerification._id
            ? {
                ...company,
                isVerified: data.data.isVerified,
                verificationNotes,
              }
            : company
        )
      );

      // Update filtered companies as well
      setFilteredCompanies((prevFiltered) =>
        prevFiltered.map((company) =>
          company._id === selectedCompanyForVerification._id
            ? {
                ...company,
                isVerified: data.data.isVerified,
                verificationNotes,
              }
            : company
        )
      );

      setShowVerificationModal(false);
      setSelectedCompanyForVerification(null);
      setVerificationStatus("");
      setVerificationNotes("");
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification");
    }
  };

  const getVerificationDetails = (company) => {
    const details = {
      completed: [],
      missing: [],
      total: 0,
      completedCount: 0,
    };

    // Check basic company information
    const basicInfo = [
      { field: "Company Name", value: company.companyName, required: true },
      { field: "Email", value: company.email, required: true },
      { field: "Phone", value: company.phone, required: true },
      { field: "Address", value: company.address, required: true },
      { field: "Industry", value: company.industry, required: true },
      { field: "Company Size", value: company.companySize, required: true },
      { field: "Website", value: company.website, required: false },
      { field: "Description", value: company.description, required: true },
    ];

    basicInfo.forEach((info) => {
      details.total++;
      if (info.value && info.value.trim() !== "") {
        details.completed.push({
          field: info.field,
          value: info.value,
          required: info.required,
          status: "completed",
        });
        details.completedCount++;
      } else {
        details.missing.push({
          field: info.field,
          required: info.required,
          status: "missing",
        });
      }
    });

    return details;
  };

  const getUniqueIndustries = () => {
    const industries = [
      ...new Set(companies.map((company) => company.industry)),
    ];
    return industries.filter((industry) => industry && industry.trim() !== "");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("All");
    setSelectedStatus("All");
    setSelectedVerification("All");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">All Companies</h1>
        <p className="text-muted-foreground">
          Manage and view all registered companies
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedIndustry}
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Industries</SelectItem>
                {getUniqueIndustries().map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedVerification}
              onValueChange={setSelectedVerification}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchCompanies}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({totalCompanies})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No companies found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{company.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {company.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {company.contactPerson}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {company.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{company.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          company.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          company.isVerified
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {company.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCompany(company._id)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleProfileVisibility(company._id)
                          }
                          title={
                            company.isProfileHidden
                              ? "Show Profile"
                              : "Hide Profile"
                          }
                          className={
                            company.isProfileHidden
                              ? "text-red-600 hover:text-red-700"
                              : "text-gray-600 hover:text-gray-700"
                          }
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openResetPasswordModal(company)}
                          title="Reset Password"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        {!company.isVerified ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openVerificationModal(company, "approve")
                            }
                            title="Approve Verification"
                            className="text-green-600 hover:text-green-700"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openVerificationModal(company, "reject")
                            }
                            title="Revoke Verification"
                            className="text-red-600 hover:text-red-700"
                          >
                            <ShieldX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * companiesPerPage + 1} to{" "}
              {Math.min(currentPage * companiesPerPage, totalCompanies)} of{" "}
              {totalCompanies} companies
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCompanies(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchCompanies(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCompanies(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Password Reset Modal */}
      {showPasswordModal && selectedCompanyForPassword && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedCompanyForPassword(null);
            setNewPassword("");
          }}
          title="Reset Company Password"
        >
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Password Reset</p>
                  <p>
                    This will reset the password for{" "}
                    <strong>{selectedCompanyForPassword.companyName}</strong>.
                    The company will need to use this new password to log in.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (minimum 6 characters)"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedCompanyForPassword(null);
                  setNewPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedCompanyForVerification && (
        <Modal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedCompanyForVerification(null);
            setVerificationNotes("");
            setVerificationStatus("");
          }}
          title={
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  verificationStatus === "approve"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {verificationStatus === "approve" ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldX className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {verificationStatus === "approve"
                    ? "Approve Company Verification"
                    : "Revoke Company Verification"}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedCompanyForVerification.companyName}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                verificationStatus === "approve"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {verificationStatus === "approve" ? (
                  <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <ShieldX className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div
                  className={`text-sm ${
                    verificationStatus === "approve"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  <p className="font-medium mb-1">
                    {verificationStatus === "approve"
                      ? "Company Verification Approval"
                      : "Company Verification Revocation"}
                  </p>
                  <p>
                    {verificationStatus === "approve"
                      ? "This will mark the company as verified and allow them to access all platform features."
                      : "This will revoke the company's verification status and restrict their access to certain features."}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Company Information Review
              </label>
              {/* Verification Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Verification Summary
                  </h4>
                  <div className="text-sm text-gray-600">
                    {
                      getVerificationDetails(selectedCompanyForVerification)
                        .completedCount
                    }{" "}
                    /{" "}
                    {
                      getVerificationDetails(selectedCompanyForVerification)
                        .total
                    }{" "}
                    fields completed
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (getVerificationDetails(selectedCompanyForVerification)
                          .completedCount /
                          getVerificationDetails(selectedCompanyForVerification)
                            .total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Completed Fields */}
              {getVerificationDetails(selectedCompanyForVerification).completed
                .length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed Fields (
                    {
                      getVerificationDetails(selectedCompanyForVerification)
                        .completed.length
                    }
                    )
                  </h5>
                  <div className="space-y-1">
                    {getVerificationDetails(
                      selectedCompanyForVerification
                    ).completed.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm text-green-800">
                            {field.field}
                          </span>
                          {field.required && (
                            <span className="text-xs text-red-600">*</span>
                          )}
                        </div>
                        <span className="text-xs text-green-600 truncate max-w-48">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Fields */}
              {getVerificationDetails(selectedCompanyForVerification).missing
                .length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Missing Fields (
                    {
                      getVerificationDetails(selectedCompanyForVerification)
                        .missing.length
                    }
                    )
                  </h5>
                  <div className="space-y-1">
                    {getVerificationDetails(
                      selectedCompanyForVerification
                    ).missing.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span className="text-sm text-red-800">
                            {field.field}
                          </span>
                          {field.required && (
                            <span className="text-xs text-red-600">*</span>
                          )}
                        </div>
                        <span className="text-xs text-red-600">
                          Not provided
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about your verification decision..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Provide detailed notes about your verification decision
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedCompanyForVerification(null);
                  setVerificationStatus("");
                  setVerificationNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerification}
                className={
                  verificationStatus === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {verificationStatus === "approve" ? "Approve" : "Revoke"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminCompanies;

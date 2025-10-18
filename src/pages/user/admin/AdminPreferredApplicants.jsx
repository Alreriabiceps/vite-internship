import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  Eye,
  ExternalLink,
  Phone,
  Code,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminPreferredApplicants = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `/api/admin/companies/preferred-applicants?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch companies with preferred applicants");
      }

      const result = await response.json();
      setCompanies(result.data.companies);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies with preferred applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleViewStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }

      const data = await response.json();
      setSelectedStudent(data.student);
      setShowStudentModal(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Whitelisted Students
          </h1>
          <p className="text-gray-600">
            View all companies and their whitelisted students directly in the
            table
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Total Companies: {pagination.totalCompanies || 0}
          </p>
          <p className="text-sm text-gray-500">
            Total Preferred Applicants:{" "}
            {pagination.totalPreferredApplicants || 0}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Companies with Whitelisted Students (
            {pagination.totalCompanies || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No companies found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Whitelisted Students</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <button
                              onClick={() => handleCompanyClick(company._id)}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                            >
                              {company.companyName}
                            </button>
                            <p className="text-sm text-gray-500">
                              {company.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {company.totalPreferredApplicants}
                          </span>
                          <span className="text-sm text-gray-500">
                            {company.totalPreferredApplicants === 1
                              ? "student"
                              : "students"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(company)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* Company Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedCompany?.companyName}
              </h3>
              <p className="text-xs text-gray-500">
                Whitelisted Students Details
              </p>
            </div>
          </div>
        }
      >
        {selectedCompany && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
            {/* Company Info */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Company Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedCompany.companyName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedCompany.email}
                    </p>
                    <p>
                      <strong>Industry:</strong> {selectedCompany.industry}
                    </p>
                    <p>
                      <strong>Size:</strong> {selectedCompany.companySize}
                    </p>
                    {selectedCompany.website && (
                      <p>
                        <strong>Website:</strong>{" "}
                        <a
                          href={selectedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {selectedCompany.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Total Whitelisted Students:</strong>{" "}
                      {selectedCompany.totalPreferredApplicants}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Whitelisted Students List */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  Whitelisted Students (
                  {selectedCompany.preferredApplicants.length})
                </h4>
              </div>

              {selectedCompany.preferredApplicants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No whitelisted students yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCompany.preferredApplicants.map((pref, index) => (
                    <div
                      key={pref._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={pref.student?.profilePicUrl}
                              alt={pref.student?.firstName}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {pref.student?.firstName?.[0]}
                              {pref.student?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <button
                              onClick={() =>
                                handleViewStudent(pref.student?._id)
                              }
                              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer text-left"
                            >
                              {pref.student?.firstName} {pref.student?.lastName}
                            </button>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {pref.student?.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {pref.student?.studentId}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {pref.student?.program}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Year {pref.student?.yearLevel}
                              </Badge>
                            </div>
                            {pref.student?.skills &&
                              pref.student.skills.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">
                                    Skills:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {pref.student.skills
                                      .slice(0, 5)
                                      .map((skill, skillIndex) => (
                                        <Badge
                                          key={skillIndex}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {typeof skill === "string"
                                            ? skill
                                            : skill.name}
                                        </Badge>
                                      ))}
                                    {pref.student.skills.length > 5 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +{pref.student.skills.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(pref.addedAt)}
                          </div>
                        </div>
                      </div>
                      {pref.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">
                              Notes:
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{pref.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
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

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

// Student Details Modal Component
const StudentDetailsModal = ({ student, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.profilePicUrl} alt={student.firstName} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              {student.studentId} • {student.program}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
        {/* Hero Section */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {student.firstName} {student.lastName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <GraduationCap className="h-4 w-4" />
                <span>{student.program}</span>
                <span>•</span>
                <span>{student.yearLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    student.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  className={
                    student.isAvailable
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {student.isAvailable ? "Available" : "Unavailable"}
                </Badge>
                {student.isProfileHidden && (
                  <Badge className="bg-red-100 text-red-800">
                    Profile Hidden
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader className="border-b py-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-1 gap-2">
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow
                icon={Calendar}
                label="Age"
                value={student.age ? `${student.age} years old` : null}
              />
              <InfoRow icon={User} label="Gender" value={student.sex} />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader className="border-b py-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-1 gap-2">
              <InfoRow
                icon={FileText}
                label="Student ID"
                value={student.studentId}
              />
              <InfoRow
                icon={GraduationCap}
                label="Program"
                value={student.program}
              />
              <InfoRow
                icon={Calendar}
                label="Year Level"
                value={student.yearLevel}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {student.skills && student.skills.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Code className="h-5 w-5 text-purple-600" />
                </div>
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {student.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                    {skill.level && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < skill.level
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Soft Skills */}
        {student.softSkills && student.softSkills.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {student.softSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                    {skill.level && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < skill.level
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  );
};

// Helper Components
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
      <div className="flex items-center gap-1.5 text-gray-700">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xs text-gray-900 truncate ml-2">{value}</span>
    </div>
  );
};

export default AdminPreferredApplicants;

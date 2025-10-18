import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
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
  Shield,
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  MapPin,
  Eye,
  MoreHorizontal,
  EyeOff,
  Code,
  Award,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  X,
  Briefcase,
  FileText,
  Clock,
  Heart,
  Star,
  User,
  Key,
  Filter,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminInterns = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  // Filter states
  const [programFilter, setProgramFilter] = useState("All");
  const [yearLevelFilter, setYearLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  // Reset password state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [studentToReset, setStudentToReset] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsPerPage] = useState(10);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search term and filters
    let filtered = students;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((student) =>
        `${student.firstName} ${student.lastName} ${student.email} ${student.studentId} ${student.program}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Apply program filter
    if (programFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.program === programFilter
      );
    }

    // Apply year level filter
    if (yearLevelFilter !== "All") {
      filtered = filtered.filter(
        (student) => student.yearLevel === yearLevelFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Active") {
        filtered = filtered.filter((student) => student.isActive);
      } else if (statusFilter === "Inactive") {
        filtered = filtered.filter((student) => !student.isActive);
      } else if (statusFilter === "Available") {
        filtered = filtered.filter((student) => student.isAvailable);
      } else if (statusFilter === "Unavailable") {
        filtered = filtered.filter((student) => !student.isAvailable);
      }
    }

    // Apply visibility filter
    if (visibilityFilter !== "All") {
      if (visibilityFilter === "Visible") {
        filtered = filtered.filter((student) => !student.isProfileHidden);
      } else if (visibilityFilter === "Hidden") {
        filtered = filtered.filter((student) => student.isProfileHidden);
      }
    }

    setFilteredStudents(filtered);
  }, [
    searchTerm,
    students,
    programFilter,
    yearLevelFilter,
    statusFilter,
    visibilityFilter,
  ]);

  const fetchStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/students?page=${page}&limit=${studentsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data.students || []);
      setTotalPages(data.totalPages || 1);
      setTotalStudents(data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
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
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to load student details");
    }
  };

  const handleToggleProfileVisibility = async (studentId) => {
    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/toggle-visibility`,
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

      // Update the student in the list
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === studentId
            ? { ...student, isProfileHidden: data.isProfileHidden }
            : student
        )
      );

      // Update filtered students as well
      setFilteredStudents((prevFiltered) =>
        prevFiltered.map((student) =>
          student._id === studentId
            ? { ...student, isProfileHidden: data.isProfileHidden }
            : student
        )
      );
    } catch (error) {
      console.error("Error toggling profile visibility:", error);
      toast.error("Failed to toggle profile visibility");
    }
  };

  const handleToggleInternshipReadiness = async (studentId) => {
    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/toggle-readiness`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle internship readiness");
      }

      const data = await response.json();
      toast.success(data.message);

      // Update the student in the list
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === studentId
            ? { ...student, isInternshipReady: data.isInternshipReady }
            : student
        )
      );

      // Update filtered students as well
      setFilteredStudents((prevFiltered) =>
        prevFiltered.map((student) =>
          student._id === studentId
            ? { ...student, isInternshipReady: data.isInternshipReady }
            : student
        )
      );
    } catch (error) {
      console.error("Error toggling internship readiness:", error);
      toast.error("Failed to toggle internship readiness");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await fetch(
        `/api/admin/students/${studentToReset._id}/reset-password`,
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

      // Close modal and reset form
      setShowResetPasswordModal(false);
      setStudentToReset(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openResetPasswordModal = (student) => {
    setStudentToReset(student);
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const clearFilters = () => {
    setProgramFilter("All");
    setYearLevelFilter("All");
    setStatusFilter("All");
    setVisibilityFilter("All");
    setSearchTerm("");
  };

  const getUniquePrograms = () => {
    const programs = [...new Set(students.map((student) => student.program))];
    return programs.sort();
  };

  const getUniqueYearLevels = () => {
    const yearLevels = [
      ...new Set(students.map((student) => student.yearLevel)),
    ];
    return yearLevels.sort();
  };

  const getStatusBadge = (student) => {
    if (!student.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (student.isAvailable) {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
    return <Badge variant="secondary">Unavailable</Badge>;
  };

  const getYearLevelBadge = (yearLevel) => {
    const colors = {
      "1st Year": "bg-blue-100 text-blue-800",
      "2nd Year": "bg-green-100 text-green-800",
      "3rd Year": "bg-yellow-100 text-yellow-800",
      "4th Year": "bg-purple-100 text-purple-800",
      "5th Year": "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[yearLevel] || "bg-gray-100 text-gray-800"}>
        {yearLevel}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">All Interns</h1>
        <p className="text-muted-foreground">
          View and manage all student accounts
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            Search and manage all student accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, student ID, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchStudents} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Program</Label>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  {getUniquePrograms().map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Year Level</Label>
              <Select
                value={yearLevelFilter}
                onValueChange={setYearLevelFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Year Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Year Levels</SelectItem>
                  {getUniqueYearLevels().map((yearLevel) => (
                    <SelectItem key={yearLevel} value={yearLevel}>
                      {yearLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility</Label>
              <Select
                value={visibilityFilter}
                onValueChange={setVisibilityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Visibility</SelectItem>
                  <SelectItem value="Visible">Visible</SelectItem>
                  <SelectItem value="Hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Students Table */}
          <div className="rounded-md border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                Students ({totalStudents})
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No students found matching your search"
                            : "No students found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={student.profilePicUrl}
                              alt={student.firstName}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {student.firstName?.[0]}
                              {student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {student.studentId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{student.program}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getYearLevelBadge(student.yearLevel)}
                      </TableCell>
                      <TableCell>{getStatusBadge(student)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student._id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleProfileVisibility(student._id)
                            }
                            title={
                              student.isProfileHidden
                                ? "Show Profile"
                                : "Hide Profile"
                            }
                            className={
                              student.isProfileHidden
                                ? "text-red-600 hover:text-red-700"
                                : "text-gray-600 hover:text-gray-700"
                            }
                          >
                            {student.isProfileHidden ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetPasswordModal(student)}
                            title="Reset Password"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleInternshipReadiness(student._id)
                            }
                            title={
                              student.isInternshipReady
                                ? "Mark as Not Ready"
                                : "Mark as Internship Ready"
                            }
                            className={
                              student.isInternshipReady
                                ? "text-green-600 hover:text-green-700"
                                : "text-gray-600 hover:text-gray-700"
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * studentsPerPage + 1} to{" "}
                {Math.min(currentPage * studentsPerPage, totalStudents)} of{" "}
                {totalStudents} students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStudents(currentPage - 1)}
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
                        onClick={() => fetchStudents(page)}
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
                  onClick={() => fetchStudents(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          viewingImage={viewingImage}
          setViewingImage={setViewingImage}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && studentToReset && (
        <Modal
          isOpen={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false);
            setStudentToReset(null);
            setNewPassword("");
          }}
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Key className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Reset Password
                </h3>
                <p className="text-xs text-gray-500">
                  {studentToReset.firstName} {studentToReset.lastName}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    This will reset the student's password. They will need to
                    use the new password to log in.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setStudentToReset(null);
                  setNewPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={isResettingPassword || !newPassword.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Certificate Image Viewer */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={viewingImage}
              alt="Certificate"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Student Details Modal Component
const StudentDetailsModal = ({
  student,
  onClose,
  viewingImage,
  setViewingImage,
}) => {
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
                      {skill.name}
                    </span>
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
                      {skill.name}
                    </span>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Links */}
        {(student.resumeUrl ||
          student.portfolioUrl ||
          student.linkedinUrl ||
          student.githubUrl) && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                Portfolio & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 gap-2">
                {student.resumeUrl && (
                  <LinkRow
                    icon={FileText}
                    label="Resume"
                    url={student.resumeUrl}
                  />
                )}
                {student.portfolioUrl && (
                  <LinkRow
                    icon={Briefcase}
                    label="Portfolio"
                    url={student.portfolioUrl}
                  />
                )}
                {student.linkedinUrl && (
                  <LinkRow
                    icon={Linkedin}
                    label="LinkedIn"
                    url={student.linkedinUrl}
                  />
                )}
                {student.githubUrl && (
                  <LinkRow
                    icon={Github}
                    label="GitHub"
                    url={student.githubUrl}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {student.certifications && student.certifications.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {cert.imageUrl ? (
                      <img
                        src={cert.imageUrl}
                        alt={cert.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                        <Award className="h-12 w-12 text-yellow-600" />
                      </div>
                    )}
                    <div className="p-2 bg-white">
                      <p className="font-medium text-xs text-gray-900 truncate">
                        {cert.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {cert.issuer}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cert.imageUrl && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0 bg-white hover:bg-gray-100"
                          onClick={() => setViewingImage(cert.imageUrl)}
                          title="View Certificate"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {(cert.verificationUrl || cert.certificateUrl) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0 bg-white hover:bg-gray-100"
                          onClick={() =>
                            window.open(
                              cert.verificationUrl || cert.certificateUrl,
                              "_blank"
                            )
                          }
                          title="Open Link"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        {student.badges && student.badges.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-teal-100 rounded-lg">
                  <Award className="h-5 w-5 text-teal-600" />
                </div>
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {student.badges.map((badge, index) => {
                  const badgeUrl = badge.url || badge.externalUrl || badge.link;
                  const BadgeContent = (
                    <div className="text-center group">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-teal-500 transition-colors">
                        {badge.iconUrl || badge.imageUrl || badge.image ? (
                          <img
                            src={badge.iconUrl || badge.imageUrl || badge.image}
                            alt={badge.name || badge.badgeName}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                            <Award className="h-8 w-8 text-teal-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-900 mt-1 truncate">
                        {badge.name || badge.badgeName}
                      </p>
                    </div>
                  );

                  return badgeUrl ? (
                    <a
                      key={index}
                      href={badgeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:scale-105 transition-transform duration-200"
                      title={`View ${
                        badge.name || badge.badgeName
                      } - Opens in new tab`}
                    >
                      {BadgeContent}
                    </a>
                  ) : (
                    <div
                      key={index}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      {BadgeContent}
                    </div>
                  );
                })}
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

const LinkRow = ({ icon: Icon, label, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-gray-700">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
    </a>
  );
};

export default AdminInterns;

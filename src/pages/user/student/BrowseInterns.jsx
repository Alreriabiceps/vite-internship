import { useState, useEffect } from "react";
import { studentsAPI } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import { getCourseLogoAbsolute } from "../../../lib/imageUtils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import Modal from "../../../components/ui/modal";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Code,
  Users,
  Award,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  Eye,
  X,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  Star,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseInterns = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      fetchStudents();
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedCourse, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );

      const response = await Promise.race([
        studentsAPI.getAll({ limit: 100 }), // Increase limit to get more students
        timeoutPromise,
      ]);

      // Handle different response structures
      let studentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (
          response.data.students &&
          Array.isArray(response.data.students)
        ) {
          studentsData = response.data.students;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }

      // Ensure we have an array before filtering
      if (!Array.isArray(studentsData)) {
        studentsData = [];
      }

      // Filter out the current user from the list
      const currentUserId = user?.id || user?._id;
      const otherStudents = studentsData.filter(
        (student) => student && student._id && student._id !== currentUserId
      );

      setStudents(otherStudents);
    } catch (error) {
      // Show more specific error message
      const errorMessage =
        error.response?.data?.message || "Failed to load students";
      toast.error(errorMessage);

      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((student) =>
        `${student.firstName} ${student.lastName} ${student.program} ${student.studentId}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== "All") {
      filtered = filtered.filter(
        (student) => student.program === selectedCourse
      );
    }

    setFilteredStudents(filtered);
  };

  const getCourseLogo = getCourseLogoAbsolute;

  const getUniqueCourses = () => {
    const courses = [...new Set(students.map((student) => student.program))];
    return courses.filter((course) => course && course.trim() !== "");
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setShowModal(false);
  };

  const currentUserId = user?.id || user?._id;

  // Show loading only if we're actually loading and have a user
  if (loading && currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not loaded yet
  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Fellow Interns
          </h1>
          <p className="text-gray-600">
            Discover and connect with other students in your field
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, program, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Programs</option>
                {getUniqueCourses().map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card
                key={student._id}
                className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openStudentModal(student)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={student.profilePicUrl}
                        alt={`${student.firstName} ${student.lastName}`}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {student.firstName?.[0]}
                        {student.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {student.program}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.yearLevel} • {student.studentId}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Skills Preview */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {typeof skill === "string" ? skill : skill.name}
                            {typeof skill === "object" && skill.level && (
                              <span className="ml-1">
                                {skill.level === 1
                                  ? "★"
                                  : skill.level === 2
                                  ? "★★"
                                  : skill.level === 3
                                  ? "★★★"
                                  : skill.level === 4
                                  ? "★★★★"
                                  : skill.level === 5
                                  ? "★★★★★"
                                  : "★"}
                              </span>
                            )}
                          </Badge>
                        ))}
                        {student.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Course Logo */}
                  {getCourseLogo(student.program) && (
                    <div className="mb-3">
                      <img
                        src={getCourseLogo(student.program)}
                        alt={student.program}
                        className="h-8 w-auto"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {student.preferredFields?.location?.[0] ||
                          "Not specified"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <Modal
            isOpen={showModal}
            onClose={closeStudentModal}
            title={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedStudent.profilePicUrl}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {selectedStudent.firstName?.[0]}
                    {selectedStudent.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <p className="text-gray-600">{selectedStudent.program}</p>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.yearLevel} • {selectedStudent.studentId}
                  </p>
                </div>
                {getCourseLogo(selectedStudent.program) && (
                  <img
                    src={getCourseLogo(selectedStudent.program)}
                    alt={selectedStudent.program}
                    className="h-12 w-auto"
                  />
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStudent.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {selectedStudent.email}
                      </span>
                    </div>
                  )}
                  {selectedStudent.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {selectedStudent.phone}
                      </span>
                    </div>
                  )}
                  {selectedStudent.preferredFields?.location?.[0] && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {selectedStudent.preferredFields.location[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {typeof skill === "string" ? skill : skill.name}
                        {typeof skill === "object" && skill.level && (
                          <span className="ml-1">
                            {skill.level === 1
                              ? "★"
                              : skill.level === 2
                              ? "★★"
                              : skill.level === 3
                              ? "★★★"
                              : skill.level === 4
                              ? "★★★★"
                              : skill.level === 5
                              ? "★★★★★"
                              : "★"}
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {selectedStudent.softSkills &&
                selectedStudent.softSkills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.softSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Certifications */}
              {selectedStudent.certifications &&
                selectedStudent.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-medium">
                            {cert.name}
                          </span>
                          {cert.certificateUrl && (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Online Presence */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Online Presence
                </h3>
                <div className="space-y-2">
                  {selectedStudent.linkedinUrl && (
                    <a
                      href={selectedStudent.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-600">
                        LinkedIn Profile
                      </span>
                      <ExternalLink className="h-3 w-3 text-blue-600 ml-auto" />
                    </a>
                  )}
                  {selectedStudent.githubUrl && (
                    <a
                      href={selectedStudent.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Github className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        GitHub Profile
                      </span>
                      <ExternalLink className="h-3 w-3 text-gray-600 ml-auto" />
                    </a>
                  )}
                  {selectedStudent.resumeUrl && (
                    <a
                      href={selectedStudent.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-600">Resume</span>
                      <ExternalLink className="h-3 w-3 text-green-600 ml-auto" />
                    </a>
                  )}
                  {selectedStudent.portfolioUrl && (
                    <a
                      href={selectedStudent.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Globe className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm text-purple-600">Portfolio</span>
                      <ExternalLink className="h-3 w-3 text-purple-600 ml-auto" />
                    </a>
                  )}
                </div>
              </div>

              {/* Work Preferences */}
              {selectedStudent.preferredFields && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {selectedStudent.preferredFields.workType && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Work Type:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {selectedStudent.preferredFields.workType}
                        </span>
                      </div>
                    )}
                    {selectedStudent.preferredFields.schedule && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Schedule:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {selectedStudent.preferredFields.schedule}
                        </span>
                      </div>
                    )}
                    {selectedStudent.preferredFields.durationHours && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Duration:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {Math.round(
                            selectedStudent.preferredFields.durationHours / 40
                          )}{" "}
                          weeks
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default BrowseInterns;

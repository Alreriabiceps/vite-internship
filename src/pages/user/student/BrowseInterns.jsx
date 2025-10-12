import { useState, useEffect } from "react";
import { studentsAPI } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
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

  const getCourseLogo = (program) => {
    if (!program) return null;
    const programLower = program.toLowerCase();
    console.log("🔍 Program:", program, "Lower:", programLower);

    if (programLower.includes("business")) {
      console.log("✅ Business match - returning:", "/BUSINES ADD.png");
      return "/BUSINES ADD.png";
    }
    if (programLower.includes("criminal")) {
      console.log("✅ Criminal match - returning:", "/CRIMINAL JUSTICE.png");
      return "/CRIMINAL JUSTICE.png";
    }
    if (programLower.includes("education")) {
      console.log("✅ Education match - returning:", "/EDUCATION.png");
      return "/EDUCATION.png";
    }
    if (
      programLower.includes("information") ||
      programLower.includes("computer")
    ) {
      console.log(
        "✅ Information match - returning:",
        "/INFORMATION SYSTEM.png"
      );
      return "/INFORMATION SYSTEM.png";
    }
    if (programLower.includes("maritime")) {
      console.log("✅ Maritime match - returning:", "/MARITIME.png");
      return "/MARITIME.png";
    }
    if (programLower.includes("nurse") || programLower.includes("nursing")) {
      console.log("✅ Nurse match - returning:", "/NURSE.png");
      return "/NURSE.png";
    }
    if (programLower.includes("tourism")) {
      console.log("✅ Tourism match - returning:", "/TOURISM.png");
      return "/TOURISM.png";
    }

    console.log("❌ No match found for program:", program);
    return null;
  };

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
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No students are currently available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredStudents.map((student) => (
              <Card
                key={student._id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden relative flex flex-col h-full"
                onClick={() => openStudentModal(student)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  {/* Student Header */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm mb-3">
                      <AvatarImage
                        src={student.profilePicUrl || student.profilePictureUrl}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                        {student.firstName?.[0]}
                        {student.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-1">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem]">
                      {student.program}
                    </p>
                    <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                      {student.yearLevel}
                    </Badge>
                  </div>

                  {/* Student ID */}
                  {student.studentId && (
                    <div className="flex items-center justify-center gap-1.5 mb-3 px-2 py-1.5 bg-gray-50 rounded">
                      <FileText className="h-3 w-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-600">
                        ID: {student.studentId}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600 p-1.5 bg-gray-50 rounded">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 p-1.5 bg-gray-50 rounded">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Internship Preferences */}
                  {student.preferredFields && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                        <p className="text-xs font-medium text-gray-700">
                          Preferences
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.preferredFields.workType && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-700 bg-gray-50"
                          >
                            {student.preferredFields.workType}
                          </Badge>
                        )}
                        {student.preferredFields.schedule && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-700 bg-gray-50"
                          >
                            {student.preferredFields.schedule}
                          </Badge>
                        )}
                        {student.preferredFields.durationHours && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-700 bg-gray-50"
                          >
                            {student.preferredFields.durationHours}h
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Preview */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Code className="h-3.5 w-3.5 text-gray-500" />
                        <p className="text-xs font-medium text-gray-700">
                          Top Skills
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, index) => {
                          const skillName =
                            typeof skill === "string"
                              ? skill
                              : skill?.name || "Unknown Skill";
                          const skillLevel =
                            typeof skill === "object" ? skill?.level : null;

                          return (
                            <Badge
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 border-0"
                            >
                              {skillName}
                              {skillLevel && (
                                <span className="ml-1 text-yellow-600">
                                  {skillLevel === 1
                                    ? "★"
                                    : skillLevel === 2
                                    ? "★★"
                                    : skillLevel === 3
                                    ? "★★★"
                                    : skillLevel === 4
                                    ? "★★★★"
                                    : skillLevel === 5
                                    ? "★★★★★"
                                    : "★"}
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                        {student.skills.length > 3 && (
                          <Badge className="text-xs bg-gray-200 text-gray-600 border-0">
                            +{student.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Award className="h-3.5 w-3.5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-gray-900">
                        {student.certifications?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Certs</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Star className="h-3.5 w-3.5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-gray-900">
                        {student.badges?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Badges</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Code className="h-3.5 w-3.5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-gray-900">
                        {student.skills?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Skills</p>
                    </div>
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1"></div>

                  {/* View Profile Button - Fixed at bottom */}
                  <Button
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudentModal(student);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <StudentProfileModal
            student={selectedStudent}
            isOpen={showModal}
            onClose={closeStudentModal}
          />
        )}
      </div>
    </div>
  );
};

// Student Profile Modal Component (matching company layout)
const StudentProfileModal = ({ student, isOpen, onClose }) => {
  const [viewingImage, setViewingImage] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile">
      <div className="space-y-4">
        {/* Hero Section - Simple */}
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-gray-300">
                <AvatarImage
                  src={student.profilePicUrl || student.profilePictureUrl}
                />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                  {student.firstName} {student.middleName} {student.lastName}
                </h1>
                <p className="text-gray-600 text-sm mb-0.5">
                  {student.program}
                </p>
                <p className="text-gray-500 text-xs">{student.yearLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Layout - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Personal Information */}
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-gray-100 rounded">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow
                icon={User}
                label="Gender"
                value={student.sex || "Not specified"}
              />
              <InfoRow
                icon={Calendar}
                label="Age"
                value={student.age || "Not specified"}
              />
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-gray-100 rounded">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                </div>
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
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
            </CardContent>
          </Card>

          {/* Online Presence */}
          {(student.portfolioUrl ||
            student.linkedinUrl ||
            student.githubUrl ||
            student.resumeUrl) && (
            <Card>
              <CardHeader className="border-b py-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-gray-100 rounded">
                    <Globe className="h-4 w-4 text-gray-600" />
                  </div>
                  Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                {student.portfolioUrl && (
                  <LinkRow
                    icon={Globe}
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
                {student.resumeUrl && (
                  <LinkRow
                    icon={FileText}
                    label="Resume"
                    url={student.resumeUrl}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Internship Preferences */}
          {student.preferredFields && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                  </div>
                  Internship Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <InfoRow
                  icon={Briefcase}
                  label="Work Type"
                  value={student.preferredFields.workType}
                />
                {student.preferredFields.schedule && (
                  <InfoRow
                    icon={Calendar}
                    label="Schedule"
                    value={student.preferredFields.schedule}
                  />
                )}
                {student.preferredFields.durationHours && (
                  <InfoRow
                    icon={Clock}
                    label="Duration"
                    value={`${student.preferredFields.durationHours} hours`}
                  />
                )}
                {student.preferredFields.location &&
                  student.preferredFields.location.length > 0 && (
                    <InfoRow
                      icon={MapPin}
                      label="Preferred Locations"
                      value={student.preferredFields.location.join(", ")}
                    />
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skills Section - Full Width */}
        {student.skills && student.skills.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-gray-100 rounded">
                  <Code className="h-5 w-5 text-gray-600" />
                </div>
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill, index) => {
                  const skillName =
                    typeof skill === "string"
                      ? skill
                      : skill?.name || "Unknown Skill";
                  const skillLevel =
                    typeof skill === "object" ? skill?.level : null;

                  return (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skillName}
                      {skillLevel && (
                        <span className="ml-1 text-yellow-500">
                          {skillLevel === 1
                            ? "★"
                            : skillLevel === 2
                            ? "★★"
                            : skillLevel === 3
                            ? "★★★"
                            : skillLevel === 4
                            ? "★★★★"
                            : skillLevel === 5
                            ? "★★★★★"
                            : "★"}
                        </span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Soft Skills */}
        {student.softSkills && student.softSkills.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-gray-100 rounded">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {student.softSkills.map((skill, index) => {
                  const skillName =
                    typeof skill === "string"
                      ? skill
                      : skill?.name || "Unknown Skill";

                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-pink-300 text-pink-700"
                    >
                      {skillName}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates */}
        {student.certifications && student.certifications.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-gray-100 rounded">
                  <Award className="h-5 w-5 text-gray-600" />
                </div>
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <Award className="h-12 w-12 text-gray-600" />
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
                <div className="p-1.5 bg-gray-100 rounded">
                  <Award className="h-5 w-5 text-gray-600" />
                </div>
                Badges & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {student.badges.map((badge, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-gray-400 transition-colors">
                      {badge.iconUrl || badge.imageUrl || badge.image ? (
                        <img
                          src={badge.iconUrl || badge.imageUrl || badge.image}
                          alt={badge.name || badge.badgeName}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                          <Award className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 mt-1 truncate">
                      {badge.name || badge.badgeName}
                    </p>
                  </div>
                ))}
              </div>
              {student.badges.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No badges available
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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

export default BrowseInterns;

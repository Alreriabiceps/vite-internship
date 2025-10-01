import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { studentsAPI, companiesAPI } from "../../../lib/api";
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
  Heart,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseInterns = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const internshipId = searchParams.get("internshipId");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [internshipTitle, setInternshipTitle] = useState("");
  const [shortlistedStudents, setShortlistedStudents] = useState(() => {
    // Load shortlist from localStorage
    const saved = localStorage.getItem("shortlistedStudents");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchStudents();
    fetchShortlistedStudents();
  }, [internshipId]);

  const fetchShortlistedStudents = async () => {
    try {
      // Fetch the company's profile to get preferred applicants
      const response = await companiesAPI.getProfile();
      const companyData = response.data?.data || response.data;

      if (
        companyData.preferredApplicants &&
        companyData.preferredApplicants.length > 0
      ) {
        console.log(
          "📋 Found preferred applicants:",
          companyData.preferredApplicants.length
        );

        // Fetch full student details for each preferred applicant
        const studentIds = companyData.preferredApplicants.map(
          (app) => app.studentId
        );
        const studentPromises = studentIds.map((id) => studentsAPI.getById(id));

        try {
          const studentResponses = await Promise.all(studentPromises);
          const studentData = studentResponses.map(
            (res) => res.data?.data || res.data
          );

          setShortlistedStudents(studentData);
          console.log(
            "✅ Loaded shortlisted students from database:",
            studentData.length
          );
        } catch (error) {
          console.error("⚠️ Error fetching student details:", error);
          // Just use the IDs if we can't fetch full details
          setShortlistedStudents(
            companyData.preferredApplicants.map((app) => ({
              _id: app.studentId,
            }))
          );
        }
      } else {
        console.log("📋 No preferred applicants found in database");
      }
    } catch (error) {
      console.error("❌ Error fetching shortlisted students:", error);
    }
  };

  // Save shortlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "shortlistedStudents",
      JSON.stringify(shortlistedStudents)
    );
  }, [shortlistedStudents]);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedCourse, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // If internshipId is provided, fetch only applicants for that internship
      if (internshipId) {
        console.log("📋 Fetching applicants for internship:", internshipId);
        const companyResponse = await companiesAPI.getProfile();
        const companyData = companyResponse.data?.data || companyResponse.data;

        // Find the specific internship
        const internship = companyData.ojtSlots?.find(
          (slot) => slot._id === internshipId
        );

        if (internship) {
          setInternshipTitle(internship.title);

          if (internship.applicants && internship.applicants.length > 0) {
            console.log("👥 Found applicants:", internship.applicants.length);

            // Fetch full student details for each applicant
            const applicantDetails = await Promise.all(
              internship.applicants.map(async (applicant) => {
                try {
                  const studentResponse = await studentsAPI.getById(
                    applicant.studentId
                  );
                  return studentResponse.data?.data || studentResponse.data;
                } catch (error) {
                  console.error("⚠️ Error fetching applicant:", error);
                  return null;
                }
              })
            );

            const validStudents = applicantDetails.filter(Boolean);
            setStudents(validStudents);
            setFilteredStudents(validStudents);
          } else {
            console.log("📭 No applicants yet for this internship");
            setStudents([]);
            setFilteredStudents([]);
          }
        } else {
          console.log("❌ Internship not found");
          toast.error("Internship not found");
        }
      } else {
        // Fetch all students (normal browse mode)
        const response = await studentsAPI.getAll();
        console.log("📚 Students fetched:", response.data);

        const studentsData = response.data?.students || response.data || [];
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by course/program
    if (selectedCourse !== "All") {
      filtered = filtered.filter(
        (student) => student.program === selectedCourse
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((student) => {
        return (
          student.firstName?.toLowerCase().includes(searchLower) ||
          student.lastName?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower) ||
          student.program?.toLowerCase().includes(searchLower) ||
          student.studentId?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredStudents(filtered);
  };

  // Get unique courses/programs from students
  const uniqueCourses = [
    "All",
    ...new Set(students.map((s) => s.program).filter(Boolean)),
  ];

  const viewStudentProfile = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const toggleShortlist = async (student, e) => {
    e.stopPropagation(); // Prevent card click event

    const isShortlisted = shortlistedStudents.some(
      (s) => s._id === student._id
    );

    try {
      if (isShortlisted) {
        // Remove from shortlist
        console.log(
          "🗑️ Removing student from preferred applicants:",
          student._id
        );
        await companiesAPI.removePreferredApplicant(user._id, student._id);

        setShortlistedStudents((prev) =>
          prev.filter((s) => s._id !== student._id)
        );
        toast.success(
          `${student.firstName} ${student.lastName} removed from shortlist`
        );
      } else {
        // Add to shortlist
        console.log("➕ Adding student to preferred applicants:", student._id);
        await companiesAPI.addPreferredApplicant(user._id, {
          studentId: student._id,
          notes: `Interested in ${student.firstName} ${student.lastName} for internship position.`,
        });

        setShortlistedStudents((prev) => [...prev, student]);
        toast.success(
          `${student.firstName} ${student.lastName} added to shortlist!`
        );
      }
    } catch (error) {
      console.error("❌ Error updating shortlist:", error);
      toast.error("Failed to update shortlist. Please try again.");
    }
  };

  const isShortlisted = (studentId) => {
    return shortlistedStudents.some((s) => s._id === studentId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
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
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {internshipId && internshipTitle
              ? `Applicants for ${internshipTitle}`
              : "Browse Interns"}
          </h1>
          <p className="text-gray-600 mt-1">
            {internshipId && internshipTitle
              ? `Showing ${filteredStudents.length} ${
                  filteredStudents.length === 1 ? "applicant" : "applicants"
                } who applied to this position`
              : "Find the perfect intern for your company"}
          </p>
        </div>
        {shortlistedStudents.length > 0 && (
          <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-lg border-2 border-pink-200">
            <Heart className="h-5 w-5 text-pink-600 fill-pink-600" />
            <div>
              <p className="text-sm font-bold text-pink-700">
                {shortlistedStudents.length} Shortlisted
              </p>
              <p className="text-xs text-pink-600">
                {shortlistedStudents.length === 1 ? "candidate" : "candidates"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar & Filters - Compact */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, program, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Course Filter Tabs */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <GraduationCap className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">
                Filter by Program
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {uniqueCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    selectedCourse === course
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {course}
                  {course !== "All" && (
                    <span className="ml-1.5 text-xs opacity-75">
                      ({students.filter((s) => s.program === course).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between py-2">
        <p className="text-xs text-gray-600">
          Showing{" "}
          <span className="font-semibold">{filteredStudents.length}</span> of{" "}
          {students.length} students
          {selectedCourse !== "All" && (
            <span className="ml-2 text-blue-600 font-semibold">
              in {selectedCourse}
            </span>
          )}
        </p>
        {(searchTerm || selectedCourse !== "All") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCourse("All");
            }}
            className="text-gray-600 hover:text-gray-900 h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
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
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-blue-400 rounded-xl overflow-hidden relative"
              onClick={() => viewStudentProfile(student)}
            >
              {/* Shortlist Button */}
              <button
                onClick={(e) => toggleShortlist(student, e)}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
                  isShortlisted(student._id)
                    ? "bg-pink-100 hover:bg-pink-200"
                    : "bg-white/80 hover:bg-white shadow-md"
                }`}
                title={
                  isShortlisted(student._id)
                    ? "Remove from shortlist"
                    : "Add to shortlist"
                }
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    isShortlisted(student._id)
                      ? "text-pink-600 fill-pink-600"
                      : "text-gray-600 hover:text-pink-600"
                  }`}
                />
              </button>

              <CardContent className="p-6">
                {/* Student Header */}
                <div className="flex flex-col items-center text-center mb-5">
                  <Avatar className="h-20 w-20 border-3 border-white shadow-lg ring-2 ring-blue-100 mb-3">
                    <AvatarImage
                      src={student.profilePicUrl || student.profilePictureUrl}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                      {student.firstName?.[0]}
                      {student.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem]">
                    {student.program}
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                    {student.yearLevel}
                  </Badge>
                </div>

                {/* Student ID */}
                {student.studentId && (
                  <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-2 bg-gray-50 rounded-lg">
                    <FileText className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">
                      ID: {student.studentId}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-700 p-2 bg-blue-50 rounded-lg">
                    <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate font-medium">
                      {student.email}
                    </span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 p-2 bg-green-50 rounded-lg">
                      <div className="h-7 w-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-medium">{student.phone}</span>
                    </div>
                  )}
                </div>

                {/* Internship Preferences */}
                {student.preferredFields && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        Preferences
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {student.preferredFields.workType && (
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-300 text-purple-700 bg-purple-50"
                        >
                          {student.preferredFields.workType}
                        </Badge>
                      )}
                      {student.preferredFields.schedule && (
                        <Badge
                          variant="outline"
                          className="text-xs border-orange-300 text-orange-700 bg-orange-50"
                        >
                          {student.preferredFields.schedule}
                        </Badge>
                      )}
                      {student.preferredFields.durationHours && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-300 text-blue-700 bg-blue-50"
                        >
                          {student.preferredFields.durationHours}h
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Preview */}
                {student.skills && student.skills.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Code className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">
                        Top Skills
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0"
                        >
                          {skill.name || skill}
                        </Badge>
                      ))}
                      {student.skills.length > 3 && (
                        <Badge className="text-xs bg-gray-200 text-gray-700 border-0">
                          +{student.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">
                      {student.certifications?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600">Certs</p>
                  </div>
                  <div className="text-center p-2 bg-teal-50 rounded-lg">
                    <Award className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">
                      {student.badges?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600">Badges</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Code className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">
                      {student.skills?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600">Skills</p>
                  </div>
                </div>

                {/* View Profile Button */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewStudentProfile(student);
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// Student Profile Modal Component (similar to Dashboard layout)
const StudentProfileModal = ({ student, isOpen, onClose }) => {
  const [viewingImage, setViewingImage] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile">
      <div className="space-y-4">
        {/* Hero Section - Compact */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white">
                <AvatarImage
                  src={student.profilePicUrl || student.profilePictureUrl}
                />
                <AvatarFallback className="text-lg">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-white">
                <h1 className="text-xl font-bold mb-1">
                  {student.firstName} {student.middleName} {student.lastName}
                </h1>
                <p className="text-blue-100 text-sm mb-0.5">
                  {student.program}
                </p>
                <p className="text-blue-200 text-xs">{student.yearLevel}</p>
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
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
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
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-green-600" />
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
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Globe className="h-4 w-4 text-purple-600" />
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
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="h-4 w-4 text-orange-600" />
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
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Code className="h-5 w-5 text-indigo-600" />
                </div>
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill.name || skill}
                  </Badge>
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
                <div className="p-1.5 bg-pink-100 rounded-lg">
                  <Users className="h-5 w-5 text-pink-600" />
                </div>
                Soft Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {student.softSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-pink-300 text-pink-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates */}
        {student.certifications && student.certifications.length > 0 && (
          <Card>
            <CardHeader className="border-b py-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
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
                Badges & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {student.badges.map((badge, index) => (
                  <div key={index} className="text-center group">
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

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
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseInterns = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const internshipId = searchParams.get("internshipId");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState({
    shortlisted: [],
    regular: [],
    all: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [internshipTitle, setInternshipTitle] = useState("");
  const [shortlistedStudents, setShortlistedStudents] = useState([]);

  useEffect(() => {
    // Clear localStorage to start fresh
    localStorage.removeItem("shortlistedStudents");
    fetchStudents();
    fetchShortlistedStudents();
  }, [internshipId]);

  const fetchShortlistedStudents = async () => {
    try {
      // Start with empty shortlist to avoid showing old data
      setShortlistedStudents([]);
      console.log("📋 Starting with empty shortlist");

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
  }, [searchTerm, selectedCourse, students, shortlistedStudents]);

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
            // Initial filter will be applied by filterStudents() in useEffect
          } else {
            console.log("📭 No applicants yet for this internship");
            setStudents([]);
            setFilteredStudents({
              shortlisted: [],
              regular: [],
              all: [],
            });
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
        // Initial filter will be applied by filterStudents() in useEffect
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

    // Separate shortlisted and non-shortlisted students
    const shortlistedIds = shortlistedStudents.map((s) => s._id);
    const shortlistedFiltered = filtered.filter((student) =>
      shortlistedIds.includes(student._id)
    );
    const regularFiltered = filtered.filter(
      (student) => !shortlistedIds.includes(student._id)
    );

    console.log("🔄 Filtering students:", {
      totalStudents: students.length,
      filteredStudents: filtered.length,
      shortlistedCount: shortlistedFiltered.length,
      regularCount: regularFiltered.length,
      shortlistedIds: shortlistedIds,
    });

    setFilteredStudents({
      shortlisted: shortlistedFiltered,
      regular: regularFiltered,
      all: filtered,
    });
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

        setShortlistedStudents((prev) => {
          const updated = prev.filter((s) => s._id !== student._id);
          console.log("🗑️ Removed from shortlist:", {
            studentId: student._id,
            studentName: `${student.firstName} ${student.lastName}`,
            newShortlistCount: updated.length,
          });
          return updated;
        });
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

        setShortlistedStudents((prev) => {
          const updated = [...prev, student];
          console.log("➕ Added to shortlist:", {
            studentId: student._id,
            studentName: `${student.firstName} ${student.lastName}`,
            newShortlistCount: updated.length,
          });
          return updated;
        });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {internshipId && internshipTitle
              ? `Applicants for ${internshipTitle}`
              : "Browse Interns"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {internshipId && internshipTitle
              ? `Showing ${filteredStudents.length} ${
                  filteredStudents.length === 1 ? "applicant" : "applicants"
                } who applied to this position`
              : "Find the perfect intern for your company"}
          </p>
          {shortlistedStudents.length > 0 && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 mt-3">
              <Heart className="h-4 w-4 text-gray-600 fill-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {shortlistedStudents.length} Shortlisted
                </p>
                <p className="text-xs text-gray-600">
                  {shortlistedStudents.length === 1
                    ? "candidate"
                    : "candidates"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, program, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Programs</option>
                {uniqueCourses.map((course) => (
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
            Showing {filteredStudents.all.length} of {students.length} students
            {filteredStudents.shortlisted.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({filteredStudents.shortlisted.length} shortlisted)
              </span>
            )}
          </p>
        </div>

        {/* Students Grid */}
        {filteredStudents.all.length === 0 ? (
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
          <div className="space-y-8">
            {/* Shortlisted Students Section */}
            {filteredStudents.shortlisted.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shortlisted Students ({filteredStudents.shortlisted.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {filteredStudents.shortlisted.map((student) => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      shortlistedStudents={shortlistedStudents}
                      setShortlistedStudents={setShortlistedStudents}
                      onViewProfile={viewStudentProfile}
                      onRefreshShortlist={fetchShortlistedStudents}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Students Section */}
            {filteredStudents.regular.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Students ({filteredStudents.regular.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {filteredStudents.regular.map((student) => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      shortlistedStudents={shortlistedStudents}
                      setShortlistedStudents={setShortlistedStudents}
                      onViewProfile={viewStudentProfile}
                      onRefreshShortlist={fetchShortlistedStudents}
                    />
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};

// Student Card Component
const StudentCard = ({
  student,
  shortlistedStudents,
  setShortlistedStudents,
  onViewProfile,
  onRefreshShortlist,
}) => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isShortlisted = (studentId) => {
    return shortlistedStudents.some((s) => s._id === studentId);
  };

  const toggleShortlist = async (student, e) => {
    e.stopPropagation(); // Prevent card click event

    const isShortlisted = shortlistedStudents.some(
      (s) => s._id === student._id
    );

    console.log("🔄 Toggle shortlist:", {
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      isShortlisted,
      companyId: user._id,
    });

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
        console.log("➕ Adding student to preferred applicants:", {
          companyId: user._id,
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
        });

        const response = await companiesAPI.addPreferredApplicant(user._id, {
          studentId: student._id,
          notes: `Interested in ${student.firstName} ${student.lastName} for internship position.`,
        });

        console.log("✅ API Response:", response.data);
        setShortlistedStudents((prev) => [...prev, student]);
        toast.success(
          `${student.firstName} ${student.lastName} added to shortlist!`
        );
      }
    } catch (error) {
      console.error("❌ Error updating shortlist:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Bad request";
        if (errorMessage.includes("already in preferred applicants")) {
          toast.error("This student is already in your shortlist");
          // Refresh the shortlist to sync with database
          onRefreshShortlist();
        } else {
          toast.error(`Error: ${errorMessage}`);
        }
      } else {
        toast.error("Failed to update shortlist. Please try again.");
      }
    }
  };

  const viewStudentProfile = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getCourseLogo = (program) => {
    if (!program) return null;

    // Debug logging
    console.log("🎨 Getting course logo for program:", program);

    const logoMap = {
      // Business Administration variations
      "Business Administration": "/BUSINES ADD.png",
      "Bachelor of Science in Business Administration": "/BUSINES ADD.png",
      Business: "/BUSINES ADD.png",
      BSBA: "/BUSINES ADD.png",

      // Criminal Justice variations
      "Criminal Justice": "/CRIMINAL JUSTICE.png",
      "Bachelor of Science in Criminal Justice": "/CRIMINAL JUSTICE.png",
      Criminal: "/CRIMINAL JUSTICE.png",
      BSCJ: "/CRIMINAL JUSTICE.png",

      // Education variations
      Education: "/EDUCATION.png",
      "Bachelor of Science in Education": "/EDUCATION.png",
      BSE: "/EDUCATION.png",

      // Information System variations
      "Information System": "/INFORMATION SYSTEM.png",
      "Bachelor of Science in Information System": "/INFORMATION SYSTEM.png",
      "Information Systems": "/INFORMATION SYSTEM.png",
      "Computer Science": "/INFORMATION SYSTEM.png",
      IT: "/INFORMATION SYSTEM.png",
      BSIS: "/INFORMATION SYSTEM.png",

      // Maritime variations
      Maritime: "/MARITIME.png",
      "Bachelor of Science in Maritime": "/MARITIME.png",
      "Maritime Engineering": "/MARITIME.png",
      BSM: "/MARITIME.png",

      // Nursing variations
      Nursing: "/NURSE.png",
      "Bachelor of Science in Nursing": "/NURSE.png",
      BSN: "/NURSE.png",

      // Tourism variations
      Tourism: "/TOURISM.png",
      "Bachelor of Science in Tourism": "/TOURISM.png",
      "Tourism Management": "/TOURISM.png",
      BST: "/TOURISM.png",
    };

    const logoPath = logoMap[program] || null;

    // If no exact match, try case-insensitive matching
    if (!logoPath) {
      const programLower = program.toLowerCase();
      for (const [key, value] of Object.entries(logoMap)) {
        if (key.toLowerCase() === programLower) {
          console.log("🎨 Case-insensitive match found:", key, "->", value);
          return value;
        }
      }
    }

    // If still no match, try partial matching
    if (!logoPath) {
      const programLower = program.toLowerCase();
      for (const [key, value] of Object.entries(logoMap)) {
        if (
          programLower.includes(key.toLowerCase()) ||
          key.toLowerCase().includes(programLower)
        ) {
          console.log("🎨 Partial match found:", key, "->", value);
          return value;
        }
      }
    }

    console.log("🎨 Logo path:", logoPath);
    return logoPath;
  };

  return (
    <>
      <Card
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden relative flex flex-col h-full"
        onClick={() => onViewProfile(student)}
      >
        {/* Background Course Logo - Top Right */}
        {getCourseLogo(student.program) && (
          <div className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none z-0">
            <img
              src={getCourseLogo(student.program)}
              alt=""
              className="w-full h-full object-contain"
              onLoad={() =>
                console.log("🎨 Background image loaded for:", student.program)
              }
              onError={() =>
                console.log(
                  "❌ Background image failed to load for:",
                  student.program
                )
              }
            />
          </div>
        )}
        <CardContent className="p-3 sm:p-4 flex flex-col h-full relative z-10">
          {/* Student Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1 truncate">
                  {student.firstName} {student.lastName}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem]">
                {student.program}
              </p>
              <div className="flex items-center gap-1 mb-1">
                <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                  {student.yearLevel}
                </Badge>
                {student.isInternshipReady && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                )}
              </div>
            </div>
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-gray-200 shadow-sm ml-2 sm:ml-3 flex-shrink-0">
              <AvatarImage
                src={student.profilePicUrl || student.profilePictureUrl}
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                {student.firstName?.[0]}
                {student.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
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
                <p className="text-xs font-medium text-gray-700">Preferences</p>
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
                <p className="text-xs font-medium text-gray-700">Top Skills</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {student.skills.slice(0, 3).map((skill, index) => {
                  // Handle different skill object structures
                  let skillName = "Unknown Skill";
                  let skillLevel = null;

                  if (typeof skill === "string") {
                    skillName = skill;
                  } else if (typeof skill === "object" && skill !== null) {
                    skillName =
                      skill.name || skill.skillName || "Unknown Skill";
                    skillLevel = skill.level || skill.skillLevel || null;
                  }

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
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-900">
                {student.certifications?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Certs</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-900">
                {student.badges?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Badges</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
              <Code className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-900">
                {student.skills?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Skills</p>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1"></div>

          {/* Bottom Buttons - Fixed at bottom */}
          <div className="flex gap-1.5">
            {/* Shortlist Button */}
            <Button
              className={`flex-1 text-xs py-1.5 px-2 border ${
                isShortlisted(student._id)
                  ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleShortlist(student, e);
              }}
              title={
                isShortlisted(student._id)
                  ? "Remove from shortlist"
                  : "Add to shortlist"
              }
            >
              <Heart
                className={`h-3 w-3 mr-1 ${
                  isShortlisted(student._id) ? "fill-gray-600" : ""
                }`}
              />
              <span className="hidden md:inline">
                {isShortlisted(student._id) ? "Shortlisted" : "Shortlist"}
              </span>
              <span className="md:hidden">
                {isShortlisted(student._id) ? "✓" : "+"}
              </span>
            </Button>

            {/* View Profile Button */}
            <Button
              className="flex-1 text-xs py-1.5 px-2 bg-gray-800 hover:bg-gray-900 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(student);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden md:inline">View Profile</span>
              <span className="md:hidden">View</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </>
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
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-blue-200 text-xs">{student.yearLevel}</p>
                  {student.isInternshipReady && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Internship Ready
                    </Badge>
                  )}
                </div>
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
                {student.skills.map((skill, index) => {
                  // Handle different skill object structures
                  let skillName = "Unknown Skill";
                  let skillLevel = null;

                  if (typeof skill === "string") {
                    skillName = skill;
                  } else if (typeof skill === "object" && skill !== null) {
                    skillName =
                      skill.name || skill.skillName || "Unknown Skill";
                    skillLevel = skill.level || skill.skillLevel || null;
                  }

                  return (
                    <Badge key={index} variant="secondary" className="text-xs">
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
                {student.softSkills.map((skill, index) => {
                  // Handle different skill object structures
                  let skillName = "Unknown Skill";

                  if (typeof skill === "string") {
                    skillName = skill;
                  } else if (typeof skill === "object" && skill !== null) {
                    skillName =
                      skill.name || skill.skillName || "Unknown Skill";
                  }

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

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import Modal from "../../../components/ui/modal";
import {
  MapPin,
  Award,
  Star,
  Edit,
  GraduationCap,
  Code,
  Briefcase,
  ExternalLink,
  User,
  Globe,
  FileText,
  Github,
  Linkedin,
  Eye,
} from "lucide-react";
import { studentsAPI } from "../../../lib/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Function to open certificate modal
  const openCertificateModal = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]); // Refetch when user data changes

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // First, refresh user data from localStorage to get latest updates
      const userData = localStorage.getItem("user");
      let currentUser = user;

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          currentUser = parsedUser; // Use fresh data from localStorage
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }

      if (currentUser?.role === "student") {
        // Fetch student profile data
        const response = await studentsAPI.getProfile();
        const studentData = response.data;

        console.log("📊 Fetched student data from backend:", studentData);
        console.log("📋 Student data summary:", {
          hasSkills: studentData.skills?.length > 0,
          hasSoftSkills: studentData.softSkills?.length > 0,
          hasCertifications: studentData.certifications?.length > 0,
          certificationsCount: studentData.certifications?.length || 0,
          hasBadges: studentData.badges?.length > 0,
          badgesCount: studentData.badges?.length || 0,
          hasPreferredFields: !!studentData.preferredFields,
          hasResumeUrl: !!studentData.resumeUrl,
          hasPortfolioUrl: !!studentData.portfolioUrl,
        });

        if (studentData.certifications?.length > 0) {
          console.log("🎖️ Certifications from DB:", studentData.certifications);
          studentData.certifications.forEach((cert, i) => {
            console.log(`  Certificate ${i + 1}:`, {
              name: cert.name,
              hasUrl: !!cert.certificateUrl,
              hasImageUrl: !!cert.imageUrl,
              imageUrl: cert.imageUrl,
            });
          });
        }
        if (studentData.badges?.length > 0) {
          console.log("🏆 Badges from DB:", studentData.badges);
        }

        const dashboardData = {
          name: `${currentUser.firstName || ""} ${
            currentUser.lastName || ""
          }`.trim(),
          title: studentData.program
            ? `${studentData.program} Student`
            : "Student",
          location:
            studentData.preferredFields?.location?.[0] || "Location not set",
          profileData: {
            ...currentUser,
            ...studentData,
            // Include all personal information fields
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            middleName: currentUser.middleName,
            age: currentUser.age,
            sex: currentUser.sex,
            phone: currentUser.phone,
            email: currentUser.email,
            profilePicUrl: currentUser.profilePicUrl,
            // Academic info
            program: studentData.program,
            yearLevel: studentData.yearLevel,
            studentId: studentData.studentId,
            // Convert skills from objects to simple format for display
            technicalSkills:
              studentData.skills?.map((skill) => skill.name) || [],
            softSkills: studentData.softSkills || [],
            // Convert certificates and badges to simple format
            certificates:
              studentData.certifications?.map((cert) => ({
                name: cert.name,
                url: cert.certificateUrl,
                imageUrl: cert.imageUrl || "", // Include image URL
              })) || [],
            badges:
              studentData.badges?.map((badge) => ({
                name: badge.name,
                url: badge.externalUrl,
                imageUrl: badge.iconUrl || "", // Include image URL
              })) || [],
            // Include preferredFields with all fields
            preferredFields: studentData.preferredFields || {},
            // Include additional URLs
            resumeUrl: studentData.resumeUrl,
            portfolioUrl: studentData.portfolioUrl,
            linkedinUrl: studentData.linkedinUrl,
            githubUrl: studentData.githubUrl,
            websiteUrl: studentData.websiteUrl,
            twitterUrl: studentData.twitterUrl,
            facebookUrl: studentData.facebookUrl,
            instagramUrl: studentData.instagramUrl,
            // Include bio and emergency contact if available
            bio: studentData.bio,
            emergencyContact: studentData.emergencyContact,
            address: studentData.address,
            dateOfBirth: studentData.dateOfBirth,
          },
        };

        setProfileData(dashboardData);
      } else {
        // For non-students, use basic user data
        setProfileData({
          name: `${currentUser.firstName || ""} ${
            currentUser.lastName || ""
          }`.trim(),
          title:
            currentUser.role === "company" ? "Company Representative" : "User",
          location: "Location not set",
          profileData: {
            ...currentUser,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            middleName: currentUser.middleName,
            age: currentUser.age,
            sex: currentUser.sex,
            phone: currentUser.phone,
            email: currentUser.email,
            profilePicUrl: currentUser.profilePicUrl,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");

      // Fallback to basic user data
      if (currentUser) {
        setProfileData({
          name: `${currentUser.firstName || ""} ${
            currentUser.lastName || ""
          }`.trim(),
          title:
            currentUser.role === "student"
              ? "Student"
              : currentUser.role === "company"
              ? "Company Representative"
              : "User",
          location: "Location not set",
          profileData: {
            ...currentUser,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            middleName: currentUser.middleName,
            age: currentUser.age,
            sex: currentUser.sex,
            phone: currentUser.phone,
            email: currentUser.email,
            profilePicUrl: currentUser.profilePicUrl,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white rounded-lg shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-32 bg-white rounded-lg shadow-sm"></div>
              <div className="h-48 bg-white rounded-lg shadow-sm col-span-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to Internship Portal
          </h1>
          <p className="text-gray-600">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const studentProfile = profileData.profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center space-x-4 md:space-x-6">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-white/20 shadow-xl">
                  <AvatarImage
                    src={
                      profileData.profileData?.profilePicUrl ||
                      profileData.profileData?.profilePictureUrl
                    }
                    alt={profileData.name}
                  />
                  <AvatarFallback className="text-xl font-bold bg-white text-gray-900">
                    {profileData.profileData?.firstName?.[0]}
                    {profileData.profileData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Welcome back, {profileData.profileData?.firstName}!
                  </h1>
                  <p className="text-base md:text-lg text-gray-300 flex items-center mb-1">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    {profileData.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profileData.profileData?.studentId || "Student ID not set"}
                  </p>
                </div>
              </div>
              <Link to="/profile">
                <Button
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Academic Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Personal Information */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Age
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.profileData?.age || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Sex
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.profileData?.sex || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profileData.profileData?.phone || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profileData.profileData?.email || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </div>
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Program
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {profileData.profileData?.program || "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Year Level
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.profileData?.yearLevel || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Student ID
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.profileData?.studentId || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {profileData.profileData?.linkedinUrl && (
                  <a
                    href={profileData.profileData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        LinkedIn
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                )}
                {profileData.profileData?.githubUrl && (
                  <a
                    href={profileData.profileData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-300 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-gray-900" />
                      <span className="text-sm font-medium text-gray-900">
                        GitHub
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </a>
                )}
                {profileData.profileData?.resumeUrl && (
                  <a
                    href={profileData.profileData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Resume
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </a>
                )}
                {profileData.profileData?.portfolioUrl && (
                  <a
                    href={profileData.profileData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Portfolio
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </a>
                )}
                {!profileData.profileData?.linkedinUrl &&
                  !profileData.profileData?.githubUrl &&
                  !profileData.profileData?.resumeUrl &&
                  !profileData.profileData?.portfolioUrl && (
                    <div className="text-center py-6">
                      <Globe className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">
                        No links added yet
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills, Badges & Certificates */}
          <div className="lg:col-span-2 space-y-4">
            {/* Skills Section */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Code className="h-4 w-4 text-blue-600" />
                  </div>
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                {/* Technical Skills */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-700">
                        Technical Skills
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {profileData.profileData?.technicalSkills?.length || 0}{" "}
                      skills
                    </span>
                  </div>
                  {profileData.profileData?.technicalSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.profileData.technicalSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 text-xs font-medium transition-colors"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <Code className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">
                        No technical skills added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Soft Skills */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      <h4 className="text-sm font-semibold text-gray-700">
                        Soft Skills
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      {profileData.profileData?.softSkills?.length || 0} skills
                    </span>
                  </div>
                  {profileData.profileData?.softSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.profileData.softSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1.5 text-xs font-medium transition-colors"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <User className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">
                        No soft skills added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges Section */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    Badges & Achievements
                  </CardTitle>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {profileData.profileData?.badges?.length || 0} badges
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {profileData.profileData?.badges?.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {profileData.profileData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="group relative flex flex-col items-center"
                        title={badge.name}
                      >
                        {badge.imageUrl ? (
                          <div className="flex items-center justify-center w-14 h-14 rounded-full overflow-hidden shadow-md hover:shadow-xl hover:scale-110 transition-all duration-200 border-2 border-gray-100">
                            <img
                              src={badge.imageUrl}
                              alt={badge.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-full shadow-md hover:shadow-xl hover:scale-110 transition-all duration-200">
                            <Star className="h-7 w-7" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-2 text-center truncate w-full font-medium">
                          {badge.name}
                        </p>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          {badge.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Star className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      No badges earned yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Keep learning to earn your first badge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internship Preferences Section */}
            {profileData.profileData?.preferredFields && (
              <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                    <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                      <Briefcase className="h-4 w-4 text-amber-600" />
                    </div>
                    Internship Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Work Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {profileData.profileData.preferredFields.workType ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {profileData.profileData.preferredFields
                          .location?.[0] || "N/A"}
                      </p>
                    </div>
                  </div>
                  {profileData.profileData.preferredFields.schedule && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Preferred Schedule
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {profileData.profileData.preferredFields.schedule}
                      </p>
                    </div>
                  )}
                  {profileData.profileData.preferredFields.durationHours && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {profileData.profileData.preferredFields.durationHours}{" "}
                        hours
                      </p>
                    </div>
                  )}
                  {profileData.profileData.preferredFields.role?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Preferred Roles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.profileData.preferredFields.role.map(
                          (role, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                              {role}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Certificates Section */}
            <Card className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base font-semibold text-gray-900">
                    <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    Certificates
                  </CardTitle>
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    {profileData.profileData?.certificates?.length || 0} certs
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {profileData.profileData?.certificates?.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.profileData.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-yellow-50 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all group"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Award className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {cert.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openCertificateModal(cert)}
                            className="p-1.5 hover:bg-yellow-200 rounded-full transition-colors"
                            title="View certificate"
                          >
                            <Eye className="h-4 w-4 text-gray-600 group-hover:text-yellow-700" />
                          </button>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-yellow-200 rounded-full transition-colors"
                              title="Open link"
                            >
                              <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-yellow-700" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      No certificates added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload your achievements to showcase your skills!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <Modal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        title={selectedCertificate?.name || "Certificate"}
      >
        {selectedCertificate && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCertificate.name}
              </h3>
            </div>

            {selectedCertificate.imageUrl ? (
              <div className="flex justify-center">
                <img
                  src={selectedCertificate.imageUrl}
                  alt={selectedCertificate.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No image available for this certificate
                </p>
              </div>
            )}

            {selectedCertificate.url && (
              <div className="text-center">
                <a
                  href={selectedCertificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Certificate Online
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;

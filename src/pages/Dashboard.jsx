import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Modal from "../components/ui/modal";
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
import { studentsAPI } from "../lib/api";
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
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // First, refresh user data from localStorage to get latest updates
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }

      if (user?.role === "student") {
        // Fetch student profile data
        const response = await studentsAPI.getProfile();
        const studentData = response.data;

        const dashboardData = {
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          title: studentData.program
            ? `${studentData.program} Student`
            : "Student",
          location:
            studentData.preferredFields?.location?.[0] || "Location not set",
          profileData: {
            ...user,
            ...studentData,
            // Include all personal information fields
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            age: user.age,
            sex: user.sex,
            phone: user.phone,
            email: user.email,
            profilePicUrl: user.profilePicUrl,
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
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          title: user.role === "company" ? "Company Representative" : "User",
          location: "Location not set",
          profileData: {
            ...user,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            age: user.age,
            sex: user.sex,
            phone: user.phone,
            email: user.email,
            profilePicUrl: user.profilePicUrl,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");

      // Fallback to basic user data
      if (user) {
        setProfileData({
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          title:
            user.role === "student"
              ? "Student"
              : user.role === "company"
              ? "Company Representative"
              : "User",
          location: "Location not set",
          profileData: {
            ...user,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            age: user.age,
            sex: user.sex,
            phone: user.phone,
            email: user.email,
            profilePicUrl: user.profilePicUrl,
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Hero Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 ring-4 ring-gray-200 shadow-lg">
                <AvatarImage
                  src={profileData.profileData?.profilePictureUrl}
                  alt={profileData.name}
                />
                <AvatarFallback className="text-xl font-bold bg-gray-900 text-white">
                  {profileData.profileData?.firstName?.[0]}
                  {profileData.profileData?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.name}
                </h1>
                <p className="text-lg text-gray-600 flex items-center mb-1">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {profileData.title}
                </p>
                <p className="text-sm text-gray-500">
                  My Profile Overview • View your profile information
                </p>
              </div>
            </div>
            <Link to="/profile">
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Academic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <User className="h-5 w-5 mr-3 text-gray-700" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Age
                    </p>
                    <p className="text-base text-gray-900">
                      {profileData.profileData?.age || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Sex
                    </p>
                    <p className="text-base text-gray-900">
                      {profileData.profileData?.sex || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </p>
                  <p className="text-base text-gray-900">
                    {profileData.profileData?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-base text-gray-900">
                    {profileData.profileData?.email || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <GraduationCap className="h-5 w-5 mr-3 text-gray-700" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Program
                  </p>
                  <p className="text-base text-gray-900">
                    {profileData.profileData?.program || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Year Level
                  </p>
                  <p className="text-base text-gray-900">
                    {profileData.profileData?.yearLevel || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Student ID
                  </p>
                  <p className="text-base text-gray-900">
                    {profileData.profileData?.studentId || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Globe className="h-5 w-5 mr-3 text-gray-700" />
                  Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.profileData?.linkedinUrl && (
                  <a
                    href={profileData.profileData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:underline p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="font-medium">LinkedIn Profile</span>
                  </a>
                )}
                {profileData.profileData?.githubUrl && (
                  <a
                    href={profileData.profileData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:underline p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span className="font-medium">GitHub Profile</span>
                  </a>
                )}
                {profileData.profileData?.resumeUrl && (
                  <a
                    href={profileData.profileData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:underline p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Resume</span>
                  </a>
                )}
                {profileData.profileData?.portfolioUrl && (
                  <a
                    href={profileData.profileData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:underline p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span className="font-medium">Portfolio</span>
                  </a>
                )}
                {!profileData.profileData?.linkedinUrl &&
                  !profileData.profileData?.githubUrl &&
                  !profileData.profileData?.resumeUrl &&
                  !profileData.profileData?.portfolioUrl && (
                    <p className="text-gray-500 text-center py-4">
                      No online links added yet
                    </p>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills, Badges & Certificates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Code className="h-5 w-5 mr-3 text-gray-700" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Skills */}
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    Technical Skills
                  </h4>
                  {profileData.profileData?.technicalSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.profileData.technicalSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 text-gray-800 px-3 py-1 text-sm"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No technical skills added yet
                    </p>
                  )}
                </div>

                {/* Soft Skills */}
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-3">
                    Soft Skills
                  </h4>
                  {profileData.profileData?.softSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.profileData.softSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 px-3 py-1 text-sm"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No soft skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges Section */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Star className="h-5 w-5 mr-3 text-gray-700" />
                  Badges & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.profileData?.badges?.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {profileData.profileData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="group relative flex flex-col items-center"
                        title={badge.name}
                      >
                        {badge.imageUrl ? (
                          <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            <img
                              src={badge.imageUrl}
                              alt={badge.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-700 rounded-full shadow-md">
                            <Star className="h-6 w-6" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                          {badge.name}
                        </p>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {badge.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No badges earned yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Certificates Section */}
            <Card className="bg-white shadow-lg border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Award className="h-5 w-5 mr-3 text-gray-700" />
                  Certificates & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.profileData?.certificates?.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.profileData.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => openCertificateModal(cert)}
                      >
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {cert.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Click to view certificate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {cert.imageUrl && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">View</span>
                            </div>
                          )}
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-sm">Link</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No certificates added yet
                  </p>
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

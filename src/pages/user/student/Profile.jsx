import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { studentsAPI, usersAPI, authAPI } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import AutocompleteInput from "../../../components/ui/autocomplete-input";
import BadgeDisplay from "../../../components/BadgeDisplay";
import Modal from "../../../components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Upload,
  Camera,
  Star,
  Briefcase,
  GraduationCap,
  FileText,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  Eye,
} from "lucide-react";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Skill suggestions for autocomplete
  const technicalSkillsSuggestions = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "HTML",
    "CSS",
    "Sass",
    "Less",
    "TypeScript",
    "jQuery",
    "Bootstrap",
    "Tailwind CSS",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "SQL Server",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Git",
    "Machine Learning",
    "Data Science",
    "Artificial Intelligence",
    "Deep Learning",
    "Mobile Development",
    "iOS",
    "Android",
    "React Native",
    "Flutter",
    "Xamarin",
    "Web Development",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "DevOps",
    "CI/CD",
    "Linux",
    "Windows Server",
    "Networking",
    "Cybersecurity",
    "Programming",
    "Software Development",
    "API Development",
    "REST API",
    "GraphQL",
    "Database Design",
    "System Design",
    "Agile",
    "Scrum",
    "Project Management",
  ];

  const softSkillsSuggestions = [
    "Communication",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
    "Adaptability",
    "Creativity",
    "Work Ethic",
    "Interpersonal Skills",
    "Public Speaking",
    "Presentation Skills",
    "Negotiation",
    "Conflict Resolution",
    "Emotional Intelligence",
    "Active Listening",
    "Empathy",
    "Patience",
    "Flexibility",
    "Organization",
    "Attention to Detail",
    "Analytical Thinking",
    "Decision Making",
    "Mentoring",
    "Coaching",
    "Collaboration",
    "Networking",
    "Customer Service",
    "Sales Skills",
    "Marketing",
    "Strategic Thinking",
    "Innovation",
    "Initiative",
    "Self-Motivation",
    "Resilience",
    "Stress Management",
    "Multitasking",
    "Planning",
    "Goal Setting",
    "Feedback",
    "Learning Agility",
    "Cultural Awareness",
    "Diversity",
    "Professionalism",
    "Integrity",
    "Accountability",
    "Reliability",
    "Punctuality",
  ];
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.role === "student") {
        // Fetch student profile from backend
        const response = await studentsAPI.getProfile();
        const studentData = response.data;

        // Combine user data with student profile data
        const profileData = {
          ...user,
          ...studentData,
          // Map student-specific fields
          course: studentData.program || "",
          studentId: studentData.studentId || "",
          yearLevel: studentData.yearLevel || "",
          phone: user.phone || "",

          // Map skills - convert arrays to comma-separated strings
          technicalSkills: studentData.skills
            ? studentData.skills.map((skill) => skill.name).join(", ")
            : "",
          softSkills: studentData.softSkills
            ? studentData.softSkills.join(", ")
            : "",

          // Map certificates and badges - convert objects to simple format
          certificates:
            studentData.certifications?.map((cert) => ({
              name: cert.name,
              url: cert.certificateUrl || "",
              imageUrl: cert.imageUrl || "", // Include image URL
            })) || [],
          badges:
            studentData.badges?.map((badge) => ({
              name: badge.name,
              url: badge.externalUrl || "",
              imageUrl: badge.iconUrl || "", // Include image URL
            })) || [],

          // Map Internship preferences
          workFromHome:
            studentData.preferredFields?.workType === "Remote" || false,
          locationPreference: studentData.preferredFields?.location?.[0] || "",
          industryPreference: studentData.preferredFields?.role || [],
          preferredSchedule: studentData.preferredFields?.schedule || "",
          preferredDuration: String(
            studentData.preferredFields?.durationHours || 486
          ),

          // Additional URLs
          resumeUrl: studentData.resumeUrl || "",
          portfolioUrl: studentData.portfolioUrl || "",
          linkedinUrl: studentData.linkedinUrl || "",
          githubUrl: studentData.githubUrl || "",

          // Use actual user data for these fields
          middleName: user.middleName || "",
          age: user.age || "",
          sex: user.sex || "",
        };

        setProfileData(profileData);

        // Debug: Log the profile data being loaded
        // Set form values
        Object.keys(profileData).forEach((key) => {
          if (
            profileData[key] !== null &&
            profileData[key] !== undefined &&
            (typeof profileData[key] !== "object" ||
              Array.isArray(profileData[key]))
          ) {
            setValue(key, profileData[key] || "");
          }
        });
      } else {
        // For non-students, use basic user data
        const profileData = {
          ...user,
          phone: user.phone || "",
          middleName: user.middleName || "",
          age: user.age || "",
          sex: user.sex || "",
        };

        setProfileData(profileData);

        // Set form values
        Object.keys(profileData).forEach((key) => {
          if (
            profileData[key] !== null &&
            profileData[key] !== undefined &&
            (typeof profileData[key] !== "object" ||
              Array.isArray(profileData[key]))
          ) {
            setValue(key, profileData[key] || "");
          }
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");

      // Fallback to basic user data
      const fallbackData = {
        ...user,
        phone: user.phone || "",
        middleName: user.middleName || "",
        age: user.age || "",
        sex: user.sex || "",
        course: "",
        yearLevel: "",
        studentId: "",
        technicalSkills: "",
        softSkills: "",
        certificates: [],
        badges: [],
        workFromHome: false,
        preferredSchedule: "",
        preferredDuration: "486",
        locationPreference: "",
        industryPreference: [],
        resumeUrl: "",
        portfolioUrl: "",
        linkedinUrl: "",
        githubUrl: "",
      };

      setProfileData(fallbackData);

      // Set form values
      Object.keys(fallbackData).forEach((key) => {
        if (
          fallbackData[key] !== null &&
          typeof fallbackData[key] !== "object" &&
          fallbackData[key] !== undefined
        ) {
          setValue(key, fallbackData[key] || "");
        }
      });
    } finally {
      setLoading(false);
    }
  }, [user, setValue]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Modal states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Function to handle image upload for badges and certificates
  const handleImageUpload = async (file, type, index) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      // Upload image to server using the profile picture endpoint
      const uploadResponse = await usersAPI.uploadProfilePicture(formData);
      // The backend returns profilePictureUrl
      const imageUrl = uploadResponse.data.profilePictureUrl;

      if (type === "badge") {
        const newBadges = [...(watch("badges") || [])];
        newBadges[index] = { ...newBadges[index], imageUrl };
        setValue("badges", newBadges);
        toast.success("Badge image uploaded successfully!");
      } else if (type === "certificate") {
        const newCerts = [...(watch("certificates") || [])];
        newCerts[index] = { ...newCerts[index], imageUrl };
        setValue("certificates", newCerts);
        toast.success("Certificate image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        "Failed to upload image: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Function to open certificate modal
  const openCertificateModal = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const getCroppedImage = async (imageSrc, cropPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(cropPixels.width, cropPixels.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        ctx.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          size,
          size,
          0,
          0,
          size,
          size
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.92
        );
      };
      image.onerror = (e) => reject(e);
      image.src = imageSrc;
    });
  };

  const confirmCrop = async () => {
    try {
      if (!selectedImage || !croppedAreaPixels) {
        setShowCropper(false);
        return;
      }
      const imgUrl = URL.createObjectURL(selectedImage);
      const blob = await getCroppedImage(imgUrl, croppedAreaPixels);
      URL.revokeObjectURL(imgUrl);
      const croppedFile = new File(
        [blob],
        selectedImage.name.replace(/\.[^.]+$/, "") + "-cropped.jpg",
        { type: "image/jpeg" }
      );
      setSelectedImage(croppedFile);
      setShowCropper(false);
      toast.success("Crop applied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onSubmit = async (data) => {
    console.log("🎯 ========== PROFILE SAVE STARTED ==========");
    console.log("👤 User from AuthContext:", user);
    console.log("👤 User role from AuthContext:", user?.role);
    console.log("📝 ProfileData state:", profileData);
    console.log("📝 ProfileData role:", profileData?.role);
    console.log("📋 Form data received:", data);

    // Check localStorage
    const userFromStorage = localStorage.getItem("user");
    console.log("🗄️ Raw user from localStorage:", userFromStorage);

    // Get user from multiple sources
    let currentUser = user;
    if (!currentUser && userFromStorage) {
      try {
        currentUser = JSON.parse(userFromStorage);
        console.log("✅ Parsed user from localStorage:", currentUser);
      } catch (e) {
        console.error("❌ Failed to parse user from localStorage:", e);
      }
    }

    // If still no user, try to get from profileData
    if (!currentUser && profileData) {
      currentUser = {
        role: profileData.role,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };
      console.log("✅ Using user from profileData:", currentUser);
    }

    // CRITICAL FIX: Infer role if missing but user data exists
    if (currentUser && !currentUser.role) {
      // If user has studentId and program, they're a student
      if (
        currentUser.studentId ||
        currentUser.program ||
        currentUser.yearLevel
      ) {
        currentUser.role = "student";
        console.log(
          "✅ Inferred role as 'student' from student-specific fields"
        );
      }
      // If user has companyName, they're a company
      else if (currentUser.companyName) {
        currentUser.role = "company";
        console.log(
          "✅ Inferred role as 'company' from company-specific fields"
        );
      }
    }

    console.log("👤 Final current user:", currentUser);
    console.log("👤 Final current user role:", currentUser?.role);

    if (!currentUser || !currentUser.role) {
      console.error("❌ No user data available!");
      console.error("❌ Debug info:", {
        hasUser: !!user,
        hasUserFromStorage: !!userFromStorage,
        hasProfileData: !!profileData,
        profileDataRole: profileData?.role,
      });
      toast.error("User session error. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      // Upload profile picture if selected
      let profilePictureUrl =
        profileData?.profilePicUrl || profileData?.profilePictureUrl;
      if (selectedImage) {
        try {
          const formData = new FormData();
          formData.append("profilePicture", selectedImage, selectedImage.name);

          const uploadResponse = await usersAPI.uploadProfilePicture(formData);
          // Backend returns profilePictureUrl in data
          profilePictureUrl = uploadResponse.data.profilePictureUrl;

          toast.success("Profile picture uploaded successfully!");
        } catch (uploadError) {
          console.error("Profile picture upload error:", uploadError);
          toast.error(
            "Failed to upload profile picture: " +
              (uploadError.response?.data?.message || uploadError.message)
          );
          return; // Don't continue with profile update if upload fails
        }
      }

      if (currentUser?.role === "student") {
        console.log("✅ User is STUDENT - preparing student profile data...");

        // Get certificates and badges from watch() since they're not in react-hook-form data
        const currentCertificates = watch("certificates") || [];
        const currentBadges = watch("badges") || [];

        console.log("🔍 Current certificates from watch:", currentCertificates);
        console.log("🔍 Certificates count:", currentCertificates.length);
        console.log("🔍 Current badges from watch:", currentBadges);
        console.log("🔍 Badges count:", currentBadges.length);

        // Prepare student profile data
        const profileData = {
          // Academic Information
          program: data.course,
          yearLevel: data.yearLevel,
          studentId: data.studentId,

          // Skills - convert comma-separated strings to objects
          skills: data.technicalSkills
            ? (typeof data.technicalSkills === "string"
                ? data.technicalSkills.split(",")
                : Array.isArray(data.technicalSkills)
                ? data.technicalSkills
                : []
              )
                .map((skill) =>
                  typeof skill === "string"
                    ? { name: skill.trim(), level: "Beginner" }
                    : skill
                )
                .filter((skill) => (skill.name || skill).trim().length > 0)
            : [],
          softSkills: data.softSkills
            ? (typeof data.softSkills === "string"
                ? data.softSkills.split(",")
                : Array.isArray(data.softSkills)
                ? data.softSkills
                : []
              )
                .map((skill) =>
                  typeof skill === "string" ? skill.trim() : skill
                )
                .filter((skill) => skill.trim().length > 0)
            : [],

          // Certificates & Badges - convert objects to proper format
          certifications:
            currentCertificates
              ?.map((cert) => ({
                name: cert.name,
                issuer: cert.name, // Use certificate name as issuer for now
                dateIssued: new Date(),
                certificateUrl: cert.url || "https://example.com", // Provide default URL if empty
                verificationUrl: cert.url || "https://example.com",
                imageUrl: cert.imageUrl || "", // Include uploaded image URL
              }))
              .filter((cert) => cert.name.trim().length > 0) || [],

          badges:
            currentBadges
              ?.map((badge) => ({
                name: badge.name,
                description: badge.name, // Use badge name as description
                iconUrl:
                  badge.imageUrl ||
                  "https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=🏆", // Use uploaded image or default
                externalUrl: badge.url || "",
                earnedAt: new Date(),
              }))
              .filter((badge) => badge.name.trim().length > 0) || [],

          // Internship Preferences
          preferredFields: {
            workType: data.workFromHome ? "Remote" : "On-site",
            location: data.locationPreference ? [data.locationPreference] : [],
            role: data.industryPreference || [],
            schedule: data.preferredSchedule || undefined,
            durationHours: data.preferredDuration
              ? parseInt(data.preferredDuration, 10)
              : undefined,
            allowance: {
              min: 0,
              max: 0,
            },
          },

          // Additional URLs
          resumeUrl: data.resumeUrl,
          portfolioUrl: data.portfolioUrl,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
        };

        // Debug: Log the data being sent
        console.log("📝 ========== STUDENT PROFILE DATA TO SAVE ==========");
        console.log("Full profileData object:", profileData);
        console.log("\n📊 Profile data summary:", {
          hasSkills: profileData.skills?.length > 0,
          skillsCount: profileData.skills?.length || 0,
          hasSoftSkills: profileData.softSkills?.length > 0,
          softSkillsCount: profileData.softSkills?.length || 0,
          hasCertifications: profileData.certifications?.length > 0,
          certificationsCount: profileData.certifications?.length || 0,
          hasBadges: profileData.badges?.length > 0,
          badgesCount: profileData.badges?.length || 0,
          hasResumeUrl: !!profileData.resumeUrl,
          hasPortfolioUrl: !!profileData.portfolioUrl,
          hasLinkedinUrl: !!profileData.linkedinUrl,
          hasGithubUrl: !!profileData.githubUrl,
        });

        console.log(
          "\n🎖️ Certificates being saved:",
          profileData.certifications
        );
        console.log("🏆 Badges being saved:", profileData.badges);

        // Update student profile via API
        try {
          console.log("\n🚀 Calling studentsAPI.updateProfile...");
          const response = await studentsAPI.updateProfile(profileData);
          console.log(
            "✅ ========== STUDENT PROFILE SAVED SUCCESSFULLY =========="
          );
          console.log("Response data:", response.data);
        } catch (error) {
          console.error("❌ STUDENT PROFILE UPDATE FAILED!");
          console.error("Error details:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error message:", error.message);
          toast.error(
            "Failed to save student profile: " +
              (error.response?.data?.message || error.message)
          );
          throw error;
        }

        // Also update basic user info
        const userUpdateData = {
          firstName: data.firstName,
          middleName: data.middleName || undefined,
          lastName: data.lastName,
          age: data.age || undefined,
          sex: data.sex || undefined,
          phone: data.phone || undefined,
          // Do not send email here to avoid identity mismatch
          profilePicUrl: profilePictureUrl,
        };

        // Remove undefined values to avoid sending empty strings
        Object.keys(userUpdateData).forEach((key) => {
          if (userUpdateData[key] === undefined || userUpdateData[key] === "") {
            delete userUpdateData[key];
          }
        });

        console.log("👤 Updating user basic info:", userUpdateData);

        // Update user profile via auth API
        const userResponse = await authAPI.updateProfile(userUpdateData);
        console.log("✅ User info updated successfully:", userResponse.data);

        // Update local storage with new user data
        const updatedUser = { ...currentUser, ...userUpdateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update local state immediately
        setProfileData((prev) => ({
          ...prev,
          ...userUpdateData,
          profilePictureUrl: profilePictureUrl, // Support both naming conventions
        }));

        // Update form values immediately
        Object.keys(userUpdateData).forEach((key) => {
          if (userUpdateData[key] !== undefined) {
            setValue(key, userUpdateData[key] || "");
          }
        });

        // Refresh user data in AuthContext
        refreshUser();

        // Trigger custom event to notify Dashboard and other components
        window.dispatchEvent(new CustomEvent("profileUpdated"));

        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setSelectedImage(null); // Clear selected image
      } else {
        // For non-students, just update basic user info
        const userUpdateData = {
          firstName: data.firstName,
          middleName: data.middleName || undefined,
          lastName: data.lastName,
          age: data.age || undefined,
          sex: data.sex || undefined,
          phone: data.phone || undefined,
          // Do not send email here to avoid identity mismatch
          profilePicUrl: profilePictureUrl,
        };

        // Remove undefined values to avoid sending empty strings
        Object.keys(userUpdateData).forEach((key) => {
          if (userUpdateData[key] === undefined || userUpdateData[key] === "") {
            delete userUpdateData[key];
          }
        });

        await authAPI.updateProfile(userUpdateData);

        // Update local storage with new user data
        const updatedUser = { ...currentUser, ...userUpdateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update local state immediately
        setProfileData((prev) => ({
          ...prev,
          ...userUpdateData,
          profilePictureUrl: profilePictureUrl, // Support both naming conventions
        }));

        // Update form values immediately
        Object.keys(userUpdateData).forEach((key) => {
          if (userUpdateData[key] !== undefined) {
            setValue(key, userUpdateData[key] || "");
          }
        });

        // Refresh user data in AuthContext
        refreshUser();

        // Trigger custom event to notify Dashboard and other components
        window.dispatchEvent(new CustomEvent("profileUpdated"));

        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setSelectedImage(null); // Clear selected image
      }
    } catch (error) {
      console.error("❌❌❌ ========== PROFILE SAVE FAILED ==========");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error response:", error.response);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
      console.log("🏁 ========== PROFILE SAVE ENDED ==========");
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedImage(file);
      setShowCropper(true);
      toast.success("Image selected. Adjust crop then Save.");
    }
  };

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <div>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <p className="text-xs text-muted-foreground">
            Loading profile information...
          </p>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 space-y-3">
        <div>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <p className="text-xs text-muted-foreground">
            No user data available. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Edit Profile</h1>
          <p className="text-xs text-muted-foreground">
            Update your personal information and preferences
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          size="sm"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Adjust Profile Photo</h3>
              </div>
              <div className="relative h-[60vh] max-h-[70vh]">
                <Cropper
                  image={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : undefined
                  }
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCropper(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={confirmCrop}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Left Column - Profile Photo & Personal Info */}
          <div className="lg:col-span-1 space-y-2">
            {/* Profile Photo Section */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Camera className="h-3 w-3" />
                  Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center space-y-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : profileData?.profilePicUrl
                      }
                      onError={() => {}}
                    />
                    <AvatarFallback className="text-xs">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <Label
                      htmlFor="profile-photo"
                      className={
                        isEditing
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }
                    >
                      <div
                        className={`flex items-center justify-center gap-1 px-1.5 py-1 border rounded text-xs ${
                          isEditing ? "hover:bg-gray-50" : "bg-gray-100"
                        }`}
                      >
                        <Upload className="h-3 w-3" />
                        {isEditing ? "Upload" : "Edit"}
                      </div>
                    </Label>
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      disabled={!isEditing}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <User className="h-3 w-3" />
                  Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="space-y-0.5">
                  <Label htmlFor="firstName" className="text-xs">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="middleName" className="text-xs">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    {...register("middleName")}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="lastName" className="text-xs">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="age" className="text-xs">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      {...register("age", { min: 16, max: 100 })}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="sex" className="text-xs">
                      Sex
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={watch("sex") || ""}
                      onValueChange={(value) => setValue("sex", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="phone" className="text-xs">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="studentId" className="text-xs">
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    {...register("studentId")}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Academic & Other Info */}
          <div className="lg:col-span-3 space-y-2">
            {/* Academic Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <GraduationCap className="h-3 w-3" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="course" className="text-xs">
                      Course/Program
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={watch("course") || ""}
                      onValueChange={(value) => setValue("course", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelor of Science in Marine Transportation">
                          Bachelor of Science in Marine Transportation
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Marine Engineering">
                          Bachelor of Science in Marine Engineering
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Nursing">
                          Bachelor of Science in Nursing
                        </SelectItem>
                        <SelectItem value="Bachelor of Early Childhood Education">
                          Bachelor of Early Childhood Education
                        </SelectItem>
                        <SelectItem value="Bachelor of Technical-Vocational Teacher Education (Major in Food and Service Management)">
                          Bachelor of Technical-Vocational Teacher Education
                          (Major in Food and Service Management)
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Entrepreneurship">
                          Bachelor of Science in Entrepreneurship
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Management Accounting">
                          Bachelor of Science in Management Accounting
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Information System">
                          Bachelor of Science in Information System
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Tourism Management">
                          Bachelor of Science in Tourism Management
                        </SelectItem>
                        <SelectItem value="Bachelor of Science in Criminology">
                          Bachelor of Science in Criminology
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="yearLevel" className="text-xs">
                      Year Level
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={watch("yearLevel") || ""}
                      onValueChange={(value) => setValue("yearLevel", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internship Preferences */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4" />
                  Internship Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="workFromHome"
                      disabled={!isEditing}
                      checked={watch("workFromHome") || false}
                      onChange={(e) =>
                        setValue("workFromHome", e.target.checked)
                      }
                    />
                    <Label htmlFor="workFromHome" className="text-xs">
                      Open to Work from Home
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="preferredSchedule" className="text-xs">
                        Preferred Schedule
                      </Label>
                      <Select
                        disabled={!isEditing}
                        value={watch("preferredSchedule") || ""}
                        onValueChange={(value) =>
                          setValue("preferredSchedule", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                          <SelectItem value="Morning">
                            Morning (8AM-5PM)
                          </SelectItem>
                          <SelectItem value="Afternoon">
                            Afternoon (1PM-10PM)
                          </SelectItem>
                          <SelectItem value="Night">Night Shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="preferredDuration" className="text-xs">
                        Preferred Duration (Hours)
                      </Label>
                      <Input
                        id="preferredDuration"
                        type="number"
                        placeholder="486"
                        {...register("preferredDuration")}
                        disabled={!isEditing}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Standard internship duration: 486 hours
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="locationPreference" className="text-xs">
                        Location Preference
                      </Label>
                      <Select
                        disabled={!isEditing}
                        value={watch("locationPreference") || ""}
                        onValueChange={(value) =>
                          setValue("locationPreference", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select location preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Within Pampanga">
                            Within Pampanga
                          </SelectItem>
                          <SelectItem value="Outside Pampanga">
                            Outside Pampanga
                          </SelectItem>
                          <SelectItem value="Work From Home">
                            Work From Home
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3" />
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  <div className="space-y-1">
                    <Label htmlFor="technicalSkills" className="text-xs">
                      Skills (comma-separated)
                    </Label>
                    <AutocompleteInput
                      value={watch("technicalSkills") || ""}
                      onChange={(value) => {
                        setValue("technicalSkills", value);
                      }}
                      suggestions={technicalSkillsSuggestions}
                      placeholder="JavaScript, React, Node.js, Python..."
                      disabled={!isEditing}
                      className="h-16 text-xs resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Enter skills separated by commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Soft Skills */}
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-1 text-xs">
                    <User className="h-3 w-3" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  <div className="space-y-1">
                    <Label htmlFor="softSkills" className="text-xs">
                      Soft Skills (comma-separated)
                    </Label>
                    <AutocompleteInput
                      value={watch("softSkills") || ""}
                      onChange={(value) => {
                        setValue("softSkills", value);
                      }}
                      suggestions={softSkillsSuggestions}
                      placeholder="Communication, Leadership, Teamwork..."
                      disabled={!isEditing}
                      className="h-16 text-xs resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Enter soft skills separated by commas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificates & Badges Section - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificates */}
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-1 text-xs">
                    <Award className="h-3 w-3" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Certificates</Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {watch("certificates")?.map((cert, index) => (
                            <div
                              key={index}
                              className="space-y-2 border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                  <Input
                                    placeholder="Certificate Name"
                                    value={cert.name || ""}
                                    onChange={(e) => {
                                      const newCerts = [
                                        ...(watch("certificates") || []),
                                      ];
                                      newCerts[index] = {
                                        ...newCerts[index],
                                        name: e.target.value,
                                      };
                                      setValue("certificates", newCerts);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <Input
                                    type="url"
                                    placeholder="Certificate URL"
                                    value={cert.url || ""}
                                    onChange={(e) => {
                                      const newCerts = [
                                        ...(watch("certificates") || []),
                                      ];
                                      newCerts[index] = {
                                        ...newCerts[index],
                                        url: e.target.value,
                                      };
                                      setValue("certificates", newCerts);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newCerts = [
                                      ...(watch("certificates") || []),
                                    ];
                                    newCerts.splice(index, 1);
                                    setValue("certificates", newCerts);
                                  }}
                                  className="h-8 px-2"
                                >
                                  ×
                                </Button>
                              </div>

                              {/* Image Upload for Certificate */}
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">
                                  Certificate Image
                                </Label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        handleImageUpload(
                                          file,
                                          "certificate",
                                          index
                                        );
                                      }
                                    }}
                                    className="hidden"
                                    id={`cert-image-${index}`}
                                  />
                                  <label
                                    htmlFor={`cert-image-${index}`}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs cursor-pointer transition-colors"
                                  >
                                    <ImageIcon className="h-3 w-3" />
                                    Upload Image
                                  </label>
                                  {cert.imageUrl && (
                                    <div className="flex items-center gap-1">
                                      <img
                                        src={cert.imageUrl}
                                        alt="Certificate preview"
                                        className="h-8 w-12 object-cover rounded border"
                                      />
                                      <span className="text-xs text-green-600">
                                        ✓
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCerts = [
                                ...(watch("certificates") || []),
                                { name: "", url: "", imageUrl: "" },
                              ];
                              setValue("certificates", newCerts);
                            }}
                            className="w-full h-8 text-xs"
                          >
                            + Add Certificate
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {watch("certificates")?.length > 0 ? (
                            watch("certificates").map((cert, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                  <p className="text-xs font-medium text-gray-900 truncate">
                                    {cert.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openCertificateModal(cert)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="View certificate"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-gray-600" />
                                  </button>
                                  {cert.url && (
                                    <a
                                      href={cert.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Open link"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500">
                              No certificates yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  <div className="space-y-1">
                    <Label htmlFor="badges" className="text-xs">
                      Badges
                    </Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {watch("badges")?.map((badge, index) => (
                          <div
                            key={index}
                            className="space-y-2 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex gap-2">
                              <div className="flex-1 space-y-1">
                                <Input
                                  placeholder="Badge Name"
                                  value={badge.name || ""}
                                  onChange={(e) => {
                                    const newBadges = [
                                      ...(watch("badges") || []),
                                    ];
                                    newBadges[index] = {
                                      ...newBadges[index],
                                      name: e.target.value,
                                    };
                                    setValue("badges", newBadges);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Input
                                  type="url"
                                  placeholder="Badge URL"
                                  value={badge.url || ""}
                                  onChange={(e) => {
                                    const newBadges = [
                                      ...(watch("badges") || []),
                                    ];
                                    newBadges[index] = {
                                      ...newBadges[index],
                                      url: e.target.value,
                                    };
                                    setValue("badges", newBadges);
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newBadges = [
                                    ...(watch("badges") || []),
                                  ];
                                  newBadges.splice(index, 1);
                                  setValue("badges", newBadges);
                                }}
                                className="h-8 px-2"
                              >
                                ×
                              </Button>
                            </div>

                            {/* Image Upload for Badge */}
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">
                                Badge Image
                              </Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleImageUpload(file, "badge", index);
                                    }
                                  }}
                                  className="hidden"
                                  id={`badge-image-${index}`}
                                />
                                <label
                                  htmlFor={`badge-image-${index}`}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  Upload Image
                                </label>
                                {badge.imageUrl && (
                                  <div className="flex items-center gap-1">
                                    <img
                                      src={badge.imageUrl}
                                      alt="Badge preview"
                                      className="h-8 w-8 object-cover rounded-full border"
                                    />
                                    <span className="text-xs text-green-600">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newBadges = [
                              ...(watch("badges") || []),
                              { name: "", url: "", imageUrl: "" },
                            ];
                            setValue("badges", newBadges);
                          }}
                          className="w-full h-8 text-xs"
                        >
                          + Add Badge
                        </Button>
                      </div>
                    ) : (
                      <BadgeDisplay
                        badges={watch("badges")}
                        isEditing={isEditing}
                      />
                    )}
                    {isEditing && (
                      <p className="text-xs text-gray-500">
                        Enter badge name and URL
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <ExternalLink className="h-3 w-3" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="resumeUrl" className="text-xs">
                      Resume URL
                    </Label>
                    <Input
                      id="resumeUrl"
                      type="url"
                      placeholder="https://example.com/resume.pdf"
                      {...register("resumeUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="portfolioUrl" className="text-xs">
                      Portfolio URL
                    </Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      placeholder="https://example.com/portfolio"
                      {...register("portfolioUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="linkedinUrl" className="text-xs">
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/yourname"
                      {...register("linkedinUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="githubUrl" className="text-xs">
                      GitHub Profile
                    </Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/yourname"
                      {...register("githubUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        {isEditing && (
          <div className="flex justify-end pb-3">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>

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

export default Profile;

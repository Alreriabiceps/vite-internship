import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Upload,
  Camera,
  Save,
  X,
} from "lucide-react";
import { authAPI } from "../lib/api";
import toast from "react-hot-toast";

const CompanyProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      // Set form values from user data
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("companyName", user.companyName || "");
      setValue("industry", user.industry || "");
      setValue("companySize", user.companySize || "");
      setValue("website", user.website || "");
      setValue("location", user.location || "");
      setValue("description", user.description || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Upload profile picture if selected
      let profilePictureUrl = user?.profilePicUrl;
      if (selectedImage) {
        try {
          const formData = new FormData();
          formData.append("profilePicture", selectedImage);
          const uploadResponse = await authAPI.uploadProfilePicture(formData);
          profilePictureUrl = uploadResponse.data.profilePictureUrl;
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          toast.error("Failed to upload profile picture");
          return;
        }
      }

      // Update company profile
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        location: data.location,
        description: data.description,
        profilePictureUrl: profilePictureUrl,
      };

      await authAPI.updateProfile(updateData);

      // Update local storage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Refresh user data in AuthContext
      refreshUser();

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Company Profile
          </h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 ring-4 ring-gray-200 shadow-lg">
                <AvatarImage
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : user?.profilePicUrl
                  }
                  alt={user?.companyName || user?.firstName}
                />
                <AvatarFallback className="text-xl font-bold bg-gray-900 text-white">
                  {user?.companyName?.[0] || user?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.companyName || `${user?.firstName} ${user?.lastName}`}
                </h1>
                <p className="text-lg text-gray-600 flex items-center mb-1">
                  <Building2 className="h-5 w-5 mr-2" />
                  {isEditing ? "Edit Company Profile" : "Company Profile"}
                </p>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Update your company information"
                    : "Manage your company profile"}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-900">
                <Camera className="h-5 w-5 mr-3 text-gray-700" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : user?.profilePicUrl
                    }
                    alt={user?.companyName || user?.firstName}
                  />
                  <AvatarFallback className="text-lg font-bold bg-gray-900 text-white">
                    {user?.companyName?.[0] || user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label
                      htmlFor="profile-picture"
                      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Representative Information */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-900">
                <User className="h-5 w-5 mr-3 text-gray-700" />
                Representative Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="company@example.com"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="09666751586"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("phone", {
                        pattern: {
                          value: /^(\+639\d{9}|09\d{9})$/,
                          message:
                            "Phone number must be 11 digits starting with 09 or +639",
                        },
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-900">
                <Building2 className="h-5 w-5 mr-3 text-gray-700" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyName"
                    placeholder="Tech Solutions Inc."
                    className="pl-10"
                    disabled={!isEditing}
                    {...register("companyName", {
                      required: "Company name is required",
                    })}
                  />
                </div>
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select
                      onValueChange={(value) => setValue("industry", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select
                      onValueChange={(value) => setValue("companySize", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">
                          201-500 employees
                        </SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://company.com"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("website")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="City, Province"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register("location")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your company..."
                  className="min-h-[100px]"
                  disabled={!isEditing}
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;


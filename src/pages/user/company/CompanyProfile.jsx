import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { companiesAPI, usersAPI, authAPI } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import toast from "react-hot-toast";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Upload,
  Camera,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Clock,
  Gift,
  Layers,
  Target,
} from "lucide-react";

const CompanyProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching company profile...");

      // Fetch company profile from backend
      const response = await companiesAPI.getProfile();
      console.log("📦 Raw API response:", response);

      // Handle response structure: { success: true, data: company }
      const companyData = response.data?.data || response.data;
      console.log("📋 Company data extracted:", companyData);

      const profileData = {
        ...user,
        ...companyData,
        logoUrl: companyData.logoUrl || user.profilePicUrl || "",
      };

      console.log("✅ Final profile data:", profileData);
      setProfileData(profileData);

      // Set form values
      Object.keys(profileData).forEach((key) => {
        if (
          profileData[key] !== null &&
          profileData[key] !== undefined &&
          typeof profileData[key] !== "object"
        ) {
          setValue(key, profileData[key] || "");
        }
      });
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        error.response?.data?.message || "Failed to load profile data"
      );

      // Fallback to basic user data
      const fallbackData = {
        ...user,
        logoUrl: user.profilePicUrl || "",
      };
      setProfileData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log("💾 Starting profile save...", data);

      // Upload logo if selected
      let logoUrl = profileData?.logoUrl || profileData?.profilePicUrl;
      if (selectedImage) {
        try {
          console.log("📤 Uploading logo...");
          const formData = new FormData();
          formData.append("profilePicture", selectedImage, selectedImage.name);

          const uploadResponse = await usersAPI.uploadProfilePicture(formData);
          logoUrl = uploadResponse.data.profilePictureUrl;

          console.log("✅ Logo uploaded:", logoUrl);
          toast.success("Company logo uploaded successfully!");
        } catch (uploadError) {
          console.error("❌ Logo upload error:", uploadError);
          toast.error("Failed to upload logo");
          return;
        }
      }

      // Prepare company profile data (Company model stores everything directly)
      const companyProfileData = {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        location: data.location,
        description: data.description,
        logoUrl: logoUrl,
        // Social media links
        linkedinUrl: data.linkedinUrl || undefined,
        facebookUrl: data.facebookUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        // Representative info (also in company model)
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        phone: data.phone || undefined,
        profilePicUrl: logoUrl,
      };

      // Remove undefined values
      Object.keys(companyProfileData).forEach((key) => {
        if (
          companyProfileData[key] === undefined ||
          companyProfileData[key] === ""
        ) {
          delete companyProfileData[key];
        }
      });

      console.log("📦 Sending company profile update:", companyProfileData);

      // Update company profile (includes all fields)
      const updateResponse = await companiesAPI.updateProfile(
        companyProfileData
      );
      console.log("✅ Company profile update response:", updateResponse);

      // Update local storage with the returned data
      const updatedCompany = updateResponse.data?.data || updateResponse.data;

      // IMPORTANT: Preserve the role field (backend doesn't return it)
      updatedCompany.role = user?.role || "company";
      console.log("💾 Saving to localStorage with role:", updatedCompany.role);

      localStorage.setItem("user", JSON.stringify(updatedCompany));

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        ...updatedCompany,
      }));

      // Refresh user data in AuthContext
      refreshUser();

      // Trigger custom event to notify Dashboard
      window.dispatchEvent(new CustomEvent("profileUpdated"));

      console.log("🎉 Profile save completed successfully!");
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event) => {
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
      toast.success("Logo selected. Click Save Changes to upload.");
    }
  };

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <div>
          <h1 className="text-xl font-bold">Company Profile</h1>
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
          <h1 className="text-xl font-bold">Company Profile</h1>
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
          <h1 className="text-lg font-bold">Company Profile</h1>
          <p className="text-xs text-muted-foreground">
            Update your company information
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Left Column - Logo & Representative Info */}
          <div className="lg:col-span-1 space-y-2">
            {/* Company Logo */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Camera className="h-3 w-3" />
                  Company Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center space-y-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : profileData?.logoUrl || profileData?.profilePicUrl
                      }
                      onError={() => {}}
                    />
                    <AvatarFallback className="text-xs">
                      {profileData?.companyName?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <Label
                      htmlFor="company-logo"
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
                      id="company-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={!isEditing}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Representative Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  Representative
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
                    Email (Cannot be changed)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={true}
                    className="h-7 text-xs bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Company Info */}
          <div className="lg:col-span-3 space-y-2">
            {/* Company Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="space-y-0.5">
                  <Label htmlFor="companyName" className="text-xs">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName", {
                      required: "Company name is required",
                    })}
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="industry" className="text-xs">
                      Industry
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={watch("industry") || ""}
                      onValueChange={(value) => setValue("industry", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
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
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Transportation">
                          Transportation
                        </SelectItem>
                        <SelectItem value="Construction">
                          Construction
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="companySize" className="text-xs">
                      Company Size
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={watch("companySize") || ""}
                      onValueChange={(value) => setValue("companySize", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">
                          201-500 employees
                        </SelectItem>
                        <SelectItem value="501-1000">
                          501-1000 employees
                        </SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="website" className="text-xs">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      {...register("website")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="location" className="text-xs">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      {...register("location")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="description" className="text-xs">
                    Company Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your company..."
                    {...register("description")}
                    disabled={!isEditing}
                    className="text-xs resize-none"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Links */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  Social Media & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="linkedinUrl"
                      className="text-xs flex items-center gap-1"
                    >
                      <Linkedin className="h-3 w-3 text-blue-600" />
                      LinkedIn Company Page
                    </Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      {...register("linkedinUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="facebookUrl"
                      className="text-xs flex items-center gap-1"
                    >
                      <Facebook className="h-3 w-3 text-blue-500" />
                      Facebook Page
                    </Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      placeholder="https://facebook.com/..."
                      {...register("facebookUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="twitterUrl"
                      className="text-xs flex items-center gap-1"
                    >
                      <Twitter className="h-3 w-3 text-sky-500" />
                      Twitter/X
                    </Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      placeholder="https://twitter.com/..."
                      {...register("twitterUrl")}
                      disabled={!isEditing}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="instagramUrl"
                      className="text-xs flex items-center gap-1"
                    >
                      <Instagram className="h-3 w-3 text-pink-600" />
                      Instagram
                    </Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      placeholder="https://instagram.com/..."
                      {...register("instagramUrl")}
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
    </div>
  );
};

export default CompanyProfile;

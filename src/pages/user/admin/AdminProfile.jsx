import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Shield, User, Mail, Phone, Calendar, CheckCircle } from "lucide-react";

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your administrative account settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Account
            </CardTitle>
            <CardDescription>
              Your administrative account information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profilePicUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-gray-900 text-white text-lg font-semibold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <Badge className="bg-gray-900 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Verified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account ID
                </Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {user?._id?.slice(-8) || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </Label>
                <p className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </Label>
                <p className="text-sm">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.isActive ? "default" : "destructive"}>
                    {user?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="text-sm"
                >
                  Edit Profile
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
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
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      First Name
                    </Label>
                    <p className="text-sm">{user?.firstName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </Label>
                    <p className="text-sm">{user?.lastName}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </Label>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </Label>
                  <p className="text-sm">{user?.phone || "Not provided"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Access
            </CardTitle>
            <CardDescription>
              Your administrative privileges and system access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Full System Access</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Granted</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">User Management</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Granted</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Account Verification</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Granted</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;

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
import { Badge } from "../../../components/ui/badge";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminSystemSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email change form
  const emailForm = useForm({
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  // Password change form
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleEmailChange = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newEmail: data.newEmail,
          currentPassword: data.currentPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to change email";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        toast.error(errorMessage);
        return;
      }

      const result = await response.json();
      toast.success("Email changed successfully!");
      emailForm.reset();
      // Update user context if needed
    } catch (error) {
      console.error("Error changing email:", error);
      toast.error("An error occurred while changing email");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to change password";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        toast.error(errorMessage);
        return;
      }

      const result = await response.json();
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "email", label: "Change Email", icon: Mail },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Account Information
            </CardTitle>
            <CardDescription>
              Your current account details and security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Current Email
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{user?.email}</p>
                  <Badge className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Security
                </Label>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm">Password Protected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Update your email address and password for enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Email Change Tab */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Email Change Notice</p>
                      <p>
                        Changing your email will require you to log in with the
                        new email address. Make sure you have access to the new
                        email account.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={emailForm.handleSubmit(handleEmailChange)}>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newEmail"
                          type="email"
                          className="pl-10"
                          placeholder="Enter new email address"
                          {...emailForm.register("newEmail", {
                            required: "New email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                      </div>
                      {emailForm.formState.errors.newEmail && (
                        <p className="text-sm text-red-500">
                          {emailForm.formState.errors.newEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPasswordEmail">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPasswordEmail"
                          type={showCurrentPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                          {...emailForm.register("currentPassword", {
                            required: "Current password is required",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {emailForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {emailForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing Email..." : "Change Email"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Password Change Tab */}
            {activeTab === "password" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Password Security</p>
                      <p>
                        Choose a strong password with at least 8 characters,
                        including uppercase, lowercase, numbers, and special
                        characters.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                >
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                          {...passwordForm.register("currentPassword", {
                            required: "Current password is required",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter new password"
                          {...passwordForm.register("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Confirm new password"
                          {...passwordForm.register("confirmPassword", {
                            required: "Please confirm your new password",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing Password..." : "Change Password"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSystemSettings;

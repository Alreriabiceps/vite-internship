import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { companiesAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Award,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const PostInternship = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    workType: "On-site",
    schedule: "Full-time",
    duration: "",
    positions: "",
    allowanceMin: "",
    allowanceMax: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    preferredSkills: "",
    benefits: "",
    applicationDeadline: "",
    startDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.department || !formData.description) {
      toast.error("Please fill in title, department, and description");
      return;
    }

    if (!formData.duration || parseInt(formData.duration) < 1) {
      toast.error("Duration is required (in months)");
      return;
    }

    if (!formData.startDate || !formData.applicationDeadline) {
      toast.error("Start date and application deadline are required");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Posting internship:", formData);

      // Calculate end date (start date + duration in months)
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.duration));

      // Prepare slot data according to backend schema
      const slotData = {
        title: formData.title,
        description: formData.description || "No description provided",
        department: formData.department,
        duration: parseInt(formData.duration), // months
        workType: formData.workType,
        startDate: formData.startDate,
        endDate: endDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        location: formData.location || undefined,
        positions: parseInt(formData.positions) || 1,
        allowance: parseInt(formData.allowanceMin) || 0,
        responsibilities:
          formData.responsibilities?.split("\n").filter((r) => r.trim()) || [],
        qualifications:
          formData.qualifications?.split("\n").filter((q) => q.trim()) || [],
        benefits: formData.benefits?.split("\n").filter((b) => b.trim()) || [],
        skillRequirements: {
          mustHave:
            formData.preferredSkills
              ?.split(",")
              .map((s) => s.trim())
              .filter((s) => s) || [],
          preferred: [],
          niceToHave: [],
        },
        applicationDeadline: formData.applicationDeadline,
        status: "open",
      };

      console.log("📦 Sending slot data:", slotData);

      const response = await companiesAPI.addSlot(slotData);
      console.log("✅ Internship posted:", response);

      toast.success("Internship position posted successfully! 🎉");
      navigate("/company/internships");
    } catch (error) {
      console.error("❌ Error posting internship:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to post internship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/company/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Post Internship Position
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new internship opportunity for students
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">
                    Position Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Frontend Developer Intern"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="e.g., Engineering, Marketing"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Manila, Philippines"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input
                    id="positions"
                    name="positions"
                    type="number"
                    min="1"
                    placeholder="e.g., 3"
                    value={formData.positions}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workType">Work Type</Label>
                  <Select
                    value={formData.workType}
                    onValueChange={(value) =>
                      handleSelectChange("workType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select
                    value={formData.schedule}
                    onValueChange={(value) =>
                      handleSelectChange("schedule", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Duration & Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">
                    Duration (months) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="e.g., 3"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Internship duration in months
                  </p>
                </div>
                <div>
                  <Label htmlFor="startDate">
                    Expected Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="applicationDeadline">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="applicationDeadline"
                    name="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">
                  Position Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide a brief overview of the internship position..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsibilities">
                  Responsibilities & Duties
                </Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  placeholder="List the main responsibilities and daily tasks..."
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate each responsibility with a new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Requirements & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qualifications">Required Qualifications</Label>
                <Textarea
                  id="qualifications"
                  name="qualifications"
                  placeholder="List the required qualifications, education, or experience..."
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="preferredSkills">
                  Preferred Skills & Technologies
                </Label>
                <Textarea
                  id="preferredSkills"
                  name="preferredSkills"
                  placeholder="e.g., JavaScript, React, Node.js, Git, etc."
                  value={formData.preferredSkills}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                Benefits & Perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="benefits">What We Offer</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  placeholder="Enter each benefit on a new line. Example:
Mentorship from senior professionals
Hands-on experience with real projects
Certificate of completion
Flexible working hours
Learning and development opportunities
Networking events and workshops
Free lunch and snacks
Transportation allowance"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tip: List one benefit per line for better formatting
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/company/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
            >
              {loading ? (
                "Posting..."
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post Internship
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternship;

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { adminAPI } from "../../../lib/api";
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
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  HelpCircle,
  Info,
  Layers,
  ListChecks,
  Loader2,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultTemplateForm = () => ({
  name: "",
  course: "",
  description: "",
  sections: [
    {
      id: generateId(),
      label: "A",
      title: "",
      description: "",
      questions: [
        {
          id: generateId(),
          prompt: "",
          description: "",
        },
      ],
    },
  ],
});

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  submitted: "bg-emerald-100 text-emerald-800",
};

const AdminEvaluations = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm());
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    templateId: "",
    companyId: "",
    trainingFrom: "",
    trainingTo: "",
    internshipAssignment: "",
    dueDate: "",
    adminNotes: "",
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const [evaluations, setEvaluations] = useState([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evaluationsByCompany, setEvaluationsByCompany] = useState([]);
  const [loadingEvaluationsByCompany, setLoadingEvaluationsByCompany] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [selectedEvaluationDetail, setSelectedEvaluationDetail] = useState(null);
  const [loadingEvaluationDetail, setLoadingEvaluationDetail] = useState(false);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await adminAPI.getEvaluationTemplates();
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error("Failed to load templates", error);
      toast.error(
        error.response?.data?.message || "Unable to load evaluation templates"
      );
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await adminAPI.getPreferredApplicants({
        page: 1,
        limit: 50,
      });
      setCompanies(response.data.data?.companies || []);
    } catch (error) {
      console.error("Failed to load companies", error);
      toast.error("Unable to fetch companies with whitelisted students");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadEvaluations = async () => {
    setLoadingEvaluations(true);
    try {
      const response = await adminAPI.getStudentEvaluations({
        limit: 25,
      });
      setEvaluations(response.data.data || []);
    } catch (error) {
      console.error("Failed to load evaluations", error);
      toast.error("Unable to load assigned evaluations");
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const loadEvaluationsByCompany = useCallback(async () => {
    setLoadingEvaluationsByCompany(true);
    try {
      const response = await adminAPI.getStudentEvaluations({
        limit: 1000, // Get all evaluations
      });
      const allEvaluations = response.data.data || [];
      
      // Group evaluations by company
      const grouped = {};
      allEvaluations.forEach((evaluation) => {
        const companyId = evaluation.company?._id || evaluation.companyInfo?.name || "Unknown";
        const companyName = evaluation.company?.companyName || evaluation.companyInfo?.name || "Unknown Company";
        
        if (!grouped[companyId]) {
          grouped[companyId] = {
            companyId,
            companyName,
            companyEmail: evaluation.company?.email || evaluation.companyInfo?.email || "",
            evaluations: [],
          };
        }
        grouped[companyId].evaluations.push(evaluation);
      });
      
      // Convert to array and sort by company name
      const groupedArray = Object.values(grouped).sort((a, b) => 
        a.companyName.localeCompare(b.companyName)
      );
      
      setEvaluationsByCompany(groupedArray);
    } catch (error) {
      console.error("Failed to load evaluations by company", error);
      toast.error("Unable to load evaluations by company");
    } finally {
      setLoadingEvaluationsByCompany(false);
    }
  }, []);

  const handleDeleteEvaluation = useCallback(async (evaluationId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete the evaluation for ${studentName || "this student"}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteStudentEvaluation(evaluationId);
      toast.success("Evaluation deleted successfully");
      loadEvaluations();
      if (activeTab === "view-evaluations") {
        loadEvaluationsByCompany();
      }
      if (selectedEvaluationDetail?._id === evaluationId) {
        setSelectedEvaluationDetail(null);
      }
    } catch (error) {
      console.error("Failed to delete evaluation", error);
      toast.error(error.response?.data?.message || "Failed to delete evaluation");
    }
  }, [activeTab, loadEvaluationsByCompany, selectedEvaluationDetail]);

  const handleViewEvaluationDetail = async (evaluationId) => {
    setLoadingEvaluationDetail(true);
    try {
      const response = await adminAPI.getStudentEvaluation(evaluationId);
      setSelectedEvaluationDetail(response.data.data);
    } catch (error) {
      console.error("Failed to load evaluation details", error);
      toast.error("Failed to load evaluation details");
    } finally {
      setLoadingEvaluationDetail(false);
    }
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = useMemo(() => {
    if (!selectedEvaluationDetail || !selectedEvaluationDetail.sections) {
      return null;
    }

    const sections = selectedEvaluationDetail.sections || [];
    let totalQuestions = 0;
    let answeredQuestions = 0;
    let totalRating = 0;
    const sectionMetrics = [];

    sections.forEach((section) => {
      const questions = section.questions || [];
      let sectionTotal = 0;
      let sectionAnswered = 0;
      let sectionRating = 0;

      questions.forEach((question) => {
        totalQuestions++;
        sectionTotal++;
        if (question.rating !== null && question.rating !== undefined) {
          answeredQuestions++;
          sectionAnswered++;
          totalRating += question.rating;
          sectionRating += question.rating;
        }
      });

      const sectionAverage = sectionAnswered > 0 ? sectionRating / sectionAnswered : 0;
      sectionMetrics.push({
        label: section.label,
        title: section.title,
        total: sectionTotal,
        answered: sectionAnswered,
        average: sectionAverage,
      });
    });

    const overallAverage = answeredQuestions > 0 ? totalRating / answeredQuestions : 0;
    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // Get rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    sections.forEach((section) => {
      section.questions?.forEach((question) => {
        if (question.rating >= 1 && question.rating <= 5) {
          ratingDistribution[question.rating]++;
        }
      });
    });

    return {
      totalQuestions,
      answeredQuestions,
      overallAverage,
      completionRate,
      sectionMetrics,
      ratingDistribution,
    };
  }, [selectedEvaluationDetail]);

  useEffect(() => {
    loadTemplates();
    loadCompanies();
    loadEvaluations();
  }, []);

  useEffect(() => {
    if (activeTab === "view-evaluations") {
      loadEvaluationsByCompany();
    }
  }, [activeTab, loadEvaluationsByCompany]);

  useEffect(() => {
    if (!assignmentForm.companyId) {
      setSelectedStudentIds([]);
      return;
    }
    const company = companies.find(
      (companyItem) => companyItem._id === assignmentForm.companyId
    );
    if (company) {
      const ids =
        company.preferredApplicants
          ?.filter((pref) => pref.student?._id)
          .map((pref) => pref.student._id) || [];
      setSelectedStudentIds(ids);
    }
  }, [assignmentForm.companyId, companies]);

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies;
    return companies.filter((company) =>
      company.companyName.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const selectedCompany = companies.find(
    (company) => company._id === assignmentForm.companyId
  );

  const handleTemplateFormChange = useCallback((field, value) => {
    setTemplateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Create stable handlers for each field
  const handleNameChange = useCallback((e) => {
    handleTemplateFormChange("name", e.target.value);
  }, [handleTemplateFormChange]);

  const handleCourseChange = useCallback((value) => {
    handleTemplateFormChange("course", value);
  }, [handleTemplateFormChange]);

  const handleDescriptionChange = useCallback((e) => {
    handleTemplateFormChange("description", e.target.value);
  }, [handleTemplateFormChange]);

  const updateSection = useCallback((sectionId, field, value) => {
    setTemplateForm((prev) => {
      const sections = prev.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      );
      return { ...prev, sections };
    });
  }, []);

  const updateQuestion = useCallback((sectionId, questionId, field, value) => {
    setTemplateForm((prev) => {
      const sections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const questions = section.questions.map((question) =>
          question.id === questionId ? { ...question, [field]: value } : question
        );
        return { ...section, questions };
      });
      return { ...prev, sections };
    });
  }, []);


  const addSection = () => {
    const nextLabel = String.fromCharCode(65 + templateForm.sections.length);
    setTemplateForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: generateId(),
          label: nextLabel,
          title: "",
          description: "",
          questions: [{ id: generateId(), prompt: "", description: "" }],
        },
      ],
    }));
  };

  const removeSection = (sectionId) => {
    if (templateForm.sections.length === 1) {
      toast.error("At least one section is required");
      return;
    }
    setTemplateForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const addQuestion = (sectionId) => {
    setTemplateForm((prev) => {
      const sections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          questions: [...section.questions, { id: generateId(), prompt: "", description: "" }],
        };
      });
      return { ...prev, sections };
    });
  };

  const removeQuestion = (sectionId, questionId) => {
    setTemplateForm((prev) => {
      const sections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.questions.length === 1) {
          toast.error("Each section needs at least one question");
          return section;
        }
        return {
          ...section,
          questions: section.questions.filter((question) => question.id !== questionId),
        };
      });
      return { ...prev, sections };
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm(defaultTemplateForm());
    setEditingTemplateId(null);
  };

  const handleTemplateSubmit = async (event) => {
    event.preventDefault();
    if (!templateForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (templateForm.sections.some((section) => !section.title.trim())) {
      toast.error("Every section needs a title");
      return;
    }

    const payload = {
      name: templateForm.name,
      course: templateForm.course,
      description: templateForm.description,
      sections: templateForm.sections.map((section) => ({
        label: section.label.trim() || "A",
        title: section.title.trim(),
        description: section.description,
        questions: section.questions.map((question) => ({
          prompt: question.prompt.trim(),
          description: question.description,
        })),
      })),
    };

    if (
      payload.sections.some((section) =>
        section.questions.some((question) => !question.prompt)
      )
    ) {
      toast.error("All questions must have prompts");
      return;
    }

    setSavingTemplate(true);
    try {
      if (editingTemplateId) {
        await adminAPI.updateEvaluationTemplate(editingTemplateId, payload);
        toast.success("Template updated");
      } else {
        await adminAPI.createEvaluationTemplate(payload);
        toast.success("Template created");
      }
      await loadTemplates();
      resetTemplateForm();
    } catch (error) {
      console.error("Failed to save template", error);
      toast.error(
        error.response?.data?.message || "Unable to save evaluation template"
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleTemplateEdit = (template) => {
    setEditingTemplateId(template._id);
    setTemplateForm({
      name: template.name,
      course: template.course || "",
      description: template.description || "",
      sections: template.sections.map((section) => ({
        id: generateId(), // Always generate new ID for frontend
        label: section.label,
        title: section.title,
        description: section.description || "",
        questions:
          section.questions?.map((question) => ({
            id: generateId(), // Always generate new ID for frontend
            prompt: question.prompt,
            description: question.description || "",
          })) || [],
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTemplateDelete = async (templateId) => {
    if (
      !window.confirm(
        "This will permanently delete the template. Continue?"
      )
    ) {
      return;
    }
    try {
      await adminAPI.deleteEvaluationTemplate(templateId);
      toast.success("Template deleted");
      if (editingTemplateId === templateId) {
        resetTemplateForm();
      }
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
      toast.error("Unable to delete template");
    }
  };

  const handleAssignmentChange = useCallback((field, value) => {
    setAssignmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleStudentToggle = (studentId, checked) => {
    setSelectedStudentIds((prev) => {
      if (checked) {
        return [...new Set([...prev, studentId])];
      }
      return prev.filter((id) => id !== studentId);
    });
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    if (!assignmentForm.templateId) {
      toast.error("Select a template");
      return;
    }
    if (!assignmentForm.companyId) {
      toast.error("Select a company");
      return;
    }
    if (!assignmentForm.trainingFrom || !assignmentForm.trainingTo) {
      toast.error("Training period is required");
      return;
    }
    if (!selectedStudentIds.length) {
      toast.error("Select at least one student to evaluate");
      return;
    }

    setAssigning(true);
    try {
      const payload = {
        templateId: assignmentForm.templateId,
        companyId: assignmentForm.companyId,
        studentIds: selectedStudentIds,
        trainingPeriod: {
          from: assignmentForm.trainingFrom,
          to: assignmentForm.trainingTo,
        },
        internshipAssignment: assignmentForm.internshipAssignment,
        dueDate: assignmentForm.dueDate || undefined,
        adminNotes: assignmentForm.adminNotes,
      };

      const response = await adminAPI.assignStudentEvaluations(payload);
      const createdCount = response.data.data?.created ?? 0;
      toast.success(
        `Evaluation sent to ${createdCount} student${
          createdCount === 1 ? "" : "s"
        }`
      );
      loadEvaluations();
    } catch (error) {
      console.error("Failed to assign evaluations", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to trigger evaluation for this company"
      );
    } finally {
      setAssigning(false);
    }
  };

  const TemplateTab = useMemo(() => (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card className="border border-gray-200">
        <CardHeader className="bg-gray-100 border-b p-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="h-4 w-4 text-gray-700" />
            {editingTemplateId ? (
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                Edit Template
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                New Template
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={handleTemplateSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                Template Name
                <span className="text-red-500">*</span>
                <div className="group relative">
                  <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-40 p-1.5 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    Enter a descriptive name for this evaluation template
                  </div>
                </div>
              </Label>
              <Input
                placeholder="e.g., BSIS Practicum Evaluation"
                value={templateForm.name}
                onChange={handleNameChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                Course / Program
                <span className="text-red-500">*</span>
                <div className="group relative">
                  <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-40 p-1.5 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    Select the course or program this evaluation is for
                  </div>
                </div>
              </Label>
              <Select
                value={templateForm.course}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select course/program" />
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
                    Bachelor of Technical-Vocational Teacher Education (Major in Food and Service Management)
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
            <div className="space-y-1">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                rows={2}
                placeholder="Describe when to use this evaluation"
                value={templateForm.description}
                onChange={handleDescriptionChange}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-xs text-gray-900 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-gray-600" />
                    Sections & Headings
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Define labels (A, B, C) and add rating questions
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addSection}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Section
                </Button>
              </div>

              {templateForm.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="rounded border border-gray-200 p-2 space-y-2 bg-white"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Section Label (A, B, C...)</Label>
                        <Input
                          value={section.label}
                          onChange={(e) => updateSection(section.id, "label", e.target.value.toUpperCase())}
                          maxLength={2}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, "title", e.target.value)}
                          placeholder="e.g., Knowledge / Abilities"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeSection(section.id)}
                      title="Remove section"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Section Description (optional)</Label>
                    <Textarea
                      rows={1}
                      value={section.description}
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      placeholder="Describe what this section evaluates"
                      className="text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <p className="font-medium text-xs text-gray-900 flex items-center gap-1">
                        <ListChecks className="h-3 w-3 text-gray-600" />
                        Questions
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(section.id)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Question
                      </Button>
                    </div>

                    {section.questions.map((question, questionIndex) => (
                      <div
                        key={question.id}
                        className="rounded border border-dashed border-gray-300 p-2 space-y-1.5 bg-gray-50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Question Prompt</Label>
                            <Input
                              value={question.prompt}
                              onChange={(e) => updateQuestion(section.id, question.id, "prompt", e.target.value)}
                              placeholder="e.g., Demonstrates mastery of assigned tasks"
                              className="h-7 text-xs"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              removeQuestion(section.id, question.id)
                            }
                            title="Remove question"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Helper Text (optional)</Label>
                          <Input
                            value={question.description}
                            onChange={(e) => updateQuestion(section.id, question.id, "description", e.target.value)}
                            placeholder="Clarify what a high score means"
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button 
                type="submit" 
                disabled={savingTemplate}
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {savingTemplate ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : editingTemplateId ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Update Template
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Create Template
                  </>
                )}
              </Button>
              {editingTemplateId && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={resetTemplateForm}
                  className="h-8 text-xs"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit border border-gray-200">
        <CardHeader className="bg-gray-100 border-b p-2">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <Layers className="h-4 w-4 text-gray-700" />
              Existing Templates
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadTemplates}
              className="h-7 w-7 p-0"
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {loadingTemplates ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-600 mb-1" />
              <p className="text-xs text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-6 text-center">
              <div className="p-2 bg-gray-100 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 font-medium">No templates yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Create your first evaluation on the left
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template._id}
                className="rounded border border-gray-200 p-2 space-y-1.5 bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {template.course || "All courses"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTemplateEdit(template)}
                      className="h-6 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-0.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleTemplateDelete(template._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {template.sections.map((section) => (
                    <Badge 
                      key={`${template._id}-${section.label}`} 
                      variant="outline"
                      className="px-1.5 py-0.5 text-xs"
                    >
                      <span className="font-bold text-gray-700 mr-0.5">{section.label}</span>
                      {section.title}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated {new Date(template.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  ), [templateForm, editingTemplateId, savingTemplate, templates, loadingTemplates, handleNameChange, handleCourseChange, handleDescriptionChange, addSection, updateSection, removeSection, addQuestion, updateQuestion, removeQuestion, handleTemplateSubmit, resetTemplateForm, loadTemplates, handleTemplateEdit, handleTemplateDelete]);

  const AssignmentsTab = useMemo(() => (
    <div className="space-y-3">
      <Card className="border border-gray-200">
        <CardHeader className="bg-gray-100 border-b p-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="h-4 w-4" />
            Trigger Evaluations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={handleAssignmentSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Evaluation Template</Label>
              <Select
                value={assignmentForm.templateId}
                onValueChange={(value) =>
                  handleAssignmentChange("templateId", value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Company</Label>
              <Input
                placeholder="Search company..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="h-8 text-xs mb-1.5"
              />
              <Select
                value={assignmentForm.companyId}
                onValueChange={(value) =>
                  handleAssignmentChange("companyId", value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompanies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.companyName} • {company.totalPreferredApplicants}{" "}
                      student
                      {company.totalPreferredApplicants === 1 ? "" : "s"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Training Period</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={assignmentForm.trainingFrom}
                  onChange={(e) => handleAssignmentChange("trainingFrom", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={assignmentForm.trainingTo}
                  onChange={(e) => handleAssignmentChange("trainingTo", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="To"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Due Date (optional)</Label>
              <Input
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => handleAssignmentChange("dueDate", e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Internship Assignment / Role</Label>
              <Input
                placeholder="e.g., Admin Trainee"
                value={assignmentForm.internshipAssignment}
                onChange={(e) => handleAssignmentChange("internshipAssignment", e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes to Company (optional)</Label>
              <Textarea
                rows={2}
                value={assignmentForm.adminNotes}
                onChange={(e) => handleAssignmentChange("adminNotes", e.target.value)}
                className="text-xs resize-none"
              />
            </div>

            <div className="rounded border border-gray-200 p-2 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Whitelisted Students</span>
                </div>
                {selectedCompany && (
                  <Badge variant="outline" className="text-xs">
                    {selectedStudentIds.length} selected
                  </Badge>
                )}
              </div>

              {loadingCompanies ? (
                <div className="py-3 text-center text-xs text-gray-500">Loading students...</div>
              ) : !selectedCompany ? (
                <div className="py-3 text-center text-xs text-gray-400">
                  Choose a company to view their whitelisted students.
                </div>
              ) : selectedCompany.preferredApplicants.length === 0 ? (
                <div className="py-3 text-center text-xs text-gray-400">
                  This company has no whitelisted students yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCompany.preferredApplicants.map((pref) => {
                    if (!pref.student) return null;
                    const student = pref.student;
                    return (
                      <label
                        key={student._id}
                        className="flex items-center justify-between rounded border border-gray-200 p-1.5 bg-white"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-xs text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {student.studentId} • {student.program}
                          </p>
                        </div>
                        <Checkbox
                          checked={selectedStudentIds.includes(student._id)}
                          onCheckedChange={(checked) =>
                            handleStudentToggle(student._id, checked)
                          }
                          className="ml-2"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={assigning}
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Send Evaluation
                  </>
                )}
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <AlertCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <p>Students will receive notifications via the company dashboard.</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="bg-gray-100 border-b p-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              Recent Evaluation Requests
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadEvaluations} className="h-7 w-7 p-0">
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {loadingEvaluations ? (
            <div className="py-4 text-center text-xs text-gray-500">Loading...</div>
          ) : evaluations.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-500">
              No evaluations triggered yet.
            </div>
          ) : (
            <div className="space-y-2">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation._id}
                  className="rounded border border-gray-200 p-2 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between bg-white"
                >
                  <div className="flex-1">
                    <p className="font-medium text-xs text-gray-900">
                      {evaluation.studentInfo?.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.companyInfo?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {evaluation.templateSnapshot?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                  <div className="flex flex-col md:items-end gap-0.5">
                    <Badge
                      className={`text-xs ${statusStyles[evaluation.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {evaluation.status.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-gray-500 flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" />
                      Training:
                      {evaluation.trainingPeriod?.from
                        ? ` ${new Date(
                            evaluation.trainingPeriod.from
                          ).toLocaleDateString()}`
                        : " TBA"}{" "}
                      -{" "}
                      {evaluation.trainingPeriod?.to
                        ? new Date(evaluation.trainingPeriod.to).toLocaleDateString()
                        : "TBA"}
                    </p>
                    {evaluation.status === "submitted" && evaluation.submittedAt && (
                      <p className="text-xs text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Submitted{" "}
                        {new Date(evaluation.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvaluation(evaluation._id, evaluation.studentInfo?.fullName)}
                      className="h-7 w-7 p-0"
                      title="Delete evaluation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  ), [assignmentForm, templates, companySearch, filteredCompanies, selectedCompany, selectedStudentIds, loadingCompanies, assigning, evaluations, loadingEvaluations, handleAssignmentChange, handleAssignmentSubmit, handleStudentToggle, loadEvaluations, handleDeleteEvaluation]);

  const ViewEvaluationsTab = useMemo(() => (
    <div className="space-y-2">
      <Card className="border border-gray-200">
        <CardHeader className="bg-gray-100 border-b p-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              Evaluations by Company
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEvaluationsByCompany}
              disabled={loadingEvaluationsByCompany}
              className="h-7 text-xs"
            >
              <RefreshCcw className={`h-3 w-3 mr-1 ${loadingEvaluationsByCompany ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {loadingEvaluationsByCompany ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-600 mb-1" />
              <p className="text-xs text-gray-500">Loading evaluations...</p>
            </div>
          ) : evaluationsByCompany.length === 0 ? (
            <div className="py-6 text-center">
              <div className="p-2 bg-gray-100 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 font-medium">No evaluations found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Evaluations will appear here once assigned to companies
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {evaluationsByCompany.map((companyGroup) => {
                const pendingCount = companyGroup.evaluations.filter(e => e.status === "pending").length;
                const inProgressCount = companyGroup.evaluations.filter(e => e.status === "in_progress").length;
                const submittedCount = companyGroup.evaluations.filter(e => e.status === "submitted").length;
                const isExpanded = expandedCompanies.has(companyGroup.companyId);
                
                const toggleCompany = () => {
                  setExpandedCompanies((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(companyGroup.companyId)) {
                      newSet.delete(companyGroup.companyId);
                    } else {
                      newSet.add(companyGroup.companyId);
                    }
                    return newSet;
                  });
                };
                
                return (
                  <Card key={companyGroup.companyId} className="border border-gray-200">
                    <button
                      onClick={toggleCompany}
                      className="w-full text-left"
                    >
                      <CardHeader className="bg-gray-50 border-b p-2 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-gray-600 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-gray-600 flex-shrink-0" />
                            )}
                            <Building2 className="h-3 w-3 text-gray-700 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-xs font-semibold text-gray-900 truncate">
                                {companyGroup.companyName}
                              </CardTitle>
                              {companyGroup.companyEmail && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{companyGroup.companyEmail}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {companyGroup.evaluations.length} Total
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 ml-5">
                          {pendingCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                              <span className="text-xs text-gray-600">{pendingCount} Pending</span>
                            </div>
                          )}
                          {inProgressCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="text-xs text-gray-600">{inProgressCount} In Progress</span>
                            </div>
                          )}
                          {submittedCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span className="text-xs text-gray-600">{submittedCount} Submitted</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </button>
                    {isExpanded && (
                      <CardContent className="p-2">
                        <div className="space-y-1.5">
                          {companyGroup.evaluations.map((evaluation) => {
                            const isSelected = selectedEvaluationDetail?._id === evaluation._id;
                            return (
                              <div
                                key={evaluation._id}
                                className={`border rounded p-1.5 bg-white transition-all cursor-pointer ${
                                  isSelected 
                                    ? "border-blue-500 bg-blue-50" 
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                                onClick={() => handleViewEvaluationDetail(evaluation._id)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <p className="font-medium text-xs text-gray-900">
                                        {evaluation.studentInfo?.fullName || (evaluation.student?.firstName && evaluation.student?.lastName ? `${evaluation.student.firstName} ${evaluation.student.lastName}` : "Unknown Student")}
                                      </p>
                                      <Badge
                                        className={`text-xs ${statusStyles[evaluation.status] || "bg-gray-100 text-gray-800"}`}
                                      >
                                        {evaluation.status.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-0.5">
                                      {evaluation.studentInfo?.program || evaluation.student?.program || "N/A"} • {evaluation.studentInfo?.studentNumber || evaluation.student?.studentId || "N/A"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {evaluation.templateSnapshot?.name || "Evaluation Template"}
                                    </p>
                                    {evaluation.internshipAssignment && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        Assignment: {evaluation.internshipAssignment}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex flex-col items-end gap-0.5 text-xs text-gray-500">
                                      {evaluation.trainingPeriod?.from && (
                                        <div className="flex items-center gap-0.5">
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            {new Date(evaluation.trainingPeriod.from).toLocaleDateString()} - {evaluation.trainingPeriod.to ? new Date(evaluation.trainingPeriod.to).toLocaleDateString() : "TBA"}
                                          </span>
                                        </div>
                                      )}
                                      {evaluation.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>Due: {new Date(evaluation.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {evaluation.status === "submitted" && evaluation.submittedAt && (
                                        <div className="flex items-center gap-1 text-green-600">
                                          <CheckCircle2 className="h-3 w-3" />
                                          <span>Submitted {new Date(evaluation.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEvaluation(
                                          evaluation._id, 
                                          evaluation.studentInfo?.fullName || (evaluation.student?.firstName && evaluation.student?.lastName ? `${evaluation.student.firstName} ${evaluation.student.lastName}` : "Unknown Student")
                                        );
                                      }}
                                      className="flex-shrink-0 h-8 w-8 p-0"
                                      title="Delete evaluation"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Detail View */}
      {selectedEvaluationDetail && (
        <Card className="border border-gray-200">
          <CardHeader className="bg-gray-100 border-b p-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <ClipboardList className="h-3 w-3 text-gray-700" />
                Evaluation Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvaluationDetail(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {loadingEvaluationDetail ? (
              <div className="py-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-600 mb-1" />
                <p className="text-xs text-gray-500">Loading evaluation details...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Student Info */}
                <div className="border border-gray-200 rounded p-2 bg-white">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Users className="h-3 w-3 text-gray-600" />
                    <p className="text-xs font-semibold text-gray-700 uppercase">Student Information</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedEvaluationDetail.studentInfo?.fullName || 
                         (selectedEvaluationDetail.student?.firstName && selectedEvaluationDetail.student?.lastName 
                          ? `${selectedEvaluationDetail.student.firstName} ${selectedEvaluationDetail.student.lastName}` 
                          : "Unknown")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Program</p>
                      <p className="font-medium text-gray-900">
                        {selectedEvaluationDetail.studentInfo?.program || selectedEvaluationDetail.student?.program || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Student ID</p>
                      <p className="font-medium text-gray-900">
                        {selectedEvaluationDetail.studentInfo?.studentNumber || selectedEvaluationDetail.student?.studentId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Status</p>
                      <Badge className={`text-xs ${statusStyles[selectedEvaluationDetail.status] || "bg-gray-100 text-gray-800"}`}>
                        {selectedEvaluationDetail.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Summary */}
                {calculatePerformanceMetrics && (
                  <div className="border border-gray-200 rounded p-2 bg-white">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="h-3 w-3 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase">Performance Summary</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div className="text-center p-1.5 bg-blue-50 rounded">
                        <p className="text-sm font-bold text-blue-600">
                          {calculatePerformanceMetrics.overallAverage.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">Overall Average</p>
                      </div>
                      <div className="text-center p-1.5 bg-green-50 rounded">
                        <p className="text-sm font-bold text-green-600">
                          {calculatePerformanceMetrics.completionRate.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-600">Completion Rate</p>
                      </div>
                      <div className="text-center p-1.5 bg-gray-50 rounded">
                        <p className="text-sm font-bold text-gray-600">
                          {calculatePerformanceMetrics.answeredQuestions}/{calculatePerformanceMetrics.totalQuestions}
                        </p>
                        <p className="text-xs text-gray-600">Questions Answered</p>
                      </div>
                      <div className="text-center p-1.5 bg-gray-50 rounded">
                        <p className="text-sm font-bold text-gray-600">
                          {selectedEvaluationDetail.sections?.length || 0}
                        </p>
                        <p className="text-xs text-gray-600">Total Sections</p>
                      </div>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">Rating Distribution</p>
                      <div className="flex items-center gap-1.5">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = calculatePerformanceMetrics.ratingDistribution[rating] || 0;
                          const total = calculatePerformanceMetrics.answeredQuestions;
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          return (
                            <div key={rating} className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-gray-600">{rating}★</span>
                                <span className="text-xs font-medium text-gray-700">{count}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    rating === 5 ? 'bg-green-500' :
                                    rating === 4 ? 'bg-blue-500' :
                                    rating === 3 ? 'bg-yellow-500' :
                                    rating === 2 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section Averages */}
                    {calculatePerformanceMetrics.sectionMetrics.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1.5">Section Averages</p>
                        <div className="space-y-0.5">
                          {calculatePerformanceMetrics.sectionMetrics.map((section) => (
                            <div key={section.label} className="flex items-center justify-between text-xs p-1 bg-gray-50 rounded">
                              <span className="font-medium text-gray-700">
                                {section.label}: {section.title}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-600">
                                  {section.answered}/{section.total}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {section.average > 0 ? section.average.toFixed(2) : "N/A"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluation Sections */}
                {selectedEvaluationDetail.sections && selectedEvaluationDetail.sections.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEvaluationDetail.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border border-gray-200 rounded p-2 bg-white">
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-100">
                          <div className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                            {section.label}
                          </div>
                          <p className="font-semibold text-xs text-gray-900">{section.title}</p>
                        </div>
                        {section.description && (
                          <p className="text-xs text-gray-600 mb-1.5">{section.description}</p>
                        )}
                        <div className="space-y-1.5">
                          {section.questions?.map((question, questionIndex) => (
                            <div key={questionIndex} className="border border-gray-200 rounded p-1.5 bg-gray-50">
                              <p className="font-medium text-xs text-gray-900 mb-0.5">
                                {question.prompt}
                              </p>
                              {question.description && (
                                <p className="text-xs text-gray-500 mb-1">{question.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {question.rating !== null && question.rating !== undefined ? (
                                    <>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-3 w-3 ${
                                              star <= question.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700">
                                        {question.rating}/5
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-400">Not rated</span>
                                  )}
                                </div>
                              </div>
                              {question.comments && (
                                <div className="mt-1 pt-1 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Comments: </span>
                                    {question.comments}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-gray-500">
                    No evaluation sections available yet
                  </div>
                )}

                {/* Overall Comments */}
                {selectedEvaluationDetail.overallComments && (
                  <div className="border border-gray-200 rounded p-2 bg-white">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Info className="h-3 w-3 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase">Overall Comments</p>
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">
                      {selectedEvaluationDetail.overallComments}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  ), [evaluationsByCompany, loadingEvaluationsByCompany, loadEvaluationsByCompany, expandedCompanies, handleDeleteEvaluation, selectedEvaluationDetail, loadingEvaluationDetail, calculatePerformanceMetrics, handleViewEvaluationDetail]);

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Student Evaluations
              </h1>
              <p className="text-gray-600 text-xs mt-0.5">
                Create evaluation forms and assign them to companies
              </p>
            </div>
          </div>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-white">
          <Button
            variant={activeTab === "templates" ? "default" : "ghost"}
            size="sm"
            className={`text-xs ${
              activeTab === "templates"
                ? ""
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("templates")}
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            Templates
          </Button>
          <Button
            variant={activeTab === "assignments" ? "default" : "ghost"}
            size="sm"
            className={`text-xs ${
              activeTab === "assignments"
                ? ""
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("assignments")}
          >
            <ListChecks className="h-3 w-3 mr-1" />
            Assignments
          </Button>
          <Button
            variant={activeTab === "view-evaluations" ? "default" : "ghost"}
            size="sm"
            className={`text-xs ${
              activeTab === "view-evaluations"
                ? ""
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("view-evaluations")}
          >
            <Building2 className="h-3 w-3 mr-1" />
            View Evaluations
          </Button>
        </div>
      </div>

      {/* Content with smooth transition */}
      <div className="animate-in fade-in-50 duration-300">
        {activeTab === "templates" ? TemplateTab : activeTab === "assignments" ? AssignmentsTab : ViewEvaluationsTab}
      </div>
    </div>
  );
};

export default AdminEvaluations;


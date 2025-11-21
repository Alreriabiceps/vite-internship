import { useEffect, useMemo, useState } from "react";
import { companiesAPI } from "../../../lib/api";
import { useSocket } from "../../../contexts/SocketContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  submitted: "bg-green-100 text-green-800",
};

const ratingValues = [5, 4, 3, 2, 1];

const CompanyEvaluations = () => {
  const { socket } = useSocket();
  const [evaluations, setEvaluations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [formSections, setFormSections] = useState([]);
  const [overallComments, setOverallComments] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadEvaluations = async () => {
    setLoadingList(true);
    try {
      const response = await companiesAPI.getEvaluations();
      const data = response.data.data || [];
      setEvaluations(data);
      if (!selectedEvaluationId && data.length > 0) {
        setSelectedEvaluationId(data[0]._id);
      }
    } catch (error) {
      console.error("Unable to load evaluations", error);
      toast.error("Failed to load student evaluations assigned to you");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  // Listen for real-time evaluation assignments
  useEffect(() => {
    if (!socket) return;

    const handleEvaluationsAssigned = (data) => {
      console.log("📬 New evaluations assigned:", data);
      
      // Show toast notification
      toast.success(
        `🎯 ${data.message || `${data.count} new evaluation(s) assigned!`}`,
        {
          duration: 6000,
          icon: "🎯",
          style: {
            background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
            color: "white",
            border: "none",
            fontWeight: "600",
          },
        }
      );
      
      // Reload evaluations to show new ones
      loadEvaluations();
    };

    socket.on("evaluations_assigned", handleEvaluationsAssigned);

    return () => {
      socket.off("evaluations_assigned", handleEvaluationsAssigned);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    if (!selectedEvaluationId) {
      setSelectedEvaluation(null);
      setFormSections([]);
      setOverallComments("");
      return;
    }

    const fetchEvaluation = async () => {
      setLoadingDetail(true);
      try {
        const response = await companiesAPI.getEvaluation(selectedEvaluationId);
        const evaluation = response.data.data;
        setSelectedEvaluation(evaluation);
        setFormSections(
          evaluation.sections?.map((section, sIdx) => ({
            ...section,
            _sectionId: section.label || `section-${sIdx}`,
            questions: section.questions?.map((question, qIdx) => ({
              ...question,
              _questionId: `${section.label || sIdx}-${qIdx}-${question.prompt?.substring(0, 10) || qIdx}`,
              rating: question.rating ?? null,
              comments: question.comments || "",
            })),
          })) || []
        );
        setOverallComments(evaluation.overallComments || "");
      } catch (error) {
        console.error("Unable to fetch evaluation details", error);
        toast.error("Failed to load evaluation details");
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchEvaluation();
  }, [selectedEvaluationId]);

  const handleRatingChange = (sectionIndex, questionIndex, rating) => {
    setFormSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, qIdx) =>
            qIdx === questionIndex ? { ...question, rating } : question
          ),
        };
      })
    );
  };

  const handleCommentChange = (sectionIndex, questionIndex, comment) => {
    setFormSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, qIdx) =>
            qIdx === questionIndex ? { ...question, comments: comment } : question
          ),
        };
      })
    );
  };

  const handleSaveEvaluation = async (submit = false) => {
    if (!selectedEvaluation) return;
    if (!formSections || formSections.length === 0) {
      toast.error("No evaluation data to save");
      return;
    }
    if (submit) {
      const incomplete = formSections.some((section) =>
        section.questions?.some((question) => !question.rating)
      );
      if (incomplete) {
        toast.error("Please provide a rating for every question before submitting");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        sections: formSections.map((section) => ({
          label: section.label,
          title: section.title,
          questions: section.questions.map((question) => ({
            prompt: question.prompt,
            description: question.description,
            rating: question.rating,
            comments: question.comments,
          })),
        })),
        overallComments,
        submit,
      };

      const response = await companiesAPI.updateEvaluation(
        selectedEvaluation._id,
        payload
      );

      const updated = response.data.data;
      setSelectedEvaluation(updated);
      setFormSections(
        updated.sections?.map((section, sIdx) => ({
          ...section,
          _sectionId: section.label || `section-${sIdx}`,
          questions: section.questions?.map((question, qIdx) => ({
            ...question,
            _questionId: `${section.label || sIdx}-${qIdx}-${question.prompt?.substring(0, 10) || qIdx}`,
            comments: question.comments || "",
          })),
        })) || []
      );
      setOverallComments(updated.overallComments || "");

      toast.success(
        submit ? "Evaluation submitted successfully" : "Progress saved"
      );
      loadEvaluations();
    } catch (error) {
      console.error("Unable to update evaluation", error);
      const message =
        error.response?.data?.message ||
        (submit
          ? "Failed to submit evaluation"
          : "Failed to save your progress");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const disableForm = selectedEvaluation?.status === "submitted";

  const ratingScaleText = useMemo(() => {
    return (
      selectedEvaluation?.templateSnapshot?.ratingScale?.description ||
      "Rating: 5 – Excellent, 4 – Very Good, 3 – Good, 2 – Fair, 1 – Poor"
    );
  }, [selectedEvaluation]);

  // Calculate progress
  const calculateProgress = useMemo(() => {
    if (!selectedEvaluation || formSections.length === 0) return 0;
    const totalQuestions = formSections.reduce(
      (sum, section) => sum + (section.questions?.length || 0),
      0
    );
    const answeredQuestions = formSections.reduce(
      (sum, section) =>
        sum +
        (section.questions?.filter((q) => q.rating !== null && q.rating !== undefined)
          .length || 0),
      0
    );
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [formSections, selectedEvaluation]);

  return (
    <div className="p-3 sm:p-4 space-y-4 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Evaluations
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Provide feedback for interns. Student and company data are auto-filled.
            </p>
          </div>
        </div>
        {selectedEvaluation && (
          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Evaluation Progress</p>
                  <p className="text-xs text-gray-500">Complete all ratings to submit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                  {calculateProgress}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <Card className="h-fit border border-gray-200">
          <CardHeader className="bg-gray-100 border-b p-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-gray-700" />
              Assigned Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {loadingList ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No evaluation requests yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Evaluations will appear here when assigned
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {evaluations.map((evaluation) => (
                  <button
                    key={evaluation._id}
                    onClick={() => setSelectedEvaluationId(evaluation._id)}
                    className={`w-full text-left rounded border p-2.5 transition-all ${
                      evaluation._id === selectedEvaluationId
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {evaluation.studentInfo?.fullName || "Student"}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            evaluation._id === selectedEvaluationId
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {evaluation.templateSnapshot?.name}
                        </p>
                      </div>
                      {evaluation.status === "submitted" && (
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${
                          evaluation._id === selectedEvaluationId
                            ? "text-white"
                            : "text-green-600"
                        }`} />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          evaluation._id === selectedEvaluationId
                            ? "bg-white/20 text-white"
                            : statusStyles[evaluation.status] ||
                              "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {evaluation.status.replace("_", " ")}
                      </span>
                      {evaluation.dueDate && (
                        <span
                          className={`flex items-center gap-1 ${
                            evaluation._id === selectedEvaluationId
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {new Date(evaluation.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[400px] border border-gray-200">
          <CardHeader className="bg-gray-100 border-b p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-700" />
              Evaluation Form
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              {selectedEvaluation
                ? "Auto-filled trainee information is shown below. Provide ratings and comments for each question."
                : "Select an evaluation from the list to begin."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {loadingDetail ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-500">Loading evaluation...</p>
                </div>
              </div>
            ) : !selectedEvaluation ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No evaluation selected</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose an evaluation on the left to view details
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border border-gray-200 rounded p-3 space-y-2 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="h-3 w-3 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase">Student Information</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Student Name</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {selectedEvaluation.studentInfo?.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Program / Course</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {selectedEvaluation.studentInfo?.program || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Student ID</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {selectedEvaluation.studentInfo?.studentNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded p-3 space-y-2 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase">Internship Details</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Company</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {selectedEvaluation.companyInfo?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Internship Assignment</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {selectedEvaluation.internshipAssignment || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Training Period</p>
                      <p className="font-medium text-gray-800 text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        {selectedEvaluation.trainingPeriod?.from
                          ? new Date(
                              selectedEvaluation.trainingPeriod.from
                            ).toLocaleDateString()
                          : "TBD"}
                        {" – "}
                        {selectedEvaluation.trainingPeriod?.to
                          ? new Date(
                              selectedEvaluation.trainingPeriod.to
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-gray-700 flex items-start gap-2">
                  <Star className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-0.5">Rating Guide</p>
                    <p className="text-gray-700">{ratingScaleText}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formSections.map((section, sectionIndex) => (
                    <div
                      key={section._sectionId || `${section.label}-${sectionIndex}`}
                      className="rounded border border-gray-200 p-3 space-y-3 bg-white"
                    >
                      <div className="pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                            {section.label}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {section.title}
                          </p>
                        </div>
                        {section.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {section.questions.map((question, questionIndex) => (
                          <div
                            key={question._questionId || `${section.label}-${questionIndex}`}
                            className="rounded border border-gray-200 p-3 space-y-2 bg-gray-50"
                          >
                            <div className="flex flex-col gap-0.5">
                              <p className="font-medium text-gray-800 text-sm">
                                {question.prompt}
                              </p>
                              {question.description && (
                                <p className="text-xs text-gray-500">
                                  {question.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {ratingValues.map((value) => {
                                const isSelected = question.rating === value;
                                const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
                                return (
                                  <Button
                                    key={`rating-${value}`}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    disabled={disableForm}
                                    onClick={() =>
                                      handleRatingChange(
                                        sectionIndex,
                                        questionIndex,
                                        value
                                      )
                                    }
                                    className={`h-8 px-2 text-xs ${
                                      isSelected
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "hover:bg-blue-50"
                                    }`}
                                    title={ratingLabels[5 - value]}
                                  >
                                    <Star
                                      className={`h-3 w-3 mr-1 ${
                                        isSelected ? "fill-white text-white" : "text-gray-400"
                                      }`}
                                    />
                                    <span className="font-medium">{value}</span>
                                  </Button>
                                );
                              })}
                            </div>
                            <Textarea
                              value={question.comments}
                              onChange={(event) =>
                                handleCommentChange(
                                  sectionIndex,
                                  questionIndex,
                                  event.target.value
                                )
                              }
                              placeholder="Add your comments here (optional)"
                              disabled={disableForm}
                              className="text-xs resize-none"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Overall Comments (optional)
                  </label>
                  <Textarea
                    rows={3}
                    value={overallComments}
                    onChange={(event) => setOverallComments(event.target.value)}
                    placeholder="Provide overall feedback about the trainee's performance"
                    disabled={disableForm}
                    className="text-xs"
                  />
                </div>

                {disableForm ? (
                  <div className="rounded border border-green-200 bg-green-50 p-3 text-xs text-gray-700 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">Evaluation Submitted</p>
                      <p className="text-gray-600">
                        Submitted on{" "}
                        {selectedEvaluation.submittedAt
                          ? new Date(
                              selectedEvaluation.submittedAt
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSaveEvaluation(false)}
                      disabled={saving}
                      className="h-8 text-xs"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Save Progress
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSaveEvaluation(true)}
                      disabled={saving}
                      className="h-8 bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submit Evaluation
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                      <AlertCircle className="h-3 w-3 text-amber-600 flex-shrink-0" />
                      <p>You can save progress anytime; submission locks the form.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyEvaluations;


import { makeFunctionReference } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";

export type LmsProgressStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "awaiting_review"
  | "completed"
  | "blocked";

export type StudentLmsEnrollment = {
  enrollmentId: Id<"enrollments">;
  enrollmentNumber: string;
  courseId: Id<"courses">;
  courseName: string;
  courseCode?: string;
  batchLabel?: string;
  curriculumTitle?: string;
  curriculumVersion?: number;
  lmsStatus: "active" | "completed" | "suspended" | "awaiting_activation";
};

export type StudentLmsActivity = {
  activityId: Id<"lmsActivities">;
  moduleId: Id<"lmsModules">;
  type:
    | "reading"
    | "media"
    | "external_resource"
    | "quiz"
    | "assignment"
    | "feedback";
  title: string;
  durationMinutes?: number;
  required: boolean;
  sortOrder: number;
  completionMode:
    | "view"
    | "self_confirm"
    | "submit"
    | "pass"
    | "faculty_approval";
  passingScore?: number;
  releaseAt?: number;
  isAvailable: boolean;
  lockReason?: string;
  instructions?: string;
  content?: string;
  externalUrl?: string;
  accessibleAlternative?: string;
  quiz?: {
    questions: Array<{
      questionId: Id<"lmsQuizQuestions">;
      prompt: string;
      sortOrder: number;
      options: Array<{
        optionId: Id<"lmsQuizOptions">;
        label: string;
        sortOrder: number;
      }>;
    }>;
    latestAttempt?: {
      attemptNumber: number;
      score: number;
      passed: boolean;
      submittedAt: number;
    };
  };
  feedback?: {
    mode: "identified" | "anonymous";
    minimumGroupSize?: number;
    receipt?: {
      receiptCode: string;
      submittedAt: number;
    };
  };
};

export type StudentLmsWorkspace = {
  enrollment: {
    enrollmentId: Id<"enrollments">;
    enrollmentNumber: string;
    batchLabel?: string;
  };
  course: {
    courseId: Id<"courses">;
    name: string;
    code: string;
    duration?: string;
  } | null;
  curriculum: {
    curriculumId: Id<"lmsCurricula">;
    title: string;
    version: number;
  };
  modules: Array<{
    moduleId: Id<"lmsModules">;
    title: string;
    description?: string;
    sortOrder: number;
  }>;
  activities: StudentLmsActivity[];
  progress: Array<{
    activityId: Id<"lmsActivities">;
    status: LmsProgressStatus;
    submittedAt?: number;
    completedAt?: number;
    updatedAt: number;
  }>;
  completion?: {
    requestId: Id<"lmsCompletionRequests">;
    status:
      | "awaiting_name"
      | "pending"
      | "approved"
      | "correction_required"
      | "under_review"
      | "revoked";
    confirmedRecipientName?: string;
    correctionReason?: string;
    certificate?: {
      verificationCode: string;
      recipientName: string;
      courseName: string;
      status: "issued" | "suspended" | "revoked";
      issuedAt: number;
      publicVerificationEnabled: boolean;
    };
  };
  questions: Array<{
    questionId: Id<"lmsQuestions">;
    activityId?: Id<"lmsActivities">;
    visibility: "private" | "course" | "batch";
    body: string;
    status: "open" | "answered" | "closed";
    officialAnswer?: string;
    moderationReason?: string;
    isMine: boolean;
    createdAt: number;
    answeredAt?: number;
  }>;
  notifications: Array<{
    notificationId: Id<"lmsNotifications">;
    kind:
      | "question_answered"
      | "submission_accepted"
      | "submission_returned"
      | "completion_approved"
      | "completion_correction"
      | "completion_review";
    title: string;
    body: string;
    href: string;
    readAt?: number;
    createdAt: number;
  }>;
};

export const studentLmsApi = {
  listMyEnrollments: makeFunctionReference<
    "query",
    Record<string, never>,
    StudentLmsEnrollment[]
  >("lms:listMyLmsEnrollments"),
  getMyWorkspace: makeFunctionReference<
    "query",
    { enrollmentId: Id<"enrollments"> },
    StudentLmsWorkspace | null
  >("lms:getMyWorkspace"),
  setSelfCompletion: makeFunctionReference<
    "mutation",
    {
      enrollmentId: Id<"enrollments">;
      activityId: Id<"lmsActivities">;
      completed: boolean;
    },
    { status: "completed" | "in_progress" }
  >("lms:setSelfCompletion"),
  submitAssignment: makeFunctionReference<
    "mutation",
    {
      enrollmentId: Id<"enrollments">;
      activityId: Id<"lmsActivities">;
      responseText: string;
    },
    { submissionId: Id<"lmsSubmissions"> }
  >("lms:submitAssignment"),
  submitQuizAttempt: makeFunctionReference<
    "mutation",
    {
      enrollmentId: Id<"enrollments">;
      activityId: Id<"lmsActivities">;
      answers: Array<{
        questionId: Id<"lmsQuizQuestions">;
        optionId: Id<"lmsQuizOptions">;
      }>;
    },
    {
      attemptId: Id<"lmsQuizAttempts">;
      attemptNumber: number;
      score: number;
      passed: boolean;
    }
  >("lms:submitQuizAttempt"),
  submitFeedback: makeFunctionReference<
    "mutation",
    {
      enrollmentId: Id<"enrollments">;
      activityId: Id<"lmsActivities">;
      rating: number;
      comment: string;
    },
    {
      receiptCode: string;
      submittedAt: number;
      alreadySubmitted: boolean;
    }
  >("lms:submitFeedback"),
  askQuestion: makeFunctionReference<
    "mutation",
    {
      enrollmentId: Id<"enrollments">;
      activityId?: Id<"lmsActivities">;
      visibility: "private" | "course" | "batch";
      body: string;
    },
    { questionId: Id<"lmsQuestions"> }
  >("lms:askQuestion"),
  confirmCertificateName: makeFunctionReference<
    "mutation",
    { enrollmentId: Id<"enrollments">; recipientName: string },
    { status: "pending"; recipientName: string }
  >("lms:confirmCertificateName"),
  setCertificateVerificationConsent: makeFunctionReference<
    "mutation",
    { enrollmentId: Id<"enrollments">; enabled: boolean },
    { enabled: boolean }
  >("lms:setCertificateVerificationConsent"),
  markNotificationRead: makeFunctionReference<
    "mutation",
    { notificationId: Id<"lmsNotifications"> },
    { read: true }
  >("lms:markNotificationRead"),
};

export type PublicCertificateVerification = {
  verificationCode: string;
  courseName: string;
  recipientName?: string;
  identityVisible: boolean;
  status: "issued" | "suspended" | "revoked";
  issuedAt: number;
};

export const publicCertificateApi = {
  verify: makeFunctionReference<
    "query",
    { verificationCode: string },
    PublicCertificateVerification | null
  >("lms:verifyCertificate"),
};

export type FacultyQueueItem =
  | {
      kind: "submission";
      id: Id<"lmsSubmissions">;
      enrollmentId: Id<"enrollments">;
      activityId: Id<"lmsActivities">;
      title: string;
      courseName: string;
      studentName: string;
      studentEmail?: string;
      body: string;
      attemptNumber: number;
      status: "submitted" | "in_review";
      createdAt: number;
    }
  | {
      kind: "question";
      id: Id<"lmsQuestions">;
      enrollmentId: Id<"enrollments">;
      activityId?: Id<"lmsActivities">;
      title: string;
      courseName: string;
      studentName: string;
      studentEmail?: string;
      body: string;
      visibility: "private" | "course" | "batch";
      status: "open";
      createdAt: number;
    }
  | {
      kind: "completion";
      id: Id<"lmsCompletionRequests">;
      enrollmentId: Id<"enrollments">;
      title: string;
      courseName: string;
      studentName: string;
      studentEmail?: string;
      body: string;
      status: "pending" | "under_review";
      createdAt: number;
    };

export type FacultyQueue = {
  assignments: Array<{
    assignmentId: Id<"lmsFacultyAssignments">;
    courseId: Id<"courses">;
    courseName: string;
    batchId?: Id<"courseBatches">;
    canGrade: boolean;
    canAnswerQuestions: boolean;
    canApproveCompletion: boolean;
  }>;
  items: FacultyQueueItem[];
};

export type FacultyFeedbackReport = {
  activityId: Id<"lmsActivities">;
  activityTitle: string;
  courseName: string;
  mode: "identified" | "anonymous";
  minimumGroupSize: number;
  responseCount: number;
  released: boolean;
  averageRating: number | null;
  comments: string[];
};

export const facultyLmsApi = {
  listMyQueue: makeFunctionReference<
    "query",
    Record<string, never>,
    FacultyQueue
  >("lmsFaculty:listMyQueue"),
  listMyFeedbackReports: makeFunctionReference<
    "query",
    Record<string, never>,
    FacultyFeedbackReport[]
  >("lmsFaculty:listMyFeedbackReports"),
  reviewSubmission: makeFunctionReference<
    "mutation",
    {
      submissionId: Id<"lmsSubmissions">;
      decision: "accepted" | "returned";
      feedback: string;
    },
    { status: "accepted" | "returned" }
  >("lmsFaculty:reviewSubmission"),
  answerQuestion: makeFunctionReference<
    "mutation",
    { questionId: Id<"lmsQuestions">; answer: string },
    { status: "answered" }
  >("lmsFaculty:answerQuestion"),
  moderateQuestion: makeFunctionReference<
    "mutation",
    { questionId: Id<"lmsQuestions">; reason: string },
    { status: "closed" }
  >("lmsFaculty:moderateQuestion"),
  approveCompletion: makeFunctionReference<
    "mutation",
    { requestId: Id<"lmsCompletionRequests"> },
    { status: "approved"; certificateId: Id<"lmsCertificates"> }
  >("lmsFaculty:approveCompletion"),
  updateCompletionReview: makeFunctionReference<
    "mutation",
    {
      requestId: Id<"lmsCompletionRequests">;
      status: "correction_required" | "under_review" | "revoked";
      reason: string;
    },
    { status: "correction_required" | "under_review" | "revoked" }
  >("lmsFaculty:updateCompletionReview"),
};

export type AdminReleaseDesk = {
  courses: Array<{ courseId: Id<"courses">; name: string; code: string }>;
  curricula: Array<{
    curriculumId: Id<"lmsCurricula">;
    courseId: Id<"courses">;
    title: string;
    version: number;
    status: "draft" | "published" | "archived";
    updatedAt: number;
    publishedAt?: number;
  }>;
  enrollments: Array<{
    enrollmentId: Id<"enrollments">;
    enrollmentNumber: string;
    courseId: Id<"courses">;
    courseName: string;
    studentName: string;
    batchLabel?: string;
    assignmentId?: Id<"lmsEnrollmentCurricula">;
    curriculumId?: Id<"lmsCurricula">;
    lmsStatus: "active" | "completed" | "suspended" | "awaiting_activation";
  }>;
  facultyAssignments: Array<{
    assignmentId: Id<"lmsFacultyAssignments">;
    courseId: Id<"courses">;
    batchId?: Id<"courseBatches">;
    facultyTokenIdentifier: string;
    canGrade: boolean;
    canAnswerQuestions: boolean;
    canApproveCompletion: boolean;
  }>;
};

export type AdminCurriculum = {
  curriculum: {
    _id: Id<"lmsCurricula">;
    courseId: Id<"courses">;
    title: string;
    version: number;
    status: "draft" | "published" | "archived";
  };
  modules: Array<{
    _id: Id<"lmsModules">;
    title: string;
    description?: string;
    sortOrder: number;
  }>;
  activities: Array<{
    _id: Id<"lmsActivities">;
    moduleId: Id<"lmsModules">;
    title: string;
    type: StudentLmsActivity["type"];
    required: boolean;
    sortOrder: number;
    rightsApproved: boolean;
    accessibleAlternative?: string;
    passingScore?: number;
    feedbackMode?: "identified" | "anonymous";
    feedbackMinimumGroupSize?: number;
  }>;
  quizQuestions: Array<{
    _id: Id<"lmsQuizQuestions">;
    activityId: Id<"lmsActivities">;
    prompt: string;
    sortOrder: number;
    options: Array<{
      _id: Id<"lmsQuizOptions">;
      label: string;
      sortOrder: number;
      isCorrect: boolean;
    }>;
  }>;
  feedbackReports: Array<{
    activityId: Id<"lmsActivities">;
    mode: "identified" | "anonymous";
    minimumGroupSize: number;
    responseCount: number;
    released: boolean;
    averageRating: number | null;
    comments: string[];
    identifiedResponses: Array<{
      studentName: string;
      rating: number;
      comment?: string;
      submittedAt: number;
    }>;
  }>;
};

export const adminLmsApi = {
  getReleaseDesk: makeFunctionReference<
    "query",
    Record<string, never>,
    AdminReleaseDesk
  >("lmsAdmin:getReleaseDesk"),
  getCurriculum: makeFunctionReference<
    "query",
    { curriculumId: Id<"lmsCurricula"> },
    AdminCurriculum | null
  >("lms:getAdminCurriculum"),
  createDraft: makeFunctionReference<
    "mutation",
    { courseId: Id<"courses">; title: string },
    { curriculumId: Id<"lmsCurricula">; version: number }
  >("lms:createDraftCurriculum"),
  addModule: makeFunctionReference<
    "mutation",
    { curriculumId: Id<"lmsCurricula">; title: string; description?: string },
    { moduleId: Id<"lmsModules"> }
  >("lms:addModule"),
  addActivity: makeFunctionReference<
    "mutation",
    {
      moduleId: Id<"lmsModules">;
      type: StudentLmsActivity["type"];
      title: string;
      instructions?: string;
      content?: string;
      externalUrl?: string;
      durationMinutes?: number;
      required: boolean;
      releaseMode: "immediate" | "date" | "prerequisite";
      releaseAt?: number;
      prerequisiteActivityId?: Id<"lmsActivities">;
      completionMode: StudentLmsActivity["completionMode"];
      passingScore?: number;
      feedbackMode?: "identified" | "anonymous";
      feedbackMinimumGroupSize?: number;
      rightsApproved: boolean;
      accessibleAlternative?: string;
    },
    { activityId: Id<"lmsActivities"> }
  >("lms:addActivity"),
  addQuizQuestion: makeFunctionReference<
    "mutation",
    {
      activityId: Id<"lmsActivities">;
      prompt: string;
      options: Array<{ label: string; isCorrect: boolean }>;
    },
    { questionId: Id<"lmsQuizQuestions"> }
  >("lms:addQuizQuestion"),
  publishCurriculum: makeFunctionReference<
    "mutation",
    { curriculumId: Id<"lmsCurricula"> },
    { publishedAt: number }
  >("lms:publishCurriculum"),
  activateEnrollment: makeFunctionReference<
    "mutation",
    { enrollmentId: Id<"enrollments">; curriculumId: Id<"lmsCurricula"> },
    { assignmentId: Id<"lmsEnrollmentCurricula">; alreadyActive: boolean }
  >("lms:activateEnrollment"),
  assignFaculty: makeFunctionReference<
    "mutation",
    {
      courseId: Id<"courses">;
      batchId?: Id<"courseBatches">;
      facultyTokenIdentifier: string;
      canGrade: boolean;
      canAnswerQuestions: boolean;
      canApproveCompletion: boolean;
    },
    { assignmentId: Id<"lmsFacultyAssignments">; updated: boolean }
  >("lmsAdmin:assignFaculty"),
};

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
      status: "pending";
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

export const facultyLmsApi = {
  listMyQueue: makeFunctionReference<
    "query",
    Record<string, never>,
    FacultyQueue
  >("lmsFaculty:listMyQueue"),
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
  approveCompletion: makeFunctionReference<
    "mutation",
    { requestId: Id<"lmsCompletionRequests"> },
    { status: "approved"; certificateId: Id<"lmsCertificates"> }
  >("lmsFaculty:approveCompletion"),
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
      rightsApproved: boolean;
      accessibleAlternative?: string;
    },
    { activityId: Id<"lmsActivities"> }
  >("lms:addActivity"),
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

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

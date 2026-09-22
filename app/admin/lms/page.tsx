"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  CircleAlert,
  ClipboardCheck,
  GraduationCap,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminLmsApi,
  type AdminCurriculum,
  type StudentLmsActivity,
} from "@/lib/lms-api";
import type { Id } from "@/convex/_generated/dataModel";
import "./admin-lms.css";

const activityTypes: Array<{
  value: StudentLmsActivity["type"];
  label: string;
}> = [
  { value: "reading", label: "Reading" },
  { value: "media", label: "Media" },
  { value: "external_resource", label: "External resource" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "feedback", label: "Feedback" },
];

function message(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/^\[CONVEX[^]*?\]\s*/, "")
    : "The change could not be saved.";
}

export default function AdminLmsPage() {
  const desk = useQuery(adminLmsApi.getReleaseDesk, {});
  const [courseId, setCourseId] = useState<string>("");
  const currentCourseId = courseId || desk?.courses[0]?.courseId || "";
  const courseCurricula = useMemo(
    () =>
      desk?.curricula.filter((item) => item.courseId === currentCourseId) ?? [],
    [desk, currentCourseId],
  );
  const [curriculumId, setCurriculumId] = useState<string>("");
  const currentCurriculumId =
    curriculumId &&
    courseCurricula.some((item) => item.curriculumId === curriculumId)
      ? curriculumId
      : courseCurricula[0]?.curriculumId;
  const curriculum = useQuery(
    adminLmsApi.getCurriculum,
    currentCurriculumId
      ? { curriculumId: currentCurriculumId as Id<"lmsCurricula"> }
      : "skip",
  );
  const createDraft = useMutation(adminLmsApi.createDraft);
  const addModule = useMutation(adminLmsApi.addModule);
  const addActivity = useMutation(adminLmsApi.addActivity);
  const addQuizQuestion = useMutation(adminLmsApi.addQuizQuestion);
  const publish = useMutation(adminLmsApi.publishCurriculum);
  const activate = useMutation(adminLmsApi.activateEnrollment);
  const assignFaculty = useMutation(adminLmsApi.assignFaculty);
  const [draftTitle, setDraftTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [activityType, setActivityType] =
    useState<StudentLmsActivity["type"]>("reading");
  const [activityTitle, setActivityTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [gradingCriteria, setGradingCriteria] = useState("");
  const [content, setContent] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [accessibleAlternative, setAccessibleAlternative] = useState("");
  const [rightsApproved, setRightsApproved] = useState(false);
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [feedbackMode, setFeedbackMode] = useState<"identified" | "anonymous">(
    "anonymous",
  );
  const [feedbackMinimumGroupSize, setFeedbackMinimumGroupSize] = useState("5");
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [manifestOpen, setManifestOpen] = useState(false);
  const [manifestConfirmed, setManifestConfirmed] = useState(false);
  const [pending, setPending] = useState<string>();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  }>();
  const selectedCourse = desk?.courses.find(
    (item) => item.courseId === currentCourseId,
  );
  const awaiting =
    desk?.enrollments.filter(
      (item) =>
        item.courseId === currentCourseId &&
        item.lmsStatus === "awaiting_activation",
    ) ?? [];
  const published = courseCurricula.filter(
    (item) => item.status === "published",
  );
  const courseFaculty =
    desk?.facultyAssignments.filter(
      (item) => item.courseId === currentCourseId,
    ) ?? [];
  const isDraft = curriculum?.curriculum.status === "draft";
  const activeModuleId =
    moduleId && curriculum?.modules.some((item) => item._id === moduleId)
      ? moduleId
      : curriculum?.modules[0]?._id;
  const blockers = !curriculum
    ? ["Create or select a Curriculum"]
    : ([
        curriculum.modules.length === 0 && "Add at least one Module",
        curriculum.activities.length === 0 && "Add at least one activity",
        curriculum.activities.some(
          (item) =>
            (item.type === "media" || item.type === "external_resource") &&
            !item.rightsApproved,
        ) && "Approve Rights for every Media and External resource",
        curriculum.activities.some(
          (item) => item.type === "media" && !item.accessibleAlternative,
        ) && "Add an accessible alternative to every Media activity",
        curriculum.activities.some(
          (item) =>
            item.type === "assignment" &&
            (item.gradingCriteria?.trim().length ?? 0) < 10,
        ) && "Add Faculty review criteria to every Assignment",
        ...curriculum.activities
          .filter((item) => item.type === "quiz")
          .map((quiz) =>
            (curriculum.quizQuestions?.filter(
              (question) => question.activityId === quiz._id,
            ).length ?? 0) === 0
              ? `Add at least one question to “${quiz.title}”`
              : false,
          ),
        ...curriculum.activities
          .filter((item) => item.type === "feedback")
          .map((feedback) =>
            !feedback.feedbackMode ||
            (feedback.feedbackMode === "anonymous" &&
              ((feedback.feedbackMinimumGroupSize ?? 0) < 3 ||
                (feedback.feedbackMinimumGroupSize ?? 0) > 50))
              ? `Finish the privacy settings for “${feedback.title}”`
              : false,
          ),
      ].filter(Boolean) as string[]);
  const hasLearningStructure = Boolean(
    curriculum?.modules.length && curriculum.activities.length,
  );
  const currentCurriculumPublished =
    curriculum?.curriculum.status === "published";
  const launchSteps = [
    {
      title: "Choose the Course",
      detail: "Confirm the Course and its delivery model.",
      complete: Boolean(selectedCourse),
      href: "#course-setup",
      action: "Choose a Course",
    },
    {
      title: "Create the Curriculum",
      detail: "Start the version Students will eventually receive.",
      complete: Boolean(curriculum),
      href: "#curriculum-author",
      action: "Create a Draft",
    },
    {
      title: "Build the learning path",
      detail: "Add at least one Module and one activity.",
      complete: hasLearningStructure,
      href: "#curriculum-author",
      action: "Build the Curriculum",
    },
    {
      title: "Clear the checks",
      detail: "Resolve content, Rights, access, and assessment gates.",
      complete: Boolean(curriculum) && blockers.length === 0,
      href: "#publication-readiness",
      action: "Review the checks",
    },
    {
      title: "Publish, then activate",
      detail: "Lock this version, then give eligible Students access.",
      complete: currentCurriculumPublished && awaiting.length === 0,
      href: currentCurriculumPublished
        ? "#enrollment-activation"
        : "#publication-readiness",
      action: currentCurriculumPublished
        ? "Activate Enrollments"
        : "Publish the Curriculum",
    },
  ];
  const nextLaunchStep = launchSteps.find((step) => !step.complete);
  const launchProgress = launchSteps.filter((step) => step.complete).length;
  const deliveryGuidance = selectedCourse
    ? {
        self_paced:
          "Build the complete Student journey here: lessons, resources, activities, and completion evidence.",
        hybrid:
          "Use the Curriculum for pre-work, resources, assessments, and certificate evidence alongside live teaching.",
        cohort:
          "Use the Curriculum as the shared learning path for each batch; live sessions continue alongside it.",
        event:
          "Use the Curriculum for preparation, event resources, feedback, and any completion evidence you need.",
      }[selectedCourse.learningMode]
    : "Choose an academic Course to see the right setup path. Therapy and standalone services stay outside the LMS.";

  async function act(
    key: string,
    task: () => Promise<unknown>,
    success: string,
  ) {
    setPending(key);
    setNotice(undefined);
    try {
      await task();
      setNotice({ type: "success", text: success });
    } catch (error) {
      setNotice({ type: "error", text: message(error) });
    } finally {
      setPending(undefined);
    }
  }

  if (desk === undefined)
    return (
      <div className="admin-lms-loading" aria-busy="true">
        Preparing the LMS release desk…
      </div>
    );

  return (
    <div className="admin-lms-page">
      <AdminPageHeader
        title="LMS Release desk"
        description="Author Draft Curricula, publish immutable versions, activate Enrollments, and assign Faculty scope."
        actions={
          <Button asChild variant="outline">
            <Link
              href="/lms/preview?role=administrator"
              target="_blank"
              rel="noreferrer"
            >
              Open exact-role preview
            </Link>
          </Button>
        }
      />
      {notice && (
        <p
          className={`admin-lms-notice ${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      )}
      <section className="admin-lms-coursebar" id="course-setup">
        <label>
          Course
          <select
            value={currentCourseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setCurriculumId("");
              setModuleId("");
              setManifestOpen(false);
              setManifestConfirmed(false);
            }}
          >
            <option value="">Choose a Course</option>
            {desk.courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.name} · {course.learningModeLabel}
              </option>
            ))}
          </select>
        </label>
        <label>
          Curriculum
          <select
            value={currentCurriculumId ?? ""}
            onChange={(event) => {
              setCurriculumId(event.target.value);
              setModuleId("");
              setManifestOpen(false);
              setManifestConfirmed(false);
            }}
          >
            <option value="">No Curriculum yet</option>
            {courseCurricula.map((item) => (
              <option key={item.curriculumId} value={item.curriculumId}>
                v{item.version} · {item.title} · {item.status}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-lms-mode" aria-live="polite">
          <span>Delivery model</span>
          <strong>
            {selectedCourse?.learningModeLabel ?? "Choose an academic Course"}
          </strong>
          <small>
            {selectedCourse
              ? `${selectedCourse.code} · ${selectedCourse.courseType}`
              : "Therapy and standalone services are intentionally kept outside the LMS."}
          </small>
        </div>
      </section>
      <section className="admin-lms-launch" aria-labelledby="launch-path-title">
        <div className="admin-lms-launch-intro">
          <div>
            <h2 id="launch-path-title">Your Course launch path</h2>
            <p>{deliveryGuidance}</p>
          </div>
          <span className="admin-lms-launch-progress">
            {launchProgress} of {launchSteps.length} ready
          </span>
        </div>
        <ol className="admin-lms-launch-steps">
          {launchSteps.map((step, index) => {
            const isCurrent = step === nextLaunchStep;
            return (
              <li
                key={step.title}
                className={step.complete ? "complete" : undefined}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="admin-lms-launch-mark" aria-hidden="true">
                  {step.complete ? <CheckCircle2 /> : <Circle />}
                </span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
                <span className="admin-lms-launch-number">{index + 1}</span>
              </li>
            );
          })}
        </ol>
        <div className="admin-lms-next-action" aria-live="polite">
          <span>
            <strong>
              {nextLaunchStep ? "Next step" : "Launch path clear"}
            </strong>
            <small>
              {nextLaunchStep
                ? nextLaunchStep.action
                : "This Curriculum is published and no Enrollments are waiting for access."}
            </small>
          </span>
          {nextLaunchStep ? (
            <Button asChild className="admin-lms-primary">
              <a href={nextLaunchStep.href}>{nextLaunchStep.action}</a>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/lms/preview?role=student" target="_blank">
                Review Student view
              </Link>
            </Button>
          )}
        </div>
      </section>
      {manifestOpen && curriculum && selectedCourse && (
        <section
          className="admin-lms-manifest"
          id="publish-manifest"
          aria-labelledby="publish-manifest-title"
        >
          <div className="admin-lms-manifest-head">
            <div>
              <h2 id="publish-manifest-title">
                Review the exact Published Curriculum
              </h2>
              <p>
                {selectedCourse.name} · {curriculum.curriculum.title} · version{" "}
                {curriculum.curriculum.version}
              </p>
            </div>
            <span>{selectedCourse.learningModeLabel}</span>
          </div>
          <div className="admin-lms-manifest-summary">
            <div>
              <strong>{curriculum.modules.length}</strong>
              <span>Modules</span>
            </div>
            <div>
              <strong>{curriculum.activities.length}</strong>
              <span>Activities</span>
            </div>
            <div>
              <strong>
                {curriculum.activities.filter((item) => item.required).length}
              </strong>
              <span>Required</span>
            </div>
            <p>
              Publishing makes this version read-only. It does not activate or
              change any Student Enrollment.
            </p>
          </div>
          <div className="admin-lms-manifest-modules">
            {curriculum.modules.map((module, moduleIndex) => {
              const moduleActivities = curriculum.activities.filter(
                (activity) => activity.moduleId === module._id,
              );
              return (
                <section key={module._id}>
                  <div>
                    <span>Module {moduleIndex + 1}</span>
                    <h3>{module.title}</h3>
                    {module.description && <p>{module.description}</p>}
                  </div>
                  <ol>
                    {moduleActivities.map((activity) => (
                      <li key={activity._id}>
                        <span>{activity.type.replaceAll("_", " ")}</span>
                        <strong>{activity.title}</strong>
                        <small>
                          {activity.required ? "Required" : "Optional"} ·{" "}
                          {activity.releaseMode.replaceAll("_", " ")} release ·{" "}
                          {activity.completionMode.replaceAll("_", " ")}
                          {activity.durationMinutes
                            ? ` · ${activity.durationMinutes} min`
                            : ""}
                          {activity.type === "quiz"
                            ? ` · pass at ${activity.passingScore ?? 100}%`
                            : ""}
                        </small>
                        {activity.type === "assignment" &&
                          activity.gradingCriteria && (
                            <p>Review criteria: {activity.gradingCriteria}</p>
                          )}
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
          <div className="admin-lms-manifest-commit">
            <label>
              <input
                type="checkbox"
                checked={manifestConfirmed}
                onChange={(event) => setManifestConfirmed(event.target.checked)}
              />
              <span>
                <strong>I reviewed this exact version</strong>
                <small>
                  I understand it becomes immutable after publication and
                  Student activation remains a separate action.
                </small>
              </span>
            </label>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setManifestOpen(false);
                  setManifestConfirmed(false);
                }}
              >
                Return to editing
              </Button>
              <Button
                className="admin-lms-primary"
                disabled={!manifestConfirmed || pending === "publish"}
                onClick={() =>
                  currentCurriculumId &&
                  act(
                    "publish",
                    async () => {
                      await publish({
                        curriculumId: currentCurriculumId as Id<"lmsCurricula">,
                      });
                      setManifestOpen(false);
                      setManifestConfirmed(false);
                    },
                    "Curriculum published. Enrollments remain unchanged until activation.",
                  )
                }
              >
                <ShieldCheck />
                {pending === "publish"
                  ? "Publishing…"
                  : "Publish immutable version"}
              </Button>
            </div>
          </div>
        </section>
      )}
      <div className="admin-lms-basin">
        <aside className="admin-lms-outline">
          <h2>Course outline</h2>
          <p>{selectedCourse?.name ?? "Choose a Course"}</p>
          {curriculum?.modules.map((module) => (
            <button
              type="button"
              key={module._id}
              aria-current={activeModuleId === module._id ? "true" : undefined}
              onClick={() => setModuleId(module._id)}
            >
              <BookOpen />
              <span>
                <strong>{module.title}</strong>
                <small>
                  {
                    curriculum.activities.filter(
                      (item) => item.moduleId === module._id,
                    ).length
                  }{" "}
                  activities
                </small>
              </span>
            </button>
          ))}
          {isDraft && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!currentCurriculumId) return;
                void act(
                  "module",
                  async () => {
                    await addModule({
                      curriculumId: currentCurriculumId as Id<"lmsCurricula">,
                      title: moduleTitle,
                      description: moduleDescription || undefined,
                    });
                    setModuleTitle("");
                    setModuleDescription("");
                  },
                  "Module added to the Draft.",
                );
              }}
            >
              <h3>Add Module</h3>
              <Input
                value={moduleTitle}
                onChange={(event) => setModuleTitle(event.target.value)}
                placeholder="Module title"
                required
              />
              <Textarea
                value={moduleDescription}
                onChange={(event) => setModuleDescription(event.target.value)}
                placeholder="Short orientation (optional)"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={!moduleTitle.trim() || pending === "module"}
              >
                <Plus />
                Add Module
              </Button>
            </form>
          )}
        </aside>
        <main className="admin-lms-author" id="curriculum-author">
          <h2>
            {isDraft
              ? "Author the active Module"
              : curriculum
                ? "Published Curriculum"
                : "Begin a Draft Curriculum"}
          </h2>
          {!curriculum ? (
            <form
              className="admin-lms-start"
              onSubmit={(event) => {
                event.preventDefault();
                if (!currentCourseId) return;
                void act(
                  "draft",
                  async () => {
                    const result = await createDraft({
                      courseId: currentCourseId as Id<"courses">,
                      title: draftTitle,
                    });
                    setCurriculumId(result.curriculumId);
                    setDraftTitle("");
                  },
                  "Draft Curriculum created.",
                );
              }}
            >
              <p>
                Publication and Student activation stay separate. Begin with a
                named Draft for this Course.
              </p>
              <Input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder={`${selectedCourse?.name ?? "Course"} Curriculum`}
                required
              />
              <Button
                type="submit"
                className="admin-lms-primary"
                disabled={
                  !currentCourseId || !draftTitle.trim() || pending === "draft"
                }
              >
                <Plus />
                Create Draft
              </Button>
            </form>
          ) : (
            <>
              {curriculum.modules.map((module) => (
                <section key={module._id} className="admin-lms-module">
                  <h3>{module.title}</h3>
                  {curriculum.activities
                    .filter((item) => item.moduleId === module._id)
                    .map((activity) => {
                      const questions =
                        curriculum.quizQuestions?.filter(
                          (question) => question.activityId === activity._id,
                        ) ?? [];
                      const feedbackReport = curriculum.feedbackReports?.find(
                        (report) => report.activityId === activity._id,
                      );
                      return (
                        <div className="admin-lms-activity" key={activity._id}>
                          <div className="admin-lms-activity-summary">
                            <span>{activity.type.replaceAll("_", " ")}</span>
                            <strong>{activity.title}</strong>
                            <small>
                              {activity.required ? "Required" : "Optional"}
                              {activity.type === "quiz"
                                ? ` · Pass at ${activity.passingScore ?? 100}%`
                                : activity.type === "feedback"
                                  ? ` · ${activity.feedbackMode === "anonymous" ? "Anonymous" : "Identified"}`
                                  : activity.rightsApproved
                                    ? " · Rights approved"
                                    : ""}
                            </small>
                          </div>
                          {activity.type === "assignment" &&
                            activity.gradingCriteria && (
                              <div className="admin-lms-assignment-criteria">
                                <strong>Faculty review criteria</strong>
                                <p>{activity.gradingCriteria}</p>
                              </div>
                            )}
                          {activity.type === "quiz" && (
                            <div className="admin-lms-quiz-bank">
                              <div className="admin-lms-quiz-head">
                                <strong>Quiz questions</strong>
                                <span>
                                  {questions.length} question
                                  {questions.length === 1 ? "" : "s"}
                                </span>
                              </div>
                              {questions.map((question, index) => (
                                <div
                                  className="admin-lms-quiz-question"
                                  key={question._id}
                                >
                                  <span>{index + 1}</span>
                                  <div>
                                    <strong>{question.prompt}</strong>
                                    <small>
                                      {question.options.length} options · one
                                      correct answer
                                    </small>
                                  </div>
                                </div>
                              ))}
                              {isDraft && (
                                <QuizQuestionEditor
                                  activityId={activity._id}
                                  onSave={(prompt, options) =>
                                    addQuizQuestion({
                                      activityId: activity._id,
                                      prompt,
                                      options,
                                    })
                                  }
                                />
                              )}
                            </div>
                          )}
                          {activity.type === "feedback" && feedbackReport && (
                            <FeedbackReport report={feedbackReport} />
                          )}
                        </div>
                      );
                    })}
                </section>
              ))}
              {isDraft && activeModuleId && (
                <form
                  className="admin-lms-activity-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void act(
                      "activity",
                      async () => {
                        await addActivity({
                          moduleId: activeModuleId as Id<"lmsModules">,
                          type: activityType,
                          title: activityTitle,
                          instructions: instructions || undefined,
                          gradingCriteria:
                            activityType === "assignment"
                              ? gradingCriteria
                              : undefined,
                          content: content || undefined,
                          externalUrl: externalUrl || undefined,
                          durationMinutes: duration
                            ? Number(duration)
                            : undefined,
                          required: true,
                          releaseMode: "immediate",
                          completionMode:
                            activityType === "assignment"
                              ? "submit"
                              : activityType === "quiz"
                                ? "pass"
                                : activityType === "feedback"
                                  ? "submit"
                                  : "self_confirm",
                          passingScore:
                            activityType === "quiz"
                              ? Number(passingScore)
                              : undefined,
                          feedbackMode:
                            activityType === "feedback"
                              ? feedbackMode
                              : undefined,
                          feedbackMinimumGroupSize:
                            activityType === "feedback" &&
                            feedbackMode === "anonymous"
                              ? Number(feedbackMinimumGroupSize)
                              : undefined,
                          rightsApproved:
                            activityType === "reading" ||
                            activityType === "quiz" ||
                            activityType === "assignment" ||
                            rightsApproved,
                          accessibleAlternative:
                            accessibleAlternative || undefined,
                        });
                        setActivityTitle("");
                        setInstructions("");
                        setGradingCriteria("");
                        setContent("");
                        setExternalUrl("");
                        setAccessibleAlternative("");
                        setRightsApproved(false);
                        setDuration("");
                        setFeedbackMode("anonymous");
                        setFeedbackMinimumGroupSize("5");
                      },
                      "Activity added to the Draft.",
                    );
                  }}
                >
                  <h3>Add activity</h3>
                  <div className="admin-lms-form-grid">
                    <label>
                      Type
                      <select
                        value={activityType}
                        onChange={(event) =>
                          setActivityType(
                            event.target.value as StudentLmsActivity["type"],
                          )
                        }
                      >
                        {activityTypes.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Duration in minutes
                      <Input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                      />
                    </label>
                  </div>
                  {activityType === "quiz" && (
                    <label>
                      Passing score (%)
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={passingScore}
                        onChange={(event) =>
                          setPassingScore(event.target.value)
                        }
                        required
                      />
                    </label>
                  )}
                  {activityType === "feedback" && (
                    <fieldset className="admin-lms-feedback-settings">
                      <legend>Response privacy</legend>
                      <label>
                        <input
                          type="radio"
                          name="feedback-mode"
                          checked={feedbackMode === "anonymous"}
                          onChange={() => setFeedbackMode("anonymous")}
                        />
                        <span>
                          <strong>Anonymous</strong>
                          <small>
                            Responses carry no Student or Enrollment reference.
                          </small>
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="feedback-mode"
                          checked={feedbackMode === "identified"}
                          onChange={() => setFeedbackMode("identified")}
                        />
                        <span>
                          <strong>Identified</strong>
                          <small>
                            Course staff can connect responses to Enrollments.
                          </small>
                        </span>
                      </label>
                      {feedbackMode === "anonymous" && (
                        <label className="admin-lms-feedback-threshold">
                          Minimum reporting group
                          <Input
                            type="number"
                            min="3"
                            max="50"
                            value={feedbackMinimumGroupSize}
                            onChange={(event) =>
                              setFeedbackMinimumGroupSize(event.target.value)
                            }
                            required
                          />
                          <small>
                            Ratings and comments remain hidden until this many
                            responses exist.
                          </small>
                        </label>
                      )}
                    </fieldset>
                  )}
                  <label>
                    Title
                    <Input
                      value={activityTitle}
                      onChange={(event) => setActivityTitle(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Student instructions
                    <Textarea
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                    />
                  </label>
                  {activityType === "assignment" && (
                    <label>
                      Faculty review criteria
                      <Textarea
                        value={gradingCriteria}
                        onChange={(event) =>
                          setGradingCriteria(event.target.value)
                        }
                        placeholder="Describe the evidence Faculty must see before accepting this work."
                        required
                      />
                      <small>
                        Students see these criteria before submitting; Faculty
                        use the same criteria during review.
                      </small>
                    </label>
                  )}
                  <label>
                    Learning content
                    <Textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                    />
                  </label>
                  {(activityType === "media" ||
                    activityType === "external_resource") && (
                    <>
                      <label>
                        HTTPS resource URL
                        <Input
                          type="url"
                          value={externalUrl}
                          onChange={(event) =>
                            setExternalUrl(event.target.value)
                          }
                          placeholder="https://"
                          required
                        />
                      </label>
                      <label className="admin-lms-check">
                        <input
                          type="checkbox"
                          checked={rightsApproved}
                          onChange={(event) =>
                            setRightsApproved(event.target.checked)
                          }
                        />
                        Rights for this exact resource and Student use have been
                        approved
                      </label>
                    </>
                  )}
                  {activityType === "media" && (
                    <label>
                      Accessible alternative
                      <Textarea
                        value={accessibleAlternative}
                        onChange={(event) =>
                          setAccessibleAlternative(event.target.value)
                        }
                        required
                      />
                    </label>
                  )}
                  <Button
                    type="submit"
                    className="admin-lms-primary"
                    disabled={
                      !activityTitle.trim() ||
                      (activityType === "assignment" &&
                        gradingCriteria.trim().length < 10) ||
                      pending === "activity" ||
                      ((activityType === "media" ||
                        activityType === "external_resource") &&
                        !rightsApproved) ||
                      (activityType === "feedback" &&
                        feedbackMode === "anonymous" &&
                        (Number(feedbackMinimumGroupSize) < 3 ||
                          Number(feedbackMinimumGroupSize) > 50))
                    }
                  >
                    <Plus />
                    Add activity
                  </Button>
                </form>
              )}
            </>
          )}
        </main>
        <aside className="admin-lms-readiness">
          <section id="publication-readiness">
            <h2>Publication readiness</h2>
            {blockers.length ? (
              blockers.map((blocker) => (
                <p key={blocker} className="admin-lms-blocker">
                  <CircleAlert />
                  {blocker}
                </p>
              ))
            ) : (
              <p className="admin-lms-ready">
                <CheckCircle2 />
                Automated gates are clear.
              </p>
            )}
            {isDraft &&
              (manifestOpen ? (
                <Button asChild variant="outline">
                  <a href="#publish-manifest">
                    <ClipboardCheck />
                    Return to manifest
                  </a>
                </Button>
              ) : (
                <Button
                  className="admin-lms-primary"
                  disabled={blockers.length > 0}
                  onClick={() => {
                    setManifestOpen(true);
                    requestAnimationFrame(() =>
                      document
                        .getElementById("publish-manifest")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        }),
                    );
                  }}
                >
                  <ClipboardCheck />
                  Review publish manifest
                </Button>
              ))}
          </section>
          <section id="enrollment-activation">
            <h2>Enrollment activation</h2>
            <p>{awaiting.length} active Enrollments await an LMS Curriculum.</p>
            {awaiting.slice(0, 8).map((item) => (
              <div className="admin-lms-enrollment" key={item.enrollmentId}>
                <span>
                  <strong>{item.studentName}</strong>
                  <small>
                    {item.enrollmentNumber}
                    {item.batchLabel ? ` · ${item.batchLabel}` : ""}
                  </small>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    !published[0] || pending === `activate-${item.enrollmentId}`
                  }
                  onClick={() =>
                    published[0] &&
                    act(
                      `activate-${item.enrollmentId}`,
                      () =>
                        activate({
                          enrollmentId: item.enrollmentId,
                          curriculumId: published[0].curriculumId,
                        }),
                      `${item.studentName}'s LMS access is active.`,
                    )
                  }
                >
                  <GraduationCap />
                  Activate
                </Button>
              </div>
            ))}
          </section>
          <section>
            <h2>Assign Faculty</h2>
            <p>
              Add the name and email they use to sign in. Their review access
              activates only after they confirm that account in the Faculty
              workspace.
            </p>
            <div className="admin-lms-faculty-form">
              <label>
                Faculty name
                <Input
                  value={facultyName}
                  onChange={(event) => setFacultyName(event.target.value)}
                  placeholder="Dr. Ananya Rao"
                  autoComplete="name"
                />
              </label>
              <label>
                Sign-in email
                <Input
                  type="email"
                  value={facultyEmail}
                  onChange={(event) => setFacultyEmail(event.target.value)}
                  placeholder="faculty@example.com"
                  autoComplete="email"
                />
              </label>
            </div>
            <Button
              className="admin-lms-primary"
              disabled={
                !currentCourseId ||
                !facultyName.trim() ||
                !facultyEmail.trim() ||
                pending === "faculty"
              }
              onClick={() =>
                act(
                  "faculty",
                  async () => {
                    await assignFaculty({
                      courseId: currentCourseId as Id<"courses">,
                      facultyName,
                      facultyEmail,
                      canGrade: true,
                      canAnswerQuestions: true,
                      canApproveCompletion: true,
                    });
                    setFacultyName("");
                    setFacultyEmail("");
                  },
                  "Faculty access prepared. Ask them to open the Faculty workspace and confirm their signed-in account.",
                )
              }
            >
              <Users />
              Prepare Faculty access
            </Button>
            {courseFaculty.length > 0 && (
              <div className="admin-lms-faculty-list">
                {courseFaculty.map((assignment) => (
                  <div key={assignment.assignmentId}>
                    <span>
                      <strong>
                        {assignment.facultyName ?? "Assigned Faculty"}
                      </strong>
                      <small>
                        {assignment.facultyEmail ??
                          "Existing secure assignment"}
                      </small>
                    </span>
                    <span
                      className={`admin-lms-faculty-status ${assignment.invitationStatus}`}
                    >
                      {assignment.invitationStatus === "active"
                        ? "Access active"
                        : "Awaiting sign-in"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function FeedbackReport({
  report,
}: {
  report: AdminCurriculum["feedbackReports"][number];
}) {
  return (
    <section className="admin-lms-feedback-report">
      <div className="admin-lms-feedback-report-head">
        <strong>Feedback responses</strong>
        <span>
          {report.responseCount} response
          {report.responseCount === 1 ? "" : "s"}
        </span>
      </div>
      {!report.released ? (
        <p className="admin-lms-feedback-held">
          <ShieldCheck />
          Anonymous results remain sealed until {report.minimumGroupSize}
          responses are available.
        </p>
      ) : (
        <>
          <p className="admin-lms-feedback-average">
            <strong>{report.averageRating?.toFixed(1) ?? "—"}</strong>
            <span>average usefulness rating out of 5</span>
          </p>
          {report.identifiedResponses.map((response, index) => (
            <blockquote key={`${response.submittedAt}-${index}`}>
              <strong>{response.studentName}</strong>
              <span>{response.rating} / 5</span>
              {response.comment && <p>{response.comment}</p>}
            </blockquote>
          ))}
          {report.comments.map((comment, index) => (
            <blockquote key={`${index}-${comment}`}>
              <strong>Anonymous Student</strong>
              <p>{comment}</p>
            </blockquote>
          ))}
          {report.responseCount === 0 && (
            <p className="admin-lms-feedback-empty">
              No responses have arrived yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function QuizQuestionEditor({
  activityId,
  onSave,
}: {
  activityId: Id<"lmsActivities">;
  onSave: (
    prompt: string,
    options: Array<{ label: string; isCorrect: boolean }>,
  ) => Promise<unknown>;
}) {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string>();

  return (
    <form
      className="admin-lms-quiz-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setNotice(undefined);
        try {
          await onSave(
            prompt,
            options.map((label, index) => ({
              label,
              isCorrect: index === correctIndex,
            })),
          );
          setPrompt("");
          setOptions(["", "", "", ""]);
          setCorrectIndex(0);
          setNotice("Question added to the Draft.");
        } catch (error) {
          setNotice(message(error));
        } finally {
          setPending(false);
        }
      }}
    >
      <h4>Add a question</h4>
      <label>
        Question
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask one clear knowledge-check question"
          required
        />
      </label>
      <fieldset>
        <legend>Answer options · select the correct answer</legend>
        {options.map((option, index) => (
          <label key={`${activityId}-option-${index}`}>
            <input
              type="radio"
              name={`correct-${activityId}`}
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
              aria-label={`Mark option ${index + 1} correct`}
            />
            <Input
              value={option}
              onChange={(event) =>
                setOptions((current) =>
                  current.map((item, optionIndex) =>
                    optionIndex === index ? event.target.value : item,
                  ),
                )
              }
              placeholder={`Option ${index + 1}`}
              required
            />
          </label>
        ))}
      </fieldset>
      <Button
        type="submit"
        variant="outline"
        disabled={
          pending || !prompt.trim() || options.some((option) => !option.trim())
        }
      >
        <Plus /> {pending ? "Adding…" : "Add question"}
      </Button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
}

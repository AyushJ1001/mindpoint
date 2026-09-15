"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminLmsApi, type StudentLmsActivity } from "@/lib/lms-api";
import type { Id } from "@/convex/_generated/dataModel";
import "./admin-lms.css";

const activityTypes: Array<{
  value: StudentLmsActivity["type"];
  label: string;
}> = [
  { value: "reading", label: "Reading" },
  { value: "media", label: "Media" },
  { value: "external_resource", label: "External resource" },
  { value: "assignment", label: "Assignment" },
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
  const [content, setContent] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [accessibleAlternative, setAccessibleAlternative] = useState("");
  const [rightsApproved, setRightsApproved] = useState(false);
  const [duration, setDuration] = useState("");
  const [facultyToken, setFacultyToken] = useState("");
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
      ].filter(Boolean) as string[]);

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
      <section className="admin-lms-coursebar">
        <label>
          Course
          <select
            value={currentCourseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setCurriculumId("");
              setModuleId("");
            }}
          >
            <option value="">Choose a Course</option>
            {desk.courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.name} · {course.code}
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
      </section>
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
        <main className="admin-lms-author">
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
                    .map((activity) => (
                      <div key={activity._id}>
                        <span>{activity.type.replaceAll("_", " ")}</span>
                        <strong>{activity.title}</strong>
                        <small>
                          {activity.required ? "Required" : "Optional"}
                          {activity.rightsApproved ? " · Rights approved" : ""}
                        </small>
                      </div>
                    ))}
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
                              : "self_confirm",
                          rightsApproved:
                            activityType === "reading" ||
                            activityType === "assignment" ||
                            rightsApproved,
                          accessibleAlternative:
                            accessibleAlternative || undefined,
                        });
                        setActivityTitle("");
                        setInstructions("");
                        setContent("");
                        setExternalUrl("");
                        setAccessibleAlternative("");
                        setRightsApproved(false);
                        setDuration("");
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
                      pending === "activity" ||
                      ((activityType === "media" ||
                        activityType === "external_resource") &&
                        !rightsApproved)
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
          <section>
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
            {isDraft && (
              <Button
                className="admin-lms-primary"
                disabled={blockers.length > 0 || pending === "publish"}
                onClick={() =>
                  currentCurriculumId &&
                  act(
                    "publish",
                    () =>
                      publish({
                        curriculumId: currentCurriculumId as Id<"lmsCurricula">,
                      }),
                    "Curriculum published. Enrollments remain unchanged until activation.",
                  )
                }
              >
                <ShieldCheck />
                Publish immutable version
              </Button>
            )}
          </section>
          <section>
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
              Paste the Faculty member’s full Convex token identifier.
              Course-wide scope includes every batch.
            </p>
            <Input
              value={facultyToken}
              onChange={(event) => setFacultyToken(event.target.value)}
              placeholder="issuer|clerk-user-id"
            />
            <Button
              className="admin-lms-primary"
              disabled={
                !currentCourseId ||
                !facultyToken.trim() ||
                pending === "faculty"
              }
              onClick={() =>
                act(
                  "faculty",
                  async () => {
                    await assignFaculty({
                      courseId: currentCourseId as Id<"courses">,
                      facultyTokenIdentifier: facultyToken,
                      canGrade: true,
                      canAnswerQuestions: true,
                      canApproveCompletion: true,
                    });
                    setFacultyToken("");
                  },
                  "Faculty Course scope assigned.",
                )
              }
            >
              <Users />
              Assign review scope
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

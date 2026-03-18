"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Doc, Id } from "@mindpoint/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { getUserFacingErrorMessage } from "@/lib/convex-error";

type CourseLifecycleStatus = "draft" | "published" | "archived";
type CourseType =
  | "certificate"
  | "internship"
  | "diploma"
  | "pre-recorded"
  | "masterclass"
  | "therapy"
  | "supervised"
  | "resume-studio"
  | "worksheet";

type LearningOutcomeInput = {
  icon: string;
  title: string;
};

type AllocationInput = {
  topic: string;
  hours: string;
};

type ModuleInput = {
  title: string;
  description: string;
};

type SessionVariantInput = {
  sessions: string;
  code: string;
  price: string;
  capacity: string;
};

type CourseFormState = {
  name: string;
  description: string;
  type: CourseType;
  code: string;
  price: number;
  capacity: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  content: string;
  duration: string;
  sessions: string;
  prerequisites: string;
  imageUrls: string[];
  learningOutcomes: LearningOutcomeInput[];
  allocation: AllocationInput[];
  modules: ModuleInput[];
  sessionVariants: SessionVariantInput[];
  fileUrl: string;
  worksheetDescription: string;
  targetAudience: string;
  lifecycleStatus: CourseLifecycleStatus;
  offerName: string;
  offerDiscount: string;
  offerStartDate: string;
  offerEndDate: string;
  bogoEnabled: boolean;
  bogoLabel: string;
  bogoStartDate: string;
  bogoEndDate: string;
};

type OfferCampaignRecord = {
  _id: Id<"offerCampaigns">;
  name: string;
  description?: string;
  offer?: {
    name: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
  };
  bogo?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    label?: string;
  };
  isArchived: boolean;
};

const courseTypes: CourseType[] = [
  "certificate",
  "internship",
  "diploma",
  "pre-recorded",
  "masterclass",
  "therapy",
  "supervised",
  "resume-studio",
  "worksheet",
];

const courseTypeLabels: Record<CourseType, string> = {
  certificate: "Certificate",
  internship: "Internship",
  diploma: "Diploma",
  "pre-recorded": "Pre-recorded",
  masterclass: "Masterclass",
  therapy: "Therapy",
  supervised: "Supervised",
  "resume-studio": "Resume Studio",
  worksheet: "Worksheet",
};

const learningOutcomeTypes = new Set<CourseType>([
  "certificate",
  "internship",
  "diploma",
  "pre-recorded",
  "masterclass",
  "resume-studio",
]);

const sessionTypes = new Set<CourseType>(["therapy", "supervised"]);
const moduleTypes = new Set<CourseType>([
  "certificate",
  "diploma",
  "pre-recorded",
  "masterclass",
  "resume-studio",
]);
const scheduleTypes = new Set<CourseType>([
  "certificate",
  "internship",
  "diploma",
  "masterclass",
  "resume-studio",
]);
const durationTypes = new Set<CourseType>([
  "certificate",
  "internship",
  "diploma",
  "masterclass",
  "resume-studio",
]);
const prerequisiteTypes = new Set<CourseType>([
  "certificate",
  "internship",
  "diploma",
  "masterclass",
  "resume-studio",
]);

function defaultSessionVariants(): SessionVariantInput[] {
  return [
    { sessions: "1", code: "", price: "", capacity: "1" },
    { sessions: "3", code: "", price: "", capacity: "1" },
    { sessions: "6", code: "", price: "", capacity: "1" },
  ];
}

function hasText(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function toInitialState(course?: Doc<"courses">): CourseFormState {
  const type = (course?.type as CourseType) || "certificate";
  const defaultVariants =
    sessionTypes.has(type) && !course
      ? defaultSessionVariants()
      : course && sessionTypes.has(type)
        ? [
            {
              sessions: course.sessions ? String(course.sessions) : "",
              code: course.code || "",
              price: String(course.price ?? ""),
              capacity: String(course.capacity ?? 1),
            },
          ]
        : [];

  return {
    name: course?.name || "",
    description: course?.description || "",
    type,
    code: course?.code || "",
    price: course?.price ?? 0,
    capacity: course?.capacity ?? 1,
    startDate: course?.startDate || "",
    endDate: course?.endDate || "",
    startTime: course?.startTime || "",
    endTime: course?.endTime || "",
    daysOfWeek: (course?.daysOfWeek || []).join(", "),
    content: course?.content || "",
    duration: course?.duration || "",
    sessions: course?.sessions ? String(course.sessions) : "",
    prerequisites: course?.prerequisites || "",
    imageUrls: course?.imageUrls || [],
    learningOutcomes: (course?.learningOutcomes || []).map((item) => ({
      icon: item.icon || "",
      title: item.title || "",
    })),
    allocation: (course?.allocation || []).map((item) => ({
      topic: item.topic || "",
      hours: String(item.hours ?? ""),
    })),
    modules: (course?.modules || []).map((item) => ({
      title: item.title || "",
      description: item.description || "",
    })),
    sessionVariants: defaultVariants,
    fileUrl: course?.fileUrl || "",
    worksheetDescription: course?.worksheetDescription || "",
    targetAudience: (course?.targetAudience || []).join(", "),
    lifecycleStatus:
      (course?.lifecycleStatus as CourseLifecycleStatus | undefined) || "draft",
    offerName: course?.offer?.name || "",
    offerDiscount:
      course?.offer?.discount !== undefined
        ? String(course.offer.discount)
        : "",
    offerStartDate: course?.offer?.startDate || "",
    offerEndDate: course?.offer?.endDate || "",
    bogoEnabled: course?.bogo?.enabled || false,
    bogoLabel: course?.bogo?.label || "",
    bogoStartDate: course?.bogo?.startDate || "",
    bogoEndDate: course?.bogo?.endDate || "",
  };
}

export function CourseEditor({
  course,
  onSaved,
  onDirtyChange,
}: {
  course?: Doc<"courses">;
  onSaved?: (courseId: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [state, setState] = useState<CourseFormState>(() =>
    toInitialState(course),
  );
  const [initialSnapshot, setInitialSnapshot] = useState(() =>
    JSON.stringify(toInitialState(course)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const courseVersion = course
    ? `${course._id}:${course.updatedAt ?? course._creationTime}`
    : "new";

  const campaigns = useQuery(api.adminOffers.listCampaigns, {
    includeArchived: false,
    limit: 100,
  }) as OfferCampaignRecord[] | undefined;

  const createCourse = useMutation(api.adminCourses.createCourse);
  const deleteCourse = useMutation(api.adminCourses.deleteCourse);
  const updateCourse = useMutation(api.adminCourses.updateCourse);

  useEffect(() => {
    const nextInitialState = toInitialState(course);
    setState(nextInitialState);
    setInitialSnapshot(JSON.stringify(nextInitialState));
    setSelectedCampaignId("");
  }, [course, courseVersion]);

  const isWorksheet = state.type === "worksheet";
  const isInternship = state.type === "internship";
  const usesSessions = sessionTypes.has(state.type);
  const supportsLearningOutcomes = learningOutcomeTypes.has(state.type);
  const supportsModules = moduleTypes.has(state.type);
  const supportsDuration = durationTypes.has(state.type);
  const supportsPrerequisites = prerequisiteTypes.has(state.type);
  const showSchedule = scheduleTypes.has(state.type);
  const isSessionBatchCreate = !course && usesSessions;

  const parsedDays = useMemo(
    () =>
      state.daysOfWeek
        .split(",")
        .map((day) => day.trim())
        .filter(Boolean),
    [state.daysOfWeek],
  );

  const parsedTargetAudience = useMemo(
    () =>
      state.targetAudience
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [state.targetAudience],
  );

  const parsedLearningOutcomes = useMemo(
    () =>
      state.learningOutcomes
        .map((item) => ({
          icon: item.icon.trim(),
          title: item.title.trim(),
        }))
        .filter((item) => item.title.length > 0),
    [state.learningOutcomes],
  );

  const parsedAllocation = useMemo(
    () =>
      state.allocation
        .map((item) => ({
          topic: item.topic.trim(),
          hours: Number(item.hours),
        }))
        .filter(
          (item) =>
            item.topic.length > 0 &&
            Number.isFinite(item.hours) &&
            item.hours > 0,
        ),
    [state.allocation],
  );

  const parsedModules = useMemo(
    () =>
      state.modules
        .map((item) => ({
          title: item.title.trim(),
          description: item.description.trim(),
        }))
        .filter((item) => item.title.length > 0 && item.description.length > 0),
    [state.modules],
  );

  const selectedCampaign = useMemo(
    () =>
      (campaigns || []).find(
        (campaign) => String(campaign._id) === selectedCampaignId,
      ),
    [campaigns, selectedCampaignId],
  );

  const isDirty = useMemo(
    () => JSON.stringify(state) !== initialSnapshot,
    [initialSnapshot, state],
  );
  const saveStateLabel = !course
    ? "New draft"
    : isDirty
      ? "Unsaved changes"
      : "All changes saved";
  const saveStateDescription = !course
    ? "Fill out the form and save to create this course."
    : isDirty
      ? "Save the course before using Publish, Move to Draft, or Archive."
      : "Lifecycle actions use the last saved version of this course.";

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateLearningOutcome = (
    index: number,
    key: keyof LearningOutcomeInput,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateAllocation = (
    index: number,
    key: keyof AllocationInput,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      allocation: prev.allocation.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateModule = (
    index: number,
    key: keyof ModuleInput,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateSessionVariant = (
    index: number,
    key: keyof SessionVariantInput,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      sessionVariants: prev.sessionVariants.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addLearningOutcome = () => {
    setState((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, { icon: "", title: "" }],
    }));
  };

  const addAllocation = () => {
    setState((prev) => ({
      ...prev,
      allocation: [...prev.allocation, { topic: "", hours: "" }],
    }));
  };

  const addModule = () => {
    setState((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", description: "" }],
    }));
  };

  const addSessionVariant = () => {
    setState((prev) => ({
      ...prev,
      sessionVariants: [
        ...prev.sessionVariants,
        { sessions: "", code: "", price: "", capacity: "1" },
      ],
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setState((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index),
    }));
  };

  const removeAllocation = (index: number) => {
    setState((prev) => ({
      ...prev,
      allocation: prev.allocation.filter((_, i) => i !== index),
    }));
  };

  const removeModule = (index: number) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const removeSessionVariant = (index: number) => {
    setState((prev) => ({
      ...prev,
      sessionVariants: prev.sessionVariants.filter((_, i) => i !== index),
    }));
  };

  const applyCampaignToForm = () => {
    if (!selectedCampaign) {
      toast.error("Select a saved campaign first");
      return;
    }

    setState((prev) => ({
      ...prev,
      offerName: selectedCampaign.offer?.name || "",
      offerDiscount:
        selectedCampaign.offer?.discount !== undefined
          ? String(selectedCampaign.offer.discount)
          : "",
      offerStartDate: selectedCampaign.offer?.startDate || "",
      offerEndDate: selectedCampaign.offer?.endDate || "",
      bogoEnabled: selectedCampaign.bogo?.enabled ?? false,
      bogoLabel: selectedCampaign.bogo?.label || "",
      bogoStartDate: selectedCampaign.bogo?.startDate || "",
      bogoEndDate: selectedCampaign.bogo?.endDate || "",
    }));
    toast.success(`Loaded campaign "${selectedCampaign.name}" into the form`);
  };

  const buildPatch = (overrides?: {
    code?: string;
    price?: number;
    capacity?: number;
    sessions?: number;
  }) => {
    const offer =
      state.offerName.trim() !== ""
        ? {
            name: state.offerName,
            discount:
              state.offerDiscount.trim() !== ""
                ? Number(state.offerDiscount)
                : undefined,
            startDate: state.offerStartDate || undefined,
            endDate: state.offerEndDate || undefined,
          }
        : null;

    const bogo = state.bogoEnabled
      ? {
          enabled: true,
          label: state.bogoLabel || undefined,
          startDate: state.bogoStartDate || undefined,
          endDate: state.bogoEndDate || undefined,
        }
      : null;

    return {
      name: state.name,
      description: state.description || undefined,
      type: state.type,
      code: overrides?.code ?? state.code,
      price: overrides?.price ?? Number(state.price),
      capacity: overrides?.capacity ?? Number(state.capacity),
      startDate: showSchedule ? state.startDate || undefined : undefined,
      endDate: showSchedule ? state.endDate || undefined : undefined,
      startTime: showSchedule ? state.startTime || undefined : undefined,
      endTime: showSchedule ? state.endTime || undefined : undefined,
      daysOfWeek: showSchedule ? parsedDays : undefined,
      content: state.content,
      duration: supportsDuration ? state.duration || undefined : undefined,
      sessions:
        overrides?.sessions ??
        (usesSessions && state.sessions.trim()
          ? Number(state.sessions)
          : undefined),
      prerequisites: supportsPrerequisites
        ? state.prerequisites || undefined
        : undefined,
      imageUrls: state.imageUrls.length > 0 ? state.imageUrls : undefined,
      learningOutcomes:
        supportsLearningOutcomes && parsedLearningOutcomes.length > 0
          ? parsedLearningOutcomes
          : undefined,
      allocation:
        isInternship && parsedAllocation.length > 0
          ? parsedAllocation
          : undefined,
      modules:
        supportsModules && parsedModules.length > 0 ? parsedModules : undefined,
      fileUrl: isWorksheet ? state.fileUrl || undefined : undefined,
      worksheetDescription: isWorksheet
        ? state.worksheetDescription || undefined
        : undefined,
      targetAudience:
        isWorksheet && parsedTargetAudience.length > 0
          ? parsedTargetAudience
          : undefined,
      lifecycleStatus: state.lifecycleStatus,
      offer,
      bogo,
    };
  };

  const validateForPublish = () => {
    if (state.lifecycleStatus !== "published") return;

    if (!hasText(state.description)) {
      throw new Error("Description is required before publishing");
    }
    if (!hasText(state.content)) {
      throw new Error("Content is required before publishing");
    }

    if (supportsLearningOutcomes && parsedLearningOutcomes.length === 0) {
      throw new Error("Add at least one learning outcome before publishing");
    }

    if (showSchedule) {
      if (
        !hasText(state.startDate) ||
        !hasText(state.endDate) ||
        !hasText(state.startTime) ||
        !hasText(state.endTime) ||
        parsedDays.length === 0
      ) {
        throw new Error(
          "Start/end date, time, and days of week are required for this course type",
        );
      }
    }

    if (state.type === "internship") {
      if (!hasText(state.duration)) {
        throw new Error("Duration is required for internship courses");
      }
      if (parsedAllocation.length === 0) {
        throw new Error("Add at least one internship allocation item");
      }
    }

    if (usesSessions && !isSessionBatchCreate && !hasText(state.sessions)) {
      throw new Error("Sessions are required for this course type");
    }

    if (isWorksheet) {
      if (!hasText(state.fileUrl)) {
        throw new Error("Worksheet file is required before publishing");
      }
      if (!hasText(state.worksheetDescription)) {
        throw new Error("Worksheet description is required before publishing");
      }
      if (parsedTargetAudience.length === 0) {
        throw new Error("Target audience is required before publishing");
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      validateForPublish();

      if (isSessionBatchCreate) {
        if (state.sessionVariants.length === 0) {
          throw new Error("Add at least one session variant");
        }

        const parsedVariants = state.sessionVariants.map((variant, index) => ({
          index,
          sessions: Number(variant.sessions),
          code: variant.code.trim(),
          price: Number(variant.price),
          capacity: Number(variant.capacity),
        }));

        for (const variant of parsedVariants) {
          if (
            !Number.isFinite(variant.sessions) ||
            variant.sessions <= 0 ||
            !hasText(variant.code) ||
            !Number.isFinite(variant.price) ||
            variant.price < 0 ||
            !Number.isFinite(variant.capacity) ||
            variant.capacity <= 0
          ) {
            throw new Error(
              `Variant row ${variant.index + 1} must include valid sessions, code, price, and capacity`,
            );
          }
        }

        const createdIds: Id<"courses">[] = [];

        try {
          for (const variant of parsedVariants) {
            const courseId = await createCourse({
              name: state.name,
              type: state.type,
              lifecycleStatus: state.lifecycleStatus,
              data: buildPatch({
                code: variant.code,
                price: variant.price,
                capacity: variant.capacity,
                sessions: variant.sessions,
              }),
            });
            createdIds.push(courseId);
          }
        } catch (error) {
          const rollbackResults = await Promise.allSettled(
            createdIds.map((courseId) => deleteCourse({ courseId })),
          );
          const rollbackFailures = rollbackResults.filter(
            (result) => result.status === "rejected",
          ).length;

          if (rollbackFailures > 0) {
            console.error("Failed to fully roll back course variants", {
              rollbackFailures,
              createdIds,
            });
          }

          throw error;
        }

        toast.success(`Created ${createdIds.length} course variants`);
        if (createdIds[0]) {
          onSaved?.(createdIds[0]);
        }
        return;
      }

      const patch = buildPatch();

      if (course?._id) {
        await updateCourse({
          courseId: course._id,
          patch,
        });
        setInitialSnapshot(JSON.stringify(state));
        toast.success("Course updated");
        onSaved?.(course._id);
      } else {
        const courseId = await createCourse({
          name: state.name,
          type: state.type,
          lifecycleStatus: state.lifecycleStatus,
          data: patch,
        });
        setInitialSnapshot(JSON.stringify(state));
        toast.success("Course created");
        onSaved?.(courseId);
      }
    } catch (error) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, "Failed to save course"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-20 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  !course
                    ? "border-sky-300 bg-sky-50 text-sky-800"
                    : isDirty
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800"
                }
              >
                {saveStateLabel}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{saveStateDescription}</p>
          </div>
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || (!!course && !isDirty)}
          >
            {isSaving ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label>Course Name</Label>
          <Input
            value={state.name}
            onChange={(e) =>
              setState((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Lifecycle</Label>
          <select
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            value={state.lifecycleStatus}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                lifecycleStatus: e.target.value as CourseLifecycleStatus,
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <select
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            value={state.type}
            onChange={(e) => {
              const nextType = e.target.value as CourseType;
              setState((prev) => ({
                ...prev,
                type: nextType,
                sessionVariants:
                  !course && sessionTypes.has(nextType)
                    ? prev.sessionVariants.length > 0
                      ? prev.sessionVariants
                      : defaultSessionVariants()
                    : prev.sessionVariants,
              }));
            }}
          >
            {courseTypes.map((type) => (
              <option key={type} value={type}>
                {courseTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {!isSessionBatchCreate ? (
          <>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={state.code}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, code: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={state.price}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    price: Number(e.target.value || 0),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={state.capacity}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    capacity: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
          </>
        ) : (
          <div className="space-y-2 md:col-span-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              You are creating multiple session variants for this
              therapy/supervised course. Set sessions, code, price, and capacity
              per row.
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={state.description}
          onChange={(e) =>
            setState((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Content (Markdown/Text)</Label>
        <Textarea
          rows={8}
          value={state.content}
          onChange={(e) =>
            setState((prev) => ({ ...prev, content: e.target.value }))
          }
        />
      </div>

      {showSchedule ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={state.startDate}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={state.endDate}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={state.startTime}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={state.endTime}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Days of Week (comma separated)</Label>
              <Input
                value={state.daysOfWeek}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, daysOfWeek: e.target.value }))
                }
              />
            </div>

            {supportsDuration ? (
              <div className="space-y-2">
                <Label>
                  {isInternship ? "Duration (Required)" : "Duration"}
                </Label>
                <Input
                  value={state.duration}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, duration: e.target.value }))
                  }
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {usesSessions && !isSessionBatchCreate ? (
        <div className="space-y-2">
          <Label>Sessions</Label>
          <Input
            type="number"
            min={1}
            value={state.sessions}
            onChange={(e) =>
              setState((prev) => ({ ...prev, sessions: e.target.value }))
            }
          />
        </div>
      ) : null}

      {isSessionBatchCreate ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Session Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSessionVariant}
            >
              Add Variant
            </Button>
          </div>

          {state.sessionVariants.length === 0 ? (
            <p className="text-sm text-slate-600">No variants added yet.</p>
          ) : (
            <div className="space-y-3">
              {state.sessionVariants.map((variant, index) => (
                <div
                  key={`session-variant-${index}`}
                  className="grid gap-2 md:grid-cols-[120px_1fr_160px_140px_auto]"
                >
                  <Input
                    type="number"
                    min={1}
                    placeholder="Sessions"
                    value={variant.sessions}
                    onChange={(e) =>
                      updateSessionVariant(index, "sessions", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Code"
                    value={variant.code}
                    onChange={(e) =>
                      updateSessionVariant(index, "code", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) =>
                      updateSessionVariant(index, "price", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Capacity"
                    value={variant.capacity}
                    onChange={(e) =>
                      updateSessionVariant(index, "capacity", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSessionVariant(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {supportsPrerequisites ? (
        <div className="space-y-2">
          <Label>Prerequisites</Label>
          <Input
            value={state.prerequisites}
            onChange={(e) =>
              setState((prev) => ({ ...prev, prerequisites: e.target.value }))
            }
          />
        </div>
      ) : null}

      {supportsLearningOutcomes ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Learning Outcomes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLearningOutcome}
            >
              Add Outcome
            </Button>
          </div>

          {state.learningOutcomes.length === 0 ? (
            <p className="text-sm text-slate-600">No outcomes added yet.</p>
          ) : (
            <div className="space-y-3">
              {state.learningOutcomes.map((item, index) => (
                <div
                  key={`outcome-${index}`}
                  className="grid gap-2 md:grid-cols-[140px_1fr_auto]"
                >
                  <Input
                    placeholder="Icon (emoji/text)"
                    value={item.icon}
                    onChange={(e) =>
                      updateLearningOutcome(index, "icon", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Outcome title"
                    value={item.title}
                    onChange={(e) =>
                      updateLearningOutcome(index, "title", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLearningOutcome(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {isInternship ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Hourly Allocation</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAllocation}
            >
              Add Allocation
            </Button>
          </div>

          {state.allocation.length === 0 ? (
            <p className="text-sm text-slate-600">
              No allocation rows added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {state.allocation.map((item, index) => (
                <div
                  key={`allocation-${index}`}
                  className="grid gap-2 md:grid-cols-[1fr_160px_auto]"
                >
                  <Input
                    placeholder="Topic"
                    value={item.topic}
                    onChange={(e) =>
                      updateAllocation(index, "topic", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Hours"
                    value={item.hours}
                    onChange={(e) =>
                      updateAllocation(index, "hours", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAllocation(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {supportsModules ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Modules (Optional)</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addModule}
            >
              Add Module
            </Button>
          </div>

          {state.modules.length === 0 ? (
            <p className="text-sm text-slate-600">No modules added yet.</p>
          ) : (
            <div className="space-y-3">
              {state.modules.map((item, index) => (
                <div
                  key={`module-${index}`}
                  className="space-y-2 rounded-md border p-3"
                >
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder="Module title"
                      value={item.title}
                      onChange={(e) =>
                        updateModule(index, "title", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModule(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Module description"
                    value={item.description}
                    onChange={(e) =>
                      updateModule(index, "description", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-3 rounded-lg border bg-white p-4">
        <h3 className="font-medium">Course Images</h3>

        <UploadDropzone
          endpoint="courseImageUploader"
          onClientUploadComplete={(files) => {
            setState((prev) => ({
              ...prev,
              imageUrls: [
                ...prev.imageUrls,
                ...files.map((file) => file.ufsUrl),
              ],
            }));
            toast.success("Images uploaded");
          }}
          onUploadError={(error: Error) => {
            toast.error(error.message);
          }}
          appearance={{
            container:
              "border-dashed border-slate-300 bg-slate-50 ut-label:text-slate-700",
          }}
        />

        {state.imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {state.imageUrls.map((url) => (
              <Badge
                key={url}
                variant="outline"
                className="max-w-full truncate"
              >
                {url}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {isWorksheet ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <h3 className="font-medium">Worksheet PDF</h3>

          <UploadDropzone
            endpoint="worksheetPdfUploader"
            onClientUploadComplete={(files) => {
              const first = files[0];
              if (!first) return;
              setState((prev) => ({ ...prev, fileUrl: first.ufsUrl }));
              toast.success("Worksheet uploaded");
            }}
            onUploadError={(error: Error) => {
              toast.error(error.message);
            }}
            appearance={{
              container:
                "border-dashed border-slate-300 bg-slate-50 ut-label:text-slate-700",
            }}
          />

          <div className="space-y-2">
            <Label>Worksheet File URL</Label>
            <Input
              value={state.fileUrl}
              onChange={(e) =>
                setState((prev) => ({ ...prev, fileUrl: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Worksheet Description</Label>
            <Textarea
              rows={3}
              value={state.worksheetDescription}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  worksheetDescription: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience (comma separated)</Label>
            <Input
              value={state.targetAudience}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  targetAudience: e.target.value,
                }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 md:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Saved Offer Campaign</Label>
              <select
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                <option value="">Select a saved campaign</option>
                {(campaigns || []).map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedCampaign}
              onClick={applyCampaignToForm}
            >
              Apply Campaign To Course
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Load any saved campaign into this course, then save the course. You
            can still edit the offer or BOGO fields below before saving.
          </p>
          {selectedCampaign?.description ? (
            <p className="text-sm text-slate-500">
              {selectedCampaign.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 rounded-lg border bg-white p-4">
          <h3 className="font-medium">Offer</h3>
          <Input
            placeholder="Offer Name"
            value={state.offerName}
            onChange={(e) =>
              setState((prev) => ({ ...prev, offerName: e.target.value }))
            }
          />
          <Input
            placeholder="Discount %"
            type="number"
            value={state.offerDiscount}
            onChange={(e) =>
              setState((prev) => ({ ...prev, offerDiscount: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={state.offerStartDate}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  offerStartDate: e.target.value,
                }))
              }
            />
            <Input
              type="date"
              value={state.offerEndDate}
              onChange={(e) =>
                setState((prev) => ({ ...prev, offerEndDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg border bg-white p-4">
          <h3 className="font-medium">BOGO</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.bogoEnabled}
              onChange={(e) =>
                setState((prev) => ({ ...prev, bogoEnabled: e.target.checked }))
              }
            />
            Enable BOGO campaign
          </label>
          <Input
            placeholder="BOGO Label"
            value={state.bogoLabel}
            onChange={(e) =>
              setState((prev) => ({ ...prev, bogoLabel: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={state.bogoStartDate}
              onChange={(e) =>
                setState((prev) => ({ ...prev, bogoStartDate: e.target.value }))
              }
            />
            <Input
              type="date"
              value={state.bogoEndDate}
              onChange={(e) =>
                setState((prev) => ({ ...prev, bogoEndDate: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => void handleSave()}
          disabled={isSaving || (!!course && !isDirty)}
        >
          {isSaving ? "Saving..." : "Save Course"}
        </Button>
      </div>
    </div>
  );
}

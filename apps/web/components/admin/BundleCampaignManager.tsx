"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDateWindow } from "@/lib/admin-timezone";
import { showRupees } from "@/lib/utils";

type CourseTypeFilter =
  | "all"
  | "certificate"
  | "internship"
  | "diploma"
  | "pre-recorded"
  | "masterclass"
  | "therapy"
  | "supervised"
  | "resume-studio"
  | "worksheet";

type BundleCampaignRecord = {
  _id: Id<"bundleCampaigns">;
  name: string;
  description?: string;
  flatFee: number;
  requiredCourseCountMin: number;
  requiredCourseCountMax: number;
  eligibleCourseIds: Id<"courses">[];
  priority: number;
  enabled: boolean;
  isArchived: boolean;
  startDate?: string;
  endDate?: string;
  updatedAt: number;
};

const courseTypeOptions: CourseTypeFilter[] = [
  "all",
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

export function BundleCampaignManager() {
  const [search, setSearch] = useState("");
  const [courseType, setCourseType] = useState<CourseTypeFilter>("all");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [flatFee, setFlatFee] = useState("");
  const [priority, setPriority] = useState("100");
  const [enabled, setEnabled] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [requiredCourseCountMin, setRequiredCourseCountMin] = useState("1");
  const [requiredCourseCountMax, setRequiredCourseCountMax] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [campaignActionId, setCampaignActionId] = useState<string | null>(null);
  const { formatDate, formatTimestamp } = useAdminTimeZone();

  const courses = useQuery(api.adminCourses.listCourses, {
    search: search || undefined,
    type: courseType === "all" ? undefined : courseType,
    limit: 500,
    sortBy: "updatedAt",
  });
  const campaigns = useQuery(api.adminBundles.listBundleCampaigns, {
    search: campaignSearch || undefined,
    includeArchived,
    limit: 100,
  });

  const saveBundleCampaign = useMutation(api.adminBundles.saveBundleCampaign);
  const setBundleCampaignArchived = useMutation(
    api.adminBundles.setBundleCampaignArchived,
  );
  const setBundleCampaignEnabled = useMutation(
    api.adminBundles.setBundleCampaignEnabled,
  );

  const rows = useMemo(() => courses ?? [], [courses]);
  const campaignRows = useMemo(() => campaigns ?? [], [campaigns]);
  const selectedCount = selectedCourseIds.length;
  const selectedIdSet = useMemo(
    () => new Set(selectedCourseIds),
    [selectedCourseIds],
  );
  const allVisibleSelected =
    rows.length > 0 &&
    rows.every((course) => selectedIdSet.has(String(course._id)));
  const schedulePreview = formatDateWindow(startDate, endDate, formatDate);

  const resetBuilder = () => {
    setActiveCampaignId(null);
    setCampaignName("");
    setCampaignDescription("");
    setFlatFee("");
    setPriority("100");
    setEnabled(true);
    setStartDate("");
    setEndDate("");
    setRequiredCourseCountMin("1");
    setRequiredCourseCountMax("1");
    setSelectedCourseIds([]);
  };

  const loadCampaign = (campaign: BundleCampaignRecord) => {
    setActiveCampaignId(String(campaign._id));
    setCampaignName(campaign.name);
    setCampaignDescription(campaign.description || "");
    setFlatFee(String(campaign.flatFee));
    setPriority(String(campaign.priority));
    setEnabled(campaign.enabled);
    setStartDate(campaign.startDate || "");
    setEndDate(campaign.endDate || "");
    setRequiredCourseCountMin(String(campaign.requiredCourseCountMin));
    setRequiredCourseCountMax(String(campaign.requiredCourseCountMax));
    setSelectedCourseIds(campaign.eligibleCourseIds.map((courseId) => String(courseId)));
  };

  const toggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((prev) =>
      checked
        ? Array.from(new Set([...prev, courseId]))
        : prev.filter((id) => id !== courseId),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedCourseIds((prev) => {
      if (checked) {
        return Array.from(
          new Set([...prev, ...rows.map((course) => String(course._id))]),
        );
      }

      const visibleIds = new Set(rows.map((course) => String(course._id)));
      return prev.filter((id) => !visibleIds.has(id));
    });
  };

  const saveCampaign = async (mode: "create" | "update") => {
    if (mode === "update" && !activeCampaignId) {
      toast.error("Load a saved campaign before updating it");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveBundleCampaign({
        campaignId:
          mode === "update" && activeCampaignId
            ? (activeCampaignId as Id<"bundleCampaigns">)
            : undefined,
        name: campaignName,
        description: campaignDescription || undefined,
        flatFee: Number(flatFee),
        priority: Number(priority),
        enabled,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        requiredCourseCountMin: Number(requiredCourseCountMin),
        requiredCourseCountMax: Number(requiredCourseCountMax),
        eligibleCourseIds: selectedCourseIds as Id<"courses">[],
      });

      if (!result) {
        throw new Error("Campaign could not be reloaded after saving");
      }

      loadCampaign(result);
      toast.success(mode === "create" ? "Bundle campaign saved" : "Bundle campaign updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save bundle campaign",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArchived = async (campaignId: string, isArchived: boolean) => {
    setCampaignActionId(campaignId);
    try {
      await setBundleCampaignArchived({
        campaignId: campaignId as Id<"bundleCampaigns">,
        isArchived,
      });
      toast.success(isArchived ? "Bundle campaign archived" : "Bundle campaign restored");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update bundle campaign",
      );
    } finally {
      setCampaignActionId(null);
    }
  };

  const toggleEnabled = async (campaignId: string, nextEnabled: boolean) => {
    setCampaignActionId(campaignId);
    try {
      await setBundleCampaignEnabled({
        campaignId: campaignId as Id<"bundleCampaigns">,
        enabled: nextEnabled,
      });
      toast.success(nextEnabled ? "Bundle campaign enabled" : "Bundle campaign disabled");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update bundle campaign",
      );
    } finally {
      setCampaignActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bundle Campaigns"
        description="Configure flat-fee bundles across explicit course selections."
        actions={
          <Button variant="outline" onClick={resetBuilder}>
            New Bundle Draft
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Saved Bundle Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Search bundle campaign name or notes"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <Checkbox
                  id="include-archived-bundle-campaigns"
                  checked={includeArchived}
                  onCheckedChange={(checked) =>
                    setIncludeArchived(checked === true)
                  }
                />
                <Label htmlFor="include-archived-bundle-campaigns">
                  Show archived campaigns
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              {!campaigns ? (
                <p className="text-sm text-slate-600">
                  Loading bundle campaigns...
                </p>
              ) : campaignRows.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No bundle campaigns found.
                </p>
              ) : (
                campaignRows.map((campaign) => {
                  const campaignId = String(campaign._id);
                  const isBusy = campaignActionId === campaignId;
                  const isLoaded = activeCampaignId === campaignId;
                  return (
                    <div
                      key={campaign._id}
                      className={`rounded-2xl border p-4 ${
                        isLoaded
                          ? "border-blue-300 bg-blue-50/70"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium break-words text-slate-900">
                            {campaign.name}
                          </p>
                          <Badge
                            variant={campaign.enabled ? "default" : "secondary"}
                          >
                            {campaign.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Badge
                            variant={campaign.isArchived ? "outline" : "secondary"}
                          >
                            {campaign.isArchived ? "Archived" : "Live"}
                          </Badge>
                        </div>
                        {campaign.description ? (
                          <p className="text-xs leading-5 break-words text-slate-600">
                            {campaign.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {showRupees(campaign.flatFee)}
                          </Badge>
                          <Badge variant="outline">
                            {campaign.requiredCourseCountMin ===
                            campaign.requiredCourseCountMax
                              ? `${campaign.requiredCourseCountMin} courses`
                              : `${campaign.requiredCourseCountMin}-${campaign.requiredCourseCountMax} courses`}
                          </Badge>
                          <Badge variant="outline">
                            {campaign.eligibleCourseIds.length} eligible
                          </Badge>
                          <Badge variant="outline">
                            Priority {campaign.priority}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-slate-500">
                          <p>
                            Schedule:{" "}
                            {formatDateWindow(
                              campaign.startDate ?? "",
                              campaign.endDate ?? "",
                              formatDate,
                            ) || "Always active when enabled"}
                          </p>
                          <p>Updated {formatTimestamp(campaign.updatedAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCampaign(campaign)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy || campaign.isArchived}
                            onClick={() =>
                              toggleEnabled(campaignId, !campaign.enabled)
                            }
                          >
                            {campaign.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              toggleArchived(campaignId, !campaign.isArchived)
                            }
                          >
                            {campaign.isArchived ? "Restore" : "Archive"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              {activeCampaignId ? "Bundle Builder" : "New Bundle Builder"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Eligible courses selected: <strong>{selectedCount}</strong>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="Campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Internal Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Optional notes for the admin team"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                <Label>Flat Fee</Label>
                <Input
                  type="number"
                  min={1}
                  value={flatFee}
                  onChange={(e) => setFlatFee(e.target.value)}
                  placeholder="7000"
                />
                <Label>Priority</Label>
                <Input
                  type="number"
                  step={1}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <Checkbox
                    id="bundle-enabled"
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(checked === true)}
                  />
                  <Label htmlFor="bundle-enabled">Enable campaign</Label>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                <Label>Required Course Count</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    min={1}
                    value={requiredCourseCountMin}
                    onChange={(e) => setRequiredCourseCountMin(e.target.value)}
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={requiredCourseCountMax}
                    onChange={(e) => setRequiredCourseCountMax(e.target.value)}
                    placeholder="Max"
                  />
                </div>
                <Label>Schedule</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {schedulePreview ? (
                  <p className="text-xs text-slate-500">
                    Active window: {schedulePreview}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Active whenever the campaign is enabled.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={isSaving} onClick={() => saveCampaign("create")}>
                Save New
              </Button>
              <Button
                variant="outline"
                disabled={isSaving || !activeCampaignId}
                onClick={() => saveCampaign("update")}
              >
                Update Loaded
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Course Targeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.3fr_220px_220px]">
            <Input
              placeholder="Search courses, type, code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={courseType}
              onChange={(e) =>
                setCourseType(e.target.value as CourseTypeFilter)
              }
            >
              {courseTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All course types" : type}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <Checkbox
                id="select-all-visible-bundle-courses"
                checked={allVisibleSelected}
                onCheckedChange={(checked) =>
                  toggleAllVisible(checked === true)
                }
              />
              <Label htmlFor="select-all-visible-bundle-courses">
                Select all visible
              </Label>
            </div>
          </div>

          <div className="grid gap-3">
            {!courses ? (
              <p className="text-sm text-slate-600">Loading courses...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-slate-600">
                No courses matched your filter.
              </p>
            ) : (
              rows.map((course) => {
                const courseId = String(course._id);
                const isSelected = selectedIdSet.has(courseId);

                return (
                  <div
                    key={course._id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isSelected
                        ? "border-blue-300 bg-blue-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              toggleCourse(courseId, checked === true)
                            }
                          />
                          <div className="min-w-0">
                            <p className="font-medium break-words text-slate-900">
                              {course.name}
                            </p>
                            <p className="text-xs break-words text-slate-600">
                              {course.type || "course"} • {course.code}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">
                          {showRupees(course.price)}
                        </span>
                        <span>
                          {(course.enrolledUsers || []).length}/
                          {course.capacity} seats
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

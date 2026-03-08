"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { isBogoActive, isDiscountActive, showRupees } from "@/lib/utils";

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

type CampaignRecord = {
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
  createdAt: number;
  updatedAt: number;
  createdByAdminId: string;
  updatedByAdminId: string;
  lastAppliedAt?: number;
  lastAppliedCourseIds?: Id<"courses">[];
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

const MAX_COURSES_PER_APPLY = 150;

export default function AdminOffersPage() {
  const [search, setSearch] = useState("");
  const [courseType, setCourseType] = useState<CourseTypeFilter>("all");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [offerName, setOfferName] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerEndDate, setOfferEndDate] = useState("");
  const [bogoEnabled, setBogoEnabled] = useState(false);
  const [bogoLabel, setBogoLabel] = useState("");
  const [bogoStartDate, setBogoStartDate] = useState("");
  const [bogoEndDate, setBogoEndDate] = useState("");
  const [builderApplyMode, setBuilderApplyMode] = useState<
    "discount" | "bogo" | "both"
  >("both");
  const [clearMode, setClearMode] = useState<"discount" | "bogo" | "all">(
    "all",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [campaignActionId, setCampaignActionId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const courses = useQuery(api.adminCourses.listCourses, {
    search: search || undefined,
    type: courseType === "all" ? undefined : courseType,
    limit: 500,
    sortBy: "updatedAt",
  });
  const campaigns = useQuery(api.adminOffers.listCampaigns, {
    search: campaignSearch || undefined,
    includeArchived,
    limit: 100,
  });

  const applyOffersToCourses = useMutation(
    api.adminOffers.applyOffersToCourses,
  );
  const applyCampaignToCourses = useMutation(
    api.adminOffers.applyCampaignToCourses,
  );
  const saveCampaign = useMutation(api.adminOffers.saveCampaign);
  const setCampaignArchived = useMutation(api.adminOffers.setCampaignArchived);

  const rows = useMemo(() => courses ?? [], [courses]);
  const campaignRows = useMemo(() => campaigns ?? [], [campaigns]);
  const selectedCount = selectedCourseIds.length;
  const exceedsApplyLimit = selectedCount > MAX_COURSES_PER_APPLY;
  const selectedIdSet = useMemo(
    () => new Set(selectedCourseIds),
    [selectedCourseIds],
  );
  const allVisibleSelected =
    rows.length > 0 &&
    rows.every((course) => selectedIdSet.has(String(course._id)));

  const resetBuilder = () => {
    setActiveCampaignId(null);
    setCampaignName("");
    setCampaignDescription("");
    setOfferName("");
    setOfferDiscount("");
    setOfferStartDate("");
    setOfferEndDate("");
    setBogoEnabled(false);
    setBogoLabel("");
    setBogoStartDate("");
    setBogoEndDate("");
  };

  const loadCampaignIntoBuilder = (campaign: CampaignRecord) => {
    setActiveCampaignId(String(campaign._id));
    setCampaignName(campaign.name);
    setCampaignDescription(campaign.description || "");
    setOfferName(campaign.offer?.name || "");
    setOfferDiscount(
      typeof campaign.offer?.discount === "number"
        ? String(campaign.offer.discount)
        : "",
    );
    setOfferStartDate(campaign.offer?.startDate || "");
    setOfferEndDate(campaign.offer?.endDate || "");
    setBogoEnabled(campaign.bogo?.enabled ?? false);
    setBogoLabel(campaign.bogo?.label || "");
    setBogoStartDate(campaign.bogo?.startDate || "");
    setBogoEndDate(campaign.bogo?.endDate || "");
  };

  const buildOfferPayload = () => {
    const discountValue =
      offerDiscount.trim() === "" ? undefined : Number(offerDiscount);
    if (
      offerDiscount.trim() !== "" &&
      (!Number.isFinite(discountValue) ||
        (discountValue !== undefined &&
          (discountValue < 0 || discountValue > 100)))
    ) {
      throw new Error("Discount must be a number between 0 and 100");
    }

    const offer =
      offerName.trim() !== ""
        ? {
            name: offerName.trim(),
            discount: discountValue,
            startDate: offerStartDate || undefined,
            endDate: offerEndDate || undefined,
          }
        : undefined;

    const bogo = bogoEnabled
      ? {
          enabled: true,
          label: bogoLabel.trim() || undefined,
          startDate: bogoStartDate || undefined,
          endDate: bogoEndDate || undefined,
        }
      : undefined;

    return { offer, bogo };
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

  const saveCurrentCampaign = async (mode: "create" | "update") => {
    const name = campaignName.trim();
    if (!name) {
      toast.error("Campaign name is required");
      return;
    }

    if (mode === "update" && !activeCampaignId) {
      toast.error("Load a saved campaign before updating it");
      return;
    }

    setIsSaving(true);
    try {
      const { offer, bogo } = buildOfferPayload();
      const result = await saveCampaign({
        campaignId:
          mode === "update" && activeCampaignId
            ? (activeCampaignId as Id<"offerCampaigns">)
            : undefined,
        name,
        description: campaignDescription.trim() || undefined,
        offer: offer ?? null,
        bogo: bogo ?? null,
      });

      if (!result) {
        throw new Error("Campaign could not be reloaded after saving");
      }

      loadCampaignIntoBuilder(result);
      toast.success(mode === "create" ? "Campaign saved" : "Campaign updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save campaign",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const applyBuilderToCourses = async () => {
    if (selectedCourseIds.length === 0) {
      toast.error("Select at least one course");
      return;
    }

    if (selectedCourseIds.length > MAX_COURSES_PER_APPLY) {
      toast.error(
        `Select ${MAX_COURSES_PER_APPLY} or fewer courses before applying offers`,
      );
      return;
    }

    setIsSaving(true);
    try {
      const { offer, bogo } = buildOfferPayload();
      const applyDiscount =
        builderApplyMode === "discount" || builderApplyMode === "both";
      const applyBogo =
        builderApplyMode === "bogo" || builderApplyMode === "both";

      if (applyDiscount && !offer) {
        throw new Error("Add a discount offer in the builder first");
      }
      if (applyBogo && !bogo) {
        throw new Error("Enable and configure the BOGO campaign first");
      }

      const result = await applyOffersToCourses({
        courseIds: selectedCourseIds as Id<"courses">[],
        offer: applyDiscount ? offer : undefined,
        bogo: applyBogo ? bogo : undefined,
      });
      toast.success(`Updated offers on ${result.updatedCount} course(s)`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update offers",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const applySavedCampaign = async (campaignId: string) => {
    if (selectedCourseIds.length === 0) {
      toast.error("Select at least one course");
      return;
    }

    if (selectedCourseIds.length > MAX_COURSES_PER_APPLY) {
      toast.error(
        `Select ${MAX_COURSES_PER_APPLY} or fewer courses before applying a campaign`,
      );
      return;
    }

    setCampaignActionId(campaignId);
    try {
      const result = await applyCampaignToCourses({
        campaignId: campaignId as Id<"offerCampaigns">,
        courseIds: selectedCourseIds as Id<"courses">[],
      });
      toast.success(`Applied campaign to ${result.updatedCount} course(s)`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to apply campaign",
      );
    } finally {
      setCampaignActionId(null);
    }
  };

  const clearOffers = async () => {
    if (selectedCourseIds.length === 0) {
      toast.error("Select at least one course");
      return false;
    }

    if (selectedCourseIds.length > MAX_COURSES_PER_APPLY) {
      toast.error(
        `Select ${MAX_COURSES_PER_APPLY} or fewer courses before clearing offers`,
      );
      return false;
    }

    setIsSaving(true);
    try {
      const result = await applyOffersToCourses({
        courseIds: selectedCourseIds as Id<"courses">[],
        offer:
          clearMode === "discount" || clearMode === "all" ? null : undefined,
        bogo: clearMode === "bogo" || clearMode === "all" ? null : undefined,
      });
      toast.success(`Cleared offers on ${result.updatedCount} course(s)`);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear offers",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmClearOffers = async () => {
    if (isSaving) {
      return;
    }

    const didClear = await clearOffers();
    if (didClear) {
      setShowClearConfirm(false);
    }
  };

  const toggleArchiveCampaign = async (
    campaignId: string,
    nextArchivedState: boolean,
  ) => {
    setCampaignActionId(campaignId);
    try {
      await setCampaignArchived({
        campaignId: campaignId as Id<"offerCampaigns">,
        isArchived: nextArchivedState,
      });
      toast.success(
        nextArchivedState ? "Campaign archived" : "Campaign restored",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update campaign",
      );
    } finally {
      setCampaignActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Offer Manager"
        description="Use a saved campaign or a simple draft, then apply it to selected courses."
        actions={
          <Button variant="outline" onClick={resetBuilder}>
            New Campaign Draft
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Saved Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Search campaign name or notes"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <Checkbox
                  id="include-archived-campaigns"
                  checked={includeArchived}
                  onCheckedChange={(checked) =>
                    setIncludeArchived(checked === true)
                  }
                />
                <Label htmlFor="include-archived-campaigns">
                  Show archived campaigns
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              {!campaigns ? (
                <p className="text-sm text-slate-600">Loading campaigns...</p>
              ) : campaignRows.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No saved campaigns found.
                </p>
              ) : (
                campaignRows.map((campaign) => {
                  const campaignId = String(campaign._id);
                  const isActiveDraft = activeCampaignId === campaignId;
                  const isBusy = campaignActionId === campaignId;

                  return (
                    <div
                      key={campaign._id}
                      className={`rounded-2xl border p-4 ${
                        isActiveDraft
                          ? "border-blue-300 bg-blue-50/70"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium break-words text-slate-900">
                            {campaign.name}
                          </p>
                          <Badge
                            variant={
                              campaign.isArchived ? "outline" : "default"
                            }
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
                          {campaign.offer ? (
                            <Badge variant="outline" className="max-w-full">
                              {campaign.offer.name}
                              {typeof campaign.offer.discount === "number"
                                ? ` • ${campaign.offer.discount}%`
                                : ""}
                            </Badge>
                          ) : null}
                          {campaign.bogo?.enabled ? (
                            <Badge variant="outline" className="max-w-full">
                              {campaign.bogo.label || "BOGO"}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="space-y-1 text-xs text-slate-500">
                          <p>
                            Updated{" "}
                            {new Date(campaign.updatedAt).toLocaleString()}
                          </p>
                          {campaign.lastAppliedAt ? (
                            <p>
                              Last applied{" "}
                              {new Date(
                                campaign.lastAppliedAt,
                              ).toLocaleString()}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCampaignIntoBuilder(campaign)}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            disabled={
                              campaign.isArchived || isBusy || exceedsApplyLimit
                            }
                            title={
                              exceedsApplyLimit
                                ? `Select ≤ ${MAX_COURSES_PER_APPLY} courses (currently ${selectedCount})`
                                : undefined
                            }
                            onClick={() => applySavedCampaign(campaignId)}
                          >
                            {isBusy ? "Applying..." : "Apply"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              toggleArchiveCampaign(
                                campaignId,
                                !campaign.isArchived,
                              )
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
              {activeCampaignId ? "Campaign Builder" : "New Campaign Builder"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Selected courses: <strong>{selectedCount}</strong>
              {exceedsApplyLimit ? (
                <span className="ml-2 text-rose-600">
                  Select {MAX_COURSES_PER_APPLY} or fewer to apply or clear
                  offers.
                </span>
              ) : null}
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
                <p className="text-sm font-medium text-slate-900">
                  Discount Offer
                </p>
                <Input
                  placeholder="Offer name"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Discount %"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={offerStartDate}
                    onChange={(e) => setOfferStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={offerEndDate}
                    onChange={(e) => setOfferEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="bogo-enabled"
                    checked={bogoEnabled}
                    onCheckedChange={(checked) =>
                      setBogoEnabled(checked === true)
                    }
                  />
                  <Label htmlFor="bogo-enabled">Enable BOGO campaign</Label>
                </div>
                <Input
                  placeholder="BOGO label"
                  value={bogoLabel}
                  onChange={(e) => setBogoLabel(e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={bogoStartDate}
                    onChange={(e) => setBogoStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={bogoEndDate}
                    onChange={(e) => setBogoEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={isSaving}
                onClick={() => saveCurrentCampaign("create")}
              >
                Save New
              </Button>
              <Button
                variant="outline"
                disabled={isSaving || !activeCampaignId}
                onClick={() => saveCurrentCampaign("update")}
              >
                Update Loaded
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm"
                value={builderApplyMode}
                onChange={(e) =>
                  setBuilderApplyMode(
                    e.target.value as "discount" | "bogo" | "both",
                  )
                }
              >
                <option value="both">Apply discount + BOGO</option>
                <option value="discount">Apply discount only</option>
                <option value="bogo">Apply BOGO only</option>
              </select>
              <Button
                disabled={isSaving || selectedCount === 0 || exceedsApplyLimit}
                title={
                  exceedsApplyLimit
                    ? `Select ≤ ${MAX_COURSES_PER_APPLY} courses (currently ${selectedCount})`
                    : undefined
                }
                onClick={applyBuilderToCourses}
              >
                Apply Builder To Selected
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm"
                value={clearMode}
                onChange={(e) =>
                  setClearMode(e.target.value as "discount" | "bogo" | "all")
                }
              >
                <option value="all">Clear all offers</option>
                <option value="discount">Clear discount only</option>
                <option value="bogo">Clear BOGO only</option>
              </select>
              <Button
                variant="destructive"
                disabled={isSaving || selectedCount === 0 || exceedsApplyLimit}
                title={
                  exceedsApplyLimit
                    ? `Select ≤ ${MAX_COURSES_PER_APPLY} courses (currently ${selectedCount})`
                    : undefined
                }
                onClick={() => setShowClearConfirm(true)}
              >
                Clear Selected Offers
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
              placeholder="Search courses, type, code, offer name"
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
                id="select-all-visible"
                checked={allVisibleSelected}
                onCheckedChange={(checked) =>
                  toggleAllVisible(checked === true)
                }
              />
              <Label htmlFor="select-all-visible">Select all visible</Label>
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
                const discountActive = isDiscountActive(course.offer);
                const bogoActive = isBogoActive(course.bogo);

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
                        <div className="mt-3 flex flex-wrap gap-2">
                          {course.offer ? (
                            <Badge
                              variant={discountActive ? "default" : "outline"}
                            >
                              {course.offer.name}
                              {typeof course.offer.discount === "number"
                                ? ` • ${course.offer.discount}%`
                                : ""}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No discount</Badge>
                          )}
                          {course.bogo?.enabled ? (
                            <Badge variant={bogoActive ? "default" : "outline"}>
                              {course.bogo.label || "BOGO"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No BOGO</Badge>
                          )}
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

      <AlertDialog
        open={showClearConfirm}
        onOpenChange={(open) => {
          if (!isSaving) {
            setShowClearConfirm(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear selected offers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear offers for all selected courses. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={confirmClearOffers}
            >
              {isSaving ? "Clearing..." : "Confirm Clear"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

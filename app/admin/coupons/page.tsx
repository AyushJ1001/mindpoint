"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { BadgePercent, Archive, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import {
  assertConvexSuccess,
  getUserFacingErrorMessage,
} from "@/lib/convex-error";
import { showRupees } from "@/lib/utils";

const courseTypes = [
  "certificate",
  "internship",
  "diploma",
  "pre-recorded",
  "masterclass",
  "therapy",
  "supervised",
  "resume-studio",
  "worksheet",
] as const;

type CourseType = (typeof courseTypes)[number];
type ScopeType = "cart" | "courses" | "courseTypes";
type RequirementType = "none" | "courses" | "courseTypes";
type DiscountType = "percentage" | "flat" | "free";

type CouponRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.adminCoupons.listCoupons>>
>[number];

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function selectorSummary(selector: CouponRow["appliesTo"]) {
  if (selector.type === "cart") return "Final cart";
  if (selector.type === "courseTypes") return selector.courseTypes.join(", ");
  return `${selector.courseIds.length} course(s)`;
}

function requirementSummary(requirement: CouponRow["requires"]) {
  if (requirement.type === "none") return "No prerequisite";
  if (requirement.type === "courseTypes")
    return `Requires ${requirement.courseTypes.join(", ")}`;
  return `Requires ${requirement.courseIds.length} course(s)`;
}

function discountSummary(discount: CouponRow["discount"]) {
  if (discount.type === "free") return "Free matching course";
  if (discount.type === "flat") return `${showRupees(discount.value)} off`;
  return `${discount.value}% off${
    discount.maxDiscount ? ` up to ${showRupees(discount.maxDiscount)}` : ""
  }`;
}

export default function AdminCouponsPage() {
  const [editingCouponId, setEditingCouponId] =
    useState<Id<"adminCoupons"> | null>(null);
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [scopeType, setScopeType] = useState<ScopeType>("cart");
  const [scopeCourseIds, setScopeCourseIds] = useState<Id<"courses">[]>([]);
  const [scopeCourseTypes, setScopeCourseTypes] = useState<CourseType[]>([]);
  const [requirementType, setRequirementType] =
    useState<RequirementType>("none");
  const [requiredCourseIds, setRequiredCourseIds] = useState<Id<"courses">[]>(
    [],
  );
  const [requiredCourseTypes, setRequiredCourseTypes] = useState<CourseType[]>(
    [],
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [redemptionLimit, setRedemptionLimit] = useState("");

  const coupons = useQuery(api.adminCoupons.listCoupons, {
    includeArchived,
    limit: 100,
    search: search.trim() || undefined,
  });
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const saveCoupon = useMutation(api.adminCoupons.saveCoupon);
  const setCouponArchived = useMutation(api.adminCoupons.setCouponArchived);

  const courseRows = useMemo(() => courses ?? [], [courses]);

  const resetForm = () => {
    setEditingCouponId(null);
    setCode("");
    setName("");
    setDescription("");
    setEnabled(true);
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscount("");
    setScopeType("cart");
    setScopeCourseIds([]);
    setScopeCourseTypes([]);
    setRequirementType("none");
    setRequiredCourseIds([]);
    setRequiredCourseTypes([]);
    setStartDate("");
    setEndDate("");
    setRedemptionLimit("");
  };

  const editCoupon = (coupon: CouponRow) => {
    setEditingCouponId(coupon._id);
    setCode(coupon.code);
    setName(coupon.name);
    setDescription(coupon.description ?? "");
    setEnabled(coupon.enabled);
    setDiscountType(coupon.discount.type);
    setDiscountValue(
      coupon.discount.type === "free" ? "" : String(coupon.discount.value),
    );
    setMaxDiscount(
      coupon.discount.type === "percentage" && coupon.discount.maxDiscount
        ? String(coupon.discount.maxDiscount)
        : "",
    );
    setScopeType(coupon.appliesTo.type);
    setScopeCourseIds(
      coupon.appliesTo.type === "courses" ? coupon.appliesTo.courseIds : [],
    );
    setScopeCourseTypes(
      coupon.appliesTo.type === "courseTypes"
        ? coupon.appliesTo.courseTypes
        : [],
    );
    setRequirementType(coupon.requires.type);
    setRequiredCourseIds(
      coupon.requires.type === "courses" ? coupon.requires.courseIds : [],
    );
    setRequiredCourseTypes(
      coupon.requires.type === "courseTypes" ? coupon.requires.courseTypes : [],
    );
    setStartDate(coupon.startDate ?? "");
    setEndDate(coupon.endDate ?? "");
    setRedemptionLimit(
      coupon.redemptionLimit ? String(coupon.redemptionLimit) : "",
    );
  };

  const buildPayload = () => {
    const discount =
      discountType === "free"
        ? ({ type: "free" } as const)
        : discountType === "flat"
          ? ({ type: "flat", value: Number(discountValue) } as const)
          : ({
              type: "percentage",
              value: Number(discountValue),
              ...(maxDiscount.trim()
                ? { maxDiscount: Number(maxDiscount) }
                : {}),
            } as const);

    const appliesTo =
      scopeType === "cart"
        ? ({ type: "cart" } as const)
        : scopeType === "courses"
          ? ({ type: "courses", courseIds: scopeCourseIds } as const)
          : ({ type: "courseTypes", courseTypes: scopeCourseTypes } as const);

    const requires =
      requirementType === "none"
        ? ({ type: "none" } as const)
        : requirementType === "courses"
          ? ({ type: "courses", courseIds: requiredCourseIds } as const)
          : ({
              type: "courseTypes",
              courseTypes: requiredCourseTypes,
            } as const);

    return {
      couponId: editingCouponId ?? undefined,
      code,
      name,
      description: description.trim() || undefined,
      enabled,
      discount,
      appliesTo,
      requires,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      redemptionLimit: redemptionLimit.trim()
        ? Number(redemptionLimit)
        : undefined,
    };
  };

  const handleSave = async () => {
    try {
      const result = await saveCoupon(buildPayload());
      assertConvexSuccess(result, "Failed to save coupon");
      toast.success(editingCouponId ? "Coupon updated" : "Coupon created");
      resetForm();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Failed to save coupon"));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Create shareable checkout codes with fixed targeting, prerequisites, and discount behavior."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search code, name, description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:max-w-sm"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(!!checked)}
              />
              Include archived
            </label>
          </div>

          <div className="space-y-3">
            {(coupons ?? []).map((coupon) => (
              <Card key={coupon._id} className="rounded-lg">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {coupon.code}
                        </span>
                        <Badge variant={coupon.enabled ? "default" : "outline"}>
                          {coupon.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {coupon.isArchived ? (
                          <Badge variant="secondary">Archived</Badge>
                        ) : null}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">
                          {coupon.name}
                        </h2>
                        {coupon.description ? (
                          <p className="text-sm text-slate-600">
                            {coupon.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <strong>Discount:</strong>{" "}
                          {discountSummary(coupon.discount)}
                        </p>
                        <p>
                          <strong>Applies to:</strong>{" "}
                          {selectorSummary(coupon.appliesTo)}
                        </p>
                        <p>
                          <strong>Requirement:</strong>{" "}
                          {requirementSummary(coupon.requires)}
                        </p>
                        <p>
                          <strong>Used:</strong> {coupon.totalRedemptions}
                          {coupon.redemptionLimit
                            ? ` / ${coupon.redemptionLimit}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editCoupon(coupon)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          const result = await setCouponArchived({
                            couponId: coupon._id,
                            isArchived: !coupon.isArchived,
                          });
                          assertConvexSuccess(
                            result,
                            "Failed to update coupon",
                          );
                        }}
                        title={coupon.isArchived ? "Restore" : "Archive"}
                      >
                        {coupon.isArchived ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {coupons && coupons.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                No coupons found.
              </div>
            ) : null}
          </div>
        </section>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgePercent className="h-4 w-4" />
              {editingCouponId ? "Edit Coupon" : "New Coupon"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                  id="coupon-code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.toUpperCase())
                  }
                  placeholder="SAVE500"
                />
              </div>
              <div>
                <Label htmlFor="coupon-name">Name</Label>
                <Input
                  id="coupon-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Summer offer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coupon-description">Description</Label>
              <Textarea
                id="coupon-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Internal notes"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="discount-type">Discount</Label>
                <select
                  id="discount-type"
                  className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                  value={discountType}
                  onChange={(event) =>
                    setDiscountType(event.target.value as DiscountType)
                  }
                >
                  <option value="percentage">Percent off</option>
                  <option value="flat">Flat off</option>
                  <option value="free">Free matching course</option>
                </select>
              </div>
              {discountType !== "free" ? (
                <div>
                  <Label htmlFor="discount-value">Value</Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                    placeholder={discountType === "flat" ? "500" : "20"}
                  />
                </div>
              ) : null}
              {discountType === "percentage" ? (
                <div>
                  <Label htmlFor="max-discount">Max off</Label>
                  <Input
                    id="max-discount"
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(event) => setMaxDiscount(event.target.value)}
                    placeholder="Optional"
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope-type">Applies To</Label>
              <select
                id="scope-type"
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                value={scopeType}
                onChange={(event) =>
                  setScopeType(event.target.value as ScopeType)
                }
              >
                <option value="cart">Final cart price</option>
                <option value="courses">Specific courses</option>
                <option value="courseTypes">Course types</option>
              </select>
              {scopeType === "courseTypes" ? (
                <div className="grid grid-cols-2 gap-2">
                  {courseTypes.map((courseType) => (
                    <label
                      key={courseType}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={scopeCourseTypes.includes(courseType)}
                        onCheckedChange={() =>
                          setScopeCourseTypes((values) =>
                            toggleValue(values, courseType),
                          )
                        }
                      />
                      {courseType}
                    </label>
                  ))}
                </div>
              ) : null}
              {scopeType === "courses" ? (
                <div className="max-h-44 space-y-2 overflow-auto rounded-md border p-2">
                  {courseRows.map((course) => (
                    <label
                      key={course._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={scopeCourseIds.some(
                          (courseId) => String(courseId) === String(course._id),
                        )}
                        onCheckedChange={() =>
                          setScopeCourseIds((values) =>
                            toggleValue(values, course._id),
                          )
                        }
                      />
                      <span className="truncate">{course.name}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirement-type">Requirement</Label>
              <select
                id="requirement-type"
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                value={requirementType}
                onChange={(event) =>
                  setRequirementType(event.target.value as RequirementType)
                }
              >
                <option value="none">No prerequisite</option>
                <option value="courses">Specific course in cart</option>
                <option value="courseTypes">Course type in cart</option>
              </select>
              {requirementType === "courseTypes" ? (
                <div className="grid grid-cols-2 gap-2">
                  {courseTypes.map((courseType) => (
                    <label
                      key={courseType}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={requiredCourseTypes.includes(courseType)}
                        onCheckedChange={() =>
                          setRequiredCourseTypes((values) =>
                            toggleValue(values, courseType),
                          )
                        }
                      />
                      {courseType}
                    </label>
                  ))}
                </div>
              ) : null}
              {requirementType === "courses" ? (
                <div className="max-h-44 space-y-2 overflow-auto rounded-md border p-2">
                  {courseRows.map((course) => (
                    <label
                      key={course._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={requiredCourseIds.some(
                          (courseId) => String(courseId) === String(course._id),
                        )}
                        onCheckedChange={() =>
                          setRequiredCourseIds((values) =>
                            toggleValue(values, course._id),
                          )
                        }
                      />
                      <span className="truncate">{course.name}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="start-date">Start</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="redemption-limit">Limit</Label>
                <Input
                  id="redemption-limit"
                  type="number"
                  min="1"
                  value={redemptionLimit}
                  onChange={(event) => setRedemptionLimit(event.target.value)}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={enabled}
                onCheckedChange={(checked) => setEnabled(!!checked)}
              />
              Enabled
            </label>

            <div className="flex gap-2">
              <Button type="button" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

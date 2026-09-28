import { CaseRoomPreview } from "@/components/course-page/case-room-preview";
import { CertificatePreview } from "@/components/course-page/certificate-preview";
import { CohortTimeline } from "@/components/course-page/cohort-timeline";
import { CourseHero } from "@/components/course-page/course-hero";
import { CurriculumTabs } from "@/components/course-page/curriculum-tabs";
import { FAQ } from "@/components/course-page/faq";
import { FacultySection } from "@/components/course-page/faculty-card";
import { FinalCTA } from "@/components/course-page/final-cta";
import { LearningJourney } from "@/components/course-page/learning-journey";
import { OptionCards } from "@/components/course-page/option-cards";
import { UpgradePanelLazy } from "@/components/course-page/upgrade-panel-lazy";
import { WaitlistSection } from "@/components/course-page/waitlist-section";
import { OutcomeGrid } from "@/components/course-page/outcome-grid";
import { PartComparison } from "@/components/course-page/part-comparison";
import { PricingCards } from "@/components/course-page/pricing-cards";
import { ProgrammeReviews } from "@/components/course-page/programme-reviews";
import { StickyCta } from "@/components/course-page/sticky-cta";
import {
  AssessmentSection,
  AudienceGroupsSection,
  HowItWorksSection,
  LearningMaterialsSection,
  ProgrammeClosing,
  ProgrammeHeroSection,
  ProgrammeOverviewSection,
} from "@/components/course-page/programme-sections";
import { WaterWave } from "@/components/course-page/section";
import {
  AudienceSection,
  Disclaimer,
  ShortProposition,
  Testimonials,
  WeeklyCommitment,
} from "@/components/course-page/supporting-sections";
import { ToolkitSection } from "@/components/course-page/toolkit-section";
import type { CourseContent } from "@/lib/course-content/types";
import {
  waitlistDeliveriesForType,
  type WaitlistCourseType,
} from "convex/_shared/waitlist";

function Wave() {
  return (
    <WaterWave className="mx-auto h-8 w-full max-w-4xl px-6 opacity-70 sm:h-10" />
  );
}

/** Only certificate and internship programmes carry an early-bird waitlist. */
function programmeWaitlistType(
  course: CourseContent,
): WaitlistCourseType | null {
  const category = course.category.toLowerCase();
  if (category.includes("internship")) return "internship";
  if (category.includes("certificate")) return "certificate";
  return null;
}

function programmeWaitlistBatches(course: CourseContent) {
  const seen = new Set<string>();
  const batches: { _id: string; label: string; startDate?: string }[] = [];
  for (const item of course.options?.items ?? []) {
    const batch = item.cart?.batch;
    if (!batch?.id || !batch.label || seen.has(batch.id)) continue;
    seen.add(batch.id);
    batches.push({
      _id: batch.id,
      label: batch.label,
      startDate: batch.startDate,
    });
  }
  return batches;
}

export function CoursePage({ course }: { course: CourseContent }) {
  const waitlistType = programmeWaitlistType(course);

  // Reviews belong to the live applied course this programme enrols into, which
  // the operational bind exposes as the applied option's cart target.
  const reviewCourseId =
    course.options?.items.find((item) => item.key === "applied")?.cart?._id ??
    course.options?.items.find((item) => item.cart?._id)?.cart?._id ??
    null;

  const optionPrices = (course.options?.items ?? [])
    .map((item) => item.price?.amount)
    .filter((p): p is number => typeof p === "number" && p > 0);
  const tierPrices = [
    course.pricing?.foundation?.price,
    course.pricing?.complete?.price,
  ].filter((p): p is number => typeof p === "number" && p > 0);
  const allPrices = [...optionPrices, ...tierPrices];
  const fromPrice = allPrices.length > 0 ? Math.min(...allPrices) : undefined;
  const stickyPrice =
    fromPrice !== undefined
      ? `From ₹${fromPrice.toLocaleString("en-IN")}`
      : undefined;
  const stickyCta = (
    <StickyCta
      href="#options"
      label={course.cta.primaryLabel || "Choose how you train"}
      priceLabel={stickyPrice}
      note={course.campaign ? "January 2027 cohort" : undefined}
    />
  );

  if (course.layout === "brief") {
    return (
      <div className="relative">
        {course.hero ? (
          <ProgrammeHeroSection hero={course.hero} fromPrice={fromPrice} />
        ) : null}
        {course.overview ? (
          <ProgrammeOverviewSection overview={course.overview} />
        ) : null}
        {course.audienceGroups ? (
          <AudienceGroupsSection groups={course.audienceGroups} />
        ) : null}
        <OutcomeGrid course={course} />
        <Wave />
        {course.curriculum ? (
          <CurriculumTabs curriculum={course.curriculum} />
        ) : null}
        {course.howItWorks ? (
          <HowItWorksSection
            title={course.howItWorks.title}
            steps={course.howItWorks.steps}
          />
        ) : null}
        {course.materials ? (
          <LearningMaterialsSection materials={course.materials} />
        ) : null}
        <Wave />
        {course.options ? <OptionCards options={course.options} /> : null}
        {course.upgrade ? (
          <UpgradePanelLazy
            upgrade={course.upgrade}
            fromCourseId={
              course.options?.items.find(
                (item) => item.key === course.upgrade?.fromKey,
              )?.cart?._id
            }
          />
        ) : null}
        {waitlistType ? (
          <WaitlistSection
            courseTitle={course.title}
            courseType={waitlistType}
            batches={programmeWaitlistBatches(course)}
            deliveries={waitlistDeliveriesForType(waitlistType)}
            source={`programme:${course.slug}`}
          />
        ) : null}
        {course.assessment ? (
          <AssessmentSection assessment={course.assessment} />
        ) : null}
        <ProgrammeReviews courseId={reviewCourseId} />
        <FAQ items={course.faq} />
        <Disclaimer course={course} />
        {course.closing ? (
          <ProgrammeClosing closing={course.closing} />
        ) : (
          <FinalCTA cta={course.cta} />
        )}
        {stickyCta}
      </div>
    );
  }

  return (
    <div className="relative">
      <CourseHero course={course} />
      <ShortProposition course={course} />
      <OutcomeGrid course={course} />
      <Wave />
      <LearningJourney />
      <PartComparison course={course} />
      <Wave />
      <CaseRoomPreview exercises={course.caseRoom} />
      <ToolkitSection items={course.toolkit} />
      <FacultySection faculty={course.faculty} />
      <WeeklyCommitment course={course} />
      <CertificatePreview course={course} />
      <AudienceSection course={course} />
      <PricingCards course={course} />
      <CohortTimeline course={course} />
      <Testimonials />
      <FAQ items={course.faq} />
      <Disclaimer course={course} />
      <FinalCTA cta={course.cta} />
      {stickyCta}
    </div>
  );
}

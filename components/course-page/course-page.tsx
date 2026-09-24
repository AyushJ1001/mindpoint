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
import { OutcomeGrid } from "@/components/course-page/outcome-grid";
import { PartComparison } from "@/components/course-page/part-comparison";
import { PricingCards } from "@/components/course-page/pricing-cards";
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

function Wave() {
  return (
    <WaterWave className="mx-auto h-8 w-full max-w-4xl px-6 opacity-70 sm:h-10" />
  );
}

export function CoursePage({ course }: { course: CourseContent }) {
  if (course.layout === "brief") {
    return (
      <div className="relative">
        {course.hero ? <ProgrammeHeroSection hero={course.hero} /> : null}
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
        {course.assessment ? (
          <AssessmentSection assessment={course.assessment} />
        ) : null}
        <FAQ items={course.faq} />
        <Disclaimer course={course} />
        {course.closing ? (
          <ProgrammeClosing closing={course.closing} />
        ) : (
          <FinalCTA cta={course.cta} />
        )}
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
    </div>
  );
}

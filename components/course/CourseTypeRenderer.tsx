import React from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import CertificateCourse from "./CertificateCourse";
import InternshipCourse from "./InternshipCourse";
import TherapyCourse from "./TherapyCourse";
import DiplomaCourse from "./DiplomaCourse";
import PreRecordedCourse from "./PreRecordedCourse";
import MasterclassCourse from "./MasterclassCourse";
import SupervisedCourse from "./SupervisedCourse";
import ResumeStudioCourse from "./ResumeStudioCourse";
import WhoShouldDo from "./who-should-do";
import WhyChoose from "./why-choose";
import Certification from "./certification";
import ReviewsSection from "./reviews-section";
import FAQSection from "./faq-section";
import CommunitiesSection from "./communities-section";

interface CourseTypeRendererProps {
  course: Doc<"courses">;
}

export default function CourseTypeRenderer({
  course,
}: CourseTypeRendererProps) {
  const courseType = course.type;

  // Render course type specific content
  const renderCourseTypeContent = () => {
    switch (courseType) {
      case "certificate":
        return <CertificateCourse course={course} />;
      case "internship":
        return <InternshipCourse course={course} />;
      case "therapy":
        return <TherapyCourse course={course} />;
      case "diploma":
        return <DiplomaCourse course={course} />;
      case "pre-recorded":
        return <PreRecordedCourse course={course} />;
      case "masterclass":
        return <MasterclassCourse course={course} />;
      case "supervised":
        return <SupervisedCourse course={course} />;
      case "resume-studio":
        return <ResumeStudioCourse course={course} />;
      default:
        // Fallback to certificate course for unknown types
        return <CertificateCourse course={course} />;
    }
  };

  // Render common sections based on course type
  const renderCommonSections = () => {
    // For therapy courses, skip the hero section and start directly with plan selection
    if (courseType === "therapy") {
      return (
        <>
          {/* Therapy courses start directly with plan selection */}
          {renderCourseTypeContent()}

          {/* Common sections for therapy */}
          <ReviewsSection />
          <FAQSection />
          <CommunitiesSection />
        </>
      );
    }

    // For all other course types, include all sections
    return (
      <>
        {/* Course type specific content */}
        {renderCourseTypeContent()}

        {/* Common sections for all course types except therapy */}
        <WhoShouldDo />
        <WhyChoose />
        <Certification />
        <ReviewsSection />
        <FAQSection />
        <CommunitiesSection />
      </>
    );
  };

  return <>{renderCommonSections()}</>;
}

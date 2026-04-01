import React from "react";
import type { PublicCourse } from "@mindpoint/backend";
import CertificateCourse from "./CertificateCourse";
import InternshipCourse from "./InternshipCourse";
import TherapyCourse from "./TherapyCourse";
import DiplomaCourse from "./DiplomaCourse";
import PreRecordedCourse from "./PreRecordedCourse";
import MasterclassCourse from "./MasterclassCourse";
import SupervisedCourse from "./SupervisedCourse";
import ResumeStudioCourse from "./ResumeStudioCourse";
import WorksheetCourse from "./WorksheetCourse";
import WhoShouldDo from "./who-should-do";
import WhyChoose from "./why-choose";
import Certification from "./certification";
import ReviewsSection from "./reviews-section";
import FAQSection from "./faq-section";
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";
import CommunitiesSection from "./communities-section";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import {
  whoShouldDoByType,
  whyChooseByType,
} from "@/lib/course-content-data";

interface CourseTypeRendererProps {
  course: PublicCourse;
  variants?: PublicCourse[];
  onVariantSelect?: (hours: 120 | 240) => void;
}

export default function CourseTypeRenderer({
  course,
  variants = [],
  onVariantSelect,
}: CourseTypeRendererProps) {
  const courseType = course.type || "certificate";

  // Render course type specific content
  const renderCourseTypeContent = () => {
    switch (courseType) {
      case "certificate":
        return <CertificateCourse course={course} />;
      case "internship":
        return (
          <InternshipCourse
            course={course}
            variants={variants}
            onVariantSelect={onVariantSelect}
          />
        );
      case "therapy":
        return <TherapyCourse course={course} variants={variants} />;
      case "diploma":
        return <DiplomaCourse course={course} />;
      case "pre-recorded":
        return <PreRecordedCourse course={course} />;
      case "masterclass":
        return <MasterclassCourse course={course} />;
      case "supervised":
        return <SupervisedCourse course={course} variants={variants} />;
      case "resume-studio":
        return <ResumeStudioCourse course={course} />;
      case "worksheet":
        return <WorksheetCourse course={course} />;
      default:
        // Fallback to certificate course for unknown types
        return <CertificateCourse course={course} />;
    }
  };

  // Render common sections based on course type
  const renderCommonSections = () => {
    // For worksheets, the WorksheetCourse component handles everything
    if (courseType === "worksheet") {
      return <>{renderCourseTypeContent()}</>;
    }

    const whoData = whoShouldDoByType[courseType];
    const whyData = whyChooseByType[courseType];

    // For therapy and supervised courses
    if (courseType === "therapy" || courseType === "supervised") {
      return (
        <>
          {renderCourseTypeContent()}
          {whoData && <WhoShouldDo {...whoData} />}
          {whyData && <WhyChoose {...whyData} />}
          <VideoTestimonialsSection />
          <ReviewsSection courseId={course._id} courseType={course.type} />
          {courseType === "supervised" ? (
            <SupervisedFAQSection />
          ) : (
            <TherapyFAQSection />
          )}
          <CommunitiesSection />
        </>
      );
    }

    // All other types
    return (
      <>
        {renderCourseTypeContent()}
        {whoData && <WhoShouldDo {...whoData} />}
        {whyData && <WhyChoose {...whyData} />}
        <Certification courseType={course.type} />
        <VideoTestimonialsSection />
        <ReviewsSection courseId={course._id} courseType={course.type} />
        <FAQSection />
        <CommunitiesSection />
      </>
    );
  };

  return <>{renderCommonSections()}</>;
}

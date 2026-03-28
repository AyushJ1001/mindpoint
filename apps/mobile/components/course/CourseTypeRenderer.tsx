import React from "react";
import { View } from "react-native";
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
import { WhoShouldDo } from "./who-should-do";
import { WhyChoose } from "./why-choose";
import { Certification } from "./certification";
import ReviewsSection from "./reviews-section";
import { FAQSection } from "./faq-section";
import { TherapyFAQSection } from "@/components/therapy/therapy-faq-section";
import { SupervisedFAQSection } from "@/components/therapy/supervised-faq-section";
import { CommunitiesSection } from "./communities-section";
import { TrustBar } from "./trust-bar";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";

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
  const courseType = course.type;

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
        return <CertificateCourse course={course} />;
    }
  };

  // Worksheet is self-contained
  if (courseType === "worksheet") {
    return <View>{renderCourseTypeContent()}</View>;
  }

  // Therapy and supervised have their own section ordering
  if (courseType === "therapy" || courseType === "supervised") {
    return (
      <View>
        {renderCourseTypeContent()}
        <VideoTestimonialsSection />
        <TrustBar />
        <ReviewsSection courseId={course._id} courseType={course.type} />
        {courseType === "supervised" ? (
          <SupervisedFAQSection />
        ) : (
          <TherapyFAQSection />
        )}
        <CommunitiesSection />
      </View>
    );
  }

  // All other course types
  return (
    <View>
      {renderCourseTypeContent()}
      <TrustBar />
      <WhoShouldDo />
      <WhyChoose />
      <Certification courseType={course.type} />
      <VideoTestimonialsSection />
      <ReviewsSection courseId={course._id} courseType={course.type} />
      <FAQSection />
      <CommunitiesSection />
    </View>
  );
}

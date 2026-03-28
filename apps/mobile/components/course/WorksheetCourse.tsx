import { View, Text, ScrollView } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { showRupees, getCoursePrice, getOfferDetails } from "@mindpoint/domain/pricing";
import { CourseImageCarousel } from "@/components/CourseImageCarousel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReviewsSection from "./reviews-section";
import { FileText, Download, CheckCircle } from "lucide-react-native";

interface WorksheetCourseProps {
  course: PublicCourse;
}

export default function WorksheetCourse({ course }: WorksheetCourseProps) {
  const price = getCoursePrice(course);
  const offerDetails = getOfferDetails(course);

  return (
    <View>
      {/* Hero with image */}
      <CourseImageCarousel imageUrls={course.imageUrls || []} height={200} />

      <View className="mt-4">
        <Badge variant="secondary" className="mb-2 self-start">
          <View className="flex-row items-center gap-1">
            <FileText size={12} color="#6b7280" />
            <Text className="text-xs font-semibold text-secondary-foreground">
              Worksheet
            </Text>
          </View>
        </Badge>

        <Text className="text-2xl font-bold text-foreground">
          {course.name}
        </Text>

        {/* Pricing */}
        <View className="mt-3 flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-foreground">
            {showRupees(price)}
          </Text>
          {offerDetails?.hasDiscount && (
            <Text className="text-sm text-muted-foreground line-through">
              {showRupees(offerDetails.originalPrice)}
            </Text>
          )}
        </View>

        {/* Description */}
        {(course.description || course.worksheetDescription) && (
          <Text className="mt-3 text-sm leading-6 text-muted-foreground">
            {course.worksheetDescription || course.description}
          </Text>
        )}

        {/* Target audience */}
        {course.targetAudience && course.targetAudience.length > 0 && (
          <View className="mt-4">
            <Text className="mb-2 text-base font-semibold text-foreground">
              Who Is This For?
            </Text>
            <View className="gap-2">
              {course.targetAudience.map((item, index) => (
                <View key={index} className="flex-row items-start gap-2">
                  <CheckCircle size={16} color="#059669" />
                  <Text className="flex-1 text-sm text-foreground">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Features */}
        <View className="mt-4 gap-3">
          <Card className="flex-row items-center gap-3">
            <Download size={20} color="#4338ca" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                Instant Download
              </Text>
              <Text className="text-xs text-muted-foreground">
                Get immediate access after purchase
              </Text>
            </View>
          </Card>
        </View>

        {/* Reviews */}
        <ReviewsSection courseId={course._id} courseType={course.type} />
      </View>
    </View>
  );
}

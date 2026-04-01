import { View, Text } from "react-native";
import {
  BookOpen,
  Clock,
  Award,
  Video,
  Calendar,
  MapPin,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Gift,
} from "lucide-react-native";
import type { PublicCourse } from "@mindpoint/backend";
import type { OfferDetails } from "@mindpoint/domain/pricing";
import {
  showRupees,
  getCoursePrice,
} from "@mindpoint/domain/pricing";
import { calculatePointsEarned } from "@mindpoint/domain/mind-points";
import { CourseImageCarousel } from "@/components/CourseImageCarousel";
import { TrustBar } from "@/components/course/trust-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function parseUTCDateOnly(dateStr: string): Date | null {
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = isoDate.exec(dateStr);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getOrdinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  if (rem10 === 1) return "st";
  if (rem10 === 2) return "nd";
  if (rem10 === 3) return "rd";
  return "th";
}

function formatDateCommon(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

interface CourseHeroProps {
  course: PublicCourse;
  offerDetails: OfferDetails | null;
  seatsLeft: number;
  isOutOfStock: boolean;
}

export function CourseHero({
  course,
  offerDetails,
  seatsLeft,
  isOutOfStock,
}: CourseHeroProps) {
  const displayPrice = getCoursePrice(course);

  const stats = [
    { Icon: BookOpen, label: "Study Material", value: "Included" },
    { Icon: Video, label: "Session Recordings", value: "Included" },
    {
      Icon: Clock,
      label:
        course.type === "pre-recorded" ? "Recording Duration" : "Duration",
      value:
        course.type === "pre-recorded"
          ? "3 months"
          : course.duration || "2 weeks",
    },
    { Icon: Award, label: "Certificate", value: "Included" },
  ];

  return (
    <View className="bg-background px-4 pb-6 pt-4">
      {/* Image Carousel */}
      <View className="overflow-hidden rounded-2xl border-2 border-primary/20">
        <CourseImageCarousel imageUrls={course.imageUrls ?? []} height={240} />
      </View>

      <TrustBar />

      {/* Status Badges */}
      <View className="mt-5 flex-row flex-wrap gap-2">
        {seatsLeft > 0 && seatsLeft <= 5 && (
          <Badge variant="destructive">
            <Text className="text-xs font-semibold text-white">
              Only {seatsLeft} seats left
            </Text>
          </Badge>
        )}
        {seatsLeft === 0 && (
          <Badge variant="secondary">
            <Text className="text-xs font-medium text-secondary-foreground">
              Waitlist Available
            </Text>
          </Badge>
        )}
        {offerDetails?.hasBogo && (
          <Badge className="bg-emerald-500">
            <Text className="text-xs font-semibold uppercase text-white">
              BOGO Bonus
            </Text>
          </Badge>
        )}
        <Badge variant="outline">
          <Text className="text-xs font-medium text-primary">
            {course.type ?? "Course"}
          </Text>
        </Badge>
      </View>

      {/* Course Title */}
      <Text className="mt-4 text-3xl font-bold tracking-tight text-primary">
        {course.name}
      </Text>
      <Text className="mt-2 text-base leading-relaxed text-muted-foreground">
        Guided, interactive classes with recordings and lifetime support.
      </Text>

      {/* Course Stats Grid */}
      <View className="mt-6 flex-row flex-wrap">
        {stats.map((stat, idx) => (
          <View key={idx} className="w-1/2 items-center pb-4">
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-[999px] bg-primary/10">
              <stat.Icon size={24} color="#5b7a5e" />
            </View>
            <Text className="text-center text-xs font-medium text-muted-foreground">
              {stat.label}
            </Text>
            <Text className="text-xs font-bold text-foreground">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Pricing Card */}
      <Card className="mt-2 border-2 border-primary/20">
        <CardContent>
          <View className="flex-row items-baseline gap-3">
            <Text className="text-3xl font-bold text-primary">
              {showRupees(displayPrice)}
            </Text>
            {offerDetails?.hasDiscount && (
              <Text className="text-sm text-muted-foreground line-through">
                {showRupees(offerDetails.originalPrice)}
              </Text>
            )}
          </View>
          <Text className="mt-1 text-sm text-muted-foreground">
            Inclusive of all taxes
            {offerDetails && offerDetails.offerName
              ? ` \u2022 ${offerDetails.offerName}`
              : ""}
          </Text>
          {offerDetails && (
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              {offerDetails.hasDiscount && (
                <Text className="text-xs font-medium text-orange-600">
                  {offerDetails.discountPercentage}% OFF
                </Text>
              )}
              <Text
                className={`text-xs font-medium ${offerDetails.hasBogo ? "text-emerald-600" : "text-orange-600"}`}
              >
                {offerDetails.timeLeft.days > 0 &&
                  `${offerDetails.timeLeft.days}d `}
                {offerDetails.timeLeft.hours > 0 &&
                  `${offerDetails.timeLeft.hours}h `}
                {offerDetails.timeLeft.minutes > 0 &&
                  `${offerDetails.timeLeft.minutes}m`}{" "}
                left
              </Text>
            </View>
          )}
          {offerDetails?.hasBogo && (
            <View className="mt-1 flex-row items-center gap-1">
              <Sparkles size={12} color="#059669" />
              <Text className="text-xs font-semibold text-emerald-600">
                {offerDetails.bogoLabel || "BOGO"}: Buy one, get one free
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Mind Points Banner */}
      <Card className="mt-4 border-primary/20 bg-emerald-50">
        <CardContent>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
              <Gift size={20} color="#5b7a5e" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-green-700">
                Buy this and earn {calculatePointsEarned(course)} Mind Points!
              </Text>
              <Text className="text-sm text-muted-foreground">
                Points are automatically added after purchase
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Schedule Card - Only for non-pre-recorded courses */}
      {(course.type as string) !== "pre-recorded" && (
        <Card className="mt-4 border border-border">
          <CardHeader className="pb-2">
            <View className="flex-row items-center gap-2">
              <Calendar size={20} color="#5b7a5e" />
              <CardTitle>Schedule & Timing</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              {/* Start Date */}
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
                  <Calendar size={20} color="#5b7a5e" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground">
                    Start Date
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatDateCommon(course.startDate)}
                  </Text>
                </View>
              </View>

              {/* End Date (certificate only) */}
              {course.type === "certificate" && course.endDate && (
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
                    <Calendar size={20} color="#5b7a5e" />
                  </View>
                  <View>
                    <Text className="text-sm font-medium text-foreground">
                      End Date
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {formatDateCommon(course.endDate)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Time */}
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
                  <Clock size={20} color="#5b7a5e" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground">
                    Time
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {course.startTime} - {course.endTime}
                  </Text>
                </View>
              </View>

              {/* Days */}
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
                  <MapPin size={20} color="#5b7a5e" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground">
                    Days
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {course.daysOfWeek.join(", ")}
                  </Text>
                </View>
              </View>

              {/* Duration */}
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-[999px] bg-primary/10">
                  <TrendingUp size={20} color="#5b7a5e" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground">
                    Duration
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {(course.type as string) === "pre-recorded"
                      ? "3 months"
                      : course.duration || "2 weeks"}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <View className="mt-4 rounded-xl border-2 border-primary/20 p-4">
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <Sparkles size={24} color="#5b7a5e" />
            <Text className="font-medium text-foreground">
              Practical, guided learning
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <HeartHandshake size={24} color="#5b7a5e" />
            <Text className="font-medium text-foreground">
              Lifetime doubt clearing
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

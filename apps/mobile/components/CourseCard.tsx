import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getOfferDetails, showRupees } from "@mindpoint/domain";

type CourseCardProps = {
  course: {
    description?: string;
    name: string;
    price?: number;
    type?: string;
    offer?: {
      name: string;
      discount?: number;
      startDate?: string;
      endDate?: string;
    } | null;
    bogo?: {
      enabled?: boolean;
      startDate?: string;
      endDate?: string;
      label?: string;
    } | null;
  };
};

function CourseCardComponent({ course }: CourseCardProps) {
  const offer = getOfferDetails(course);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>{course.type ?? "course"}</Text>
        {offer ? <Text style={styles.badge}>{offer.offerName}</Text> : null}
      </View>
      <Text style={styles.title}>{course.name}</Text>
      {course.description ? (
        <Text numberOfLines={3} style={styles.description}>
          {course.description}
        </Text>
      ) : null}
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {showRupees(offer ? offer.offerPrice : (course.price ?? 0))}
        </Text>
        {offer ? (
          <Text style={styles.originalPrice}>
            {showRupees(offer.originalPrice)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const CourseCard = memo(CourseCardComponent);

const styles = StyleSheet.create({
  badge: {
    color: "#6d5b1f",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  description: {
    color: "#516170",
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  originalPrice: {
    color: "#7b8794",
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  price: {
    color: "#0f1720",
    fontSize: 22,
    fontWeight: "700",
  },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 10,
  },
  title: {
    color: "#0f1720",
    fontSize: 20,
    fontWeight: "700",
  },
  type: {
    color: "#15616d",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

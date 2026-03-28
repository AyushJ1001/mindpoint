import { Text } from "react-native";
import { useNow } from "@/hooks/use-now";
import { calculateOfferTimeLeft } from "@mindpoint/domain/pricing";

interface CountdownTimerProps {
  endDate?: string;
  className?: string;
  isBogo?: boolean;
}

export function CountdownTimer({
  endDate,
  className,
  isBogo,
}: CountdownTimerProps) {
  useNow(60000); // Re-render every minute

  const timeLeft = calculateOfferTimeLeft(endDate);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return null;
  }

  const parts: string[] = [];
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`);
  if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes}m`);

  return (
    <Text
      className={`text-xs font-medium ${isBogo ? "text-emerald-600" : "text-orange-600"} ${className ?? ""}`}
    >
      {parts.join(" ")} left
    </Text>
  );
}

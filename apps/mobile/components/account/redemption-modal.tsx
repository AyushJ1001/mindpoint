import { View, Text } from "react-native";
import { Gift, AlertTriangle } from "lucide-react-native";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courseType: string, pointsRequired: number) => void;
  courseType: string;
  pointsRequired: number;
  currentBalance: number;
}

export function RedemptionModal({
  isOpen,
  onClose,
  onConfirm,
  courseType,
  pointsRequired,
  currentBalance,
}: RedemptionModalProps) {
  const canAfford = currentBalance >= pointsRequired;
  const courseTypeLabel =
    courseType.charAt(0).toUpperCase() + courseType.slice(1).replace("_", " ");

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <View className="flex-row items-center gap-2">
          <Gift size={20} color="#5b7a5e" />
          <DialogTitle>Redeem Mind Points</DialogTitle>
        </View>
        <DialogDescription>
          Confirm your redemption to receive a 100% discount coupon code.
        </DialogDescription>
      </DialogHeader>

      <View className="gap-4 py-2">
        {/* Redemption Details */}
        <View className="rounded-lg border border-border p-4">
          <Text className="mb-1 text-sm text-muted-foreground">
            Redemption Details
          </Text>
          <Text className="text-lg font-semibold text-foreground">
            {courseTypeLabel}
          </Text>
          <Text className="text-sm text-muted-foreground">
            Cost: {pointsRequired} Mind Points
          </Text>
        </View>

        {/* Balance Info */}
        <View className="rounded-lg border border-border bg-secondary/50 p-4">
          <Text className="mb-1 text-sm text-muted-foreground">
            Your Balance
          </Text>
          <Text className="text-lg font-semibold text-foreground">
            {currentBalance.toLocaleString()} points
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            After redemption:{" "}
            <Text className="font-medium">
              {(currentBalance - pointsRequired).toLocaleString()} points
            </Text>
          </Text>
        </View>

        {/* Insufficient Points Warning */}
        {!canAfford && (
          <View className="flex-row items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-4">
            <AlertTriangle size={16} color="#dc2626" />
            <Text className="flex-1 text-sm text-red-700">
              You don't have enough points. You need {pointsRequired} points but
              only have {currentBalance}.
            </Text>
          </View>
        )}

        {/* Info Notice */}
        <View className="rounded-lg border border-border bg-secondary/30 p-4">
          <Text className="text-sm text-muted-foreground">
            After redemption, you'll receive a unique coupon code via email that
            can be used during checkout for a 100% discount on any course of
            this type.
          </Text>
        </View>
      </View>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Cancel
        </Button>
        <Button
          onPress={() => onConfirm(courseType, pointsRequired)}
          disabled={!canAfford}
        >
          Confirm Redemption
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

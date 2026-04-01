import { View, Text, Pressable } from "react-native";
import { Gift, X } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CouponValidation {
  valid: boolean;
  error?: string;
  coupon?: {
    discount: number;
    courseType: string;
    pointsCost: number;
  };
}

interface AppliedCoupon {
  code: string;
  discount: number;
  courseType: string;
  pointsCost: number;
}

interface CartItem {
  id: string;
  courseType?: string;
  price?: number;
  [key: string]: unknown;
}

interface CouponInputProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: AppliedCoupon | null;
  onApply: () => void;
  onRemove: () => void;
  couponValidation: CouponValidation | undefined;
  items: CartItem[];
}

export function CouponInput({
  couponCode,
  setCouponCode,
  appliedCoupon,
  onApply,
  onRemove,
  couponValidation,
  items,
}: CouponInputProps) {
  if (appliedCoupon) {
    return (
      <View className="gap-2">
        <View className="flex-row items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
          <View className="flex-row items-center gap-2">
            <Gift size={16} color="#16a34a" />
            <Text className="font-mono text-sm font-semibold text-foreground">
              {appliedCoupon.code}
            </Text>
            <Text className="text-xs text-green-600">
              {appliedCoupon.discount}% off
            </Text>
          </View>
          <Pressable
            onPress={onRemove}
            className="rounded-md p-1.5"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <X size={16} color="#8a8279" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChangeText={(text) => setCouponCode(text.toUpperCase())}
          className="flex-1"
          autoCapitalize="characters"
        />
        <Button
          variant="outline"
          size="sm"
          onPress={onApply}
          disabled={!couponCode.trim() || couponValidation === undefined}
        >
          <Text className="text-sm font-semibold text-foreground">Apply</Text>
        </Button>
      </View>
      {couponValidation && !couponValidation.valid && couponCode.trim() !== "" && (
        <Text className="text-xs text-red-600">
          {couponValidation.error}
        </Text>
      )}
    </View>
  );
}

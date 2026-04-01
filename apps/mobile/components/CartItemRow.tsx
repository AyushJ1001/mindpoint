import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Trash2, Minus, Plus, Sparkles } from "lucide-react-native";
import { showRupees } from "@mindpoint/domain/pricing";
import type { OfferDetails } from "@mindpoint/domain/pricing";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  quantity?: number;
  imageUrls?: string[];
  courseType?: string;
  selectedFreeCourse?: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrls?: string[];
    courseType?: string;
  };
  [key: string]: unknown;
}

interface CartItemRowProps {
  item: CartItem;
  offerDetails: OfferDetails | undefined;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function CartItemRow({
  item,
  offerDetails,
  onRemove,
  onUpdateQuantity,
}: CartItemRowProps) {
  const itemTotal = Math.round((item.price || 0) * (item.quantity || 1));
  const imageUri = item.imageUrls?.[0];

  return (
    <View className="rounded-xl border border-blue-200/70 bg-card p-3">
      {/* Main row: image | details | price */}
      <View className="flex-row items-start gap-3">
        {/* Image */}
        <View className="h-14 w-14 overflow-hidden rounded-lg">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 56, height: 56 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center bg-muted">
              <Text className="text-xs text-muted-foreground">No img</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="min-w-0 flex-1">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={2}
          >
            {item.name || "Course"}
          </Text>
          {item.courseType && (
            <Text className="mt-0.5 text-sm capitalize text-muted-foreground">
              {item.courseType}
            </Text>
          )}
          {offerDetails && (
            <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
              {offerDetails.hasDiscount && (
                <View className="rounded bg-orange-100 px-2 py-0.5">
                  <Text className="text-[11px] font-semibold text-orange-800">
                    {offerDetails.discountPercentage}% OFF
                  </Text>
                </View>
              )}
              <Text
                className={`text-xs font-medium ${
                  offerDetails.hasBogo
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                }`}
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
                Bonus enrollment included
              </Text>
            </View>
          )}
        </View>

        {/* Price & Remove */}
        <View className="items-end gap-1">
          <Text className="text-base font-semibold text-foreground">
            {showRupees(itemTotal)}
          </Text>
          {offerDetails?.hasDiscount && (
            <Text className="text-xs text-muted-foreground line-through">
              {showRupees(
                (offerDetails.originalPrice || 0) * (item.quantity || 1),
              )}
            </Text>
          )}
          <Pressable
            onPress={() => onRemove(item.id)}
            className="mt-1 rounded-md p-1.5"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            accessibilityLabel={`Remove ${item.name} from cart`}
          >
            <Trash2 size={18} color="#dc2626" />
          </Pressable>
        </View>
      </View>

      {/* Quantity controls */}
      <View className="mt-3 flex-row items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            onUpdateQuantity(item.id, (item.quantity || 1) - 1)
          }
          disabled={(item.quantity || 1) <= 1}
        >
          <Minus size={14} color="#8a8279" />
        </Button>
        <Text className="w-8 text-center text-sm font-medium text-foreground">
          {item.quantity}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            onUpdateQuantity(item.id, (item.quantity || 1) + 1)
          }
        >
          <Plus size={14} color="#8a8279" />
        </Button>
      </View>
    </View>
  );
}

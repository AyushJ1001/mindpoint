import { View, Text } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { showRupees } from "@mindpoint/domain/pricing";
import { Button } from "@/components/ui/button";

interface StickyCTAProps {
  price: number;
  originalPrice?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isInCart: boolean;
  isOutOfStock: boolean;
}

export function StickyCTA({
  price,
  originalPrice,
  onAddToCart,
  onBuyNow,
  isInCart,
  isOutOfStock,
}: StickyCTAProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 pb-6 pt-3 shadow-lg">
      <View className="flex-row items-center gap-3">
        {/* Price */}
        <View className="flex-1">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-xl font-bold text-primary">
              {showRupees(price)}
            </Text>
            {originalPrice != null && originalPrice > price && (
              <Text className="text-xs text-muted-foreground line-through">
                {showRupees(originalPrice)}
              </Text>
            )}
          </View>
        </View>

        {/* Add to Cart */}
        <Button
          size="sm"
          onPress={onAddToCart}
          disabled={isInCart || isOutOfStock}
          className="px-4"
        >
          <Text className="text-xs font-semibold text-primary-foreground">
            {isOutOfStock ? "Out of Stock" : isInCart ? "Added" : "Add to Cart"}
          </Text>
        </Button>

        {/* Buy Now */}
        <Button
          variant="outline"
          size="sm"
          onPress={onBuyNow}
          disabled={isOutOfStock}
          className="px-4"
        >
          <View className="flex-row items-center gap-1">
            <ShoppingCart size={14} color="#2d2a26" />
            <Text className="text-xs font-semibold text-foreground">
              Buy Now
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );
}

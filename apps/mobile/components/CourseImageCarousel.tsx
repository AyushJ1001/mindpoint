import { View, FlatList, Dimensions, Text } from "react-native";
import { Image } from "expo-image";
import { BookOpen } from "lucide-react-native";
import { useState, useRef, useCallback } from "react";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface CourseImageCarouselProps {
  imageUrls: string[];
  height?: number;
}

export function CourseImageCarousel({
  imageUrls,
  height = 220,
}: CourseImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <View
        className="items-center justify-center rounded-t-xl bg-muted"
        style={{ height }}
      >
        <BookOpen size={48} color="#8a8279" />
      </View>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <View
        className="items-center justify-center overflow-hidden rounded-t-xl bg-muted"
        style={{ height }}
      >
        <Image
          source={{ uri: imageUrls[0] }}
          style={{ width: "100%", height }}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }

  const cardWidth = SCREEN_WIDTH - 32; // Account for card margin

  return (
    <View className="overflow-hidden rounded-t-xl bg-muted" style={{ height }}>
      <FlatList
        ref={flatListRef}
        data={imageUrls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, height }} className="items-center justify-center">
            <Image
              source={{ uri: item }}
              style={{ width: "100%", height }}
              contentFit="contain"
              transition={200}
            />
          </View>
        )}
      />
      {imageUrls.length > 1 && (
        <View className="absolute bottom-2 flex-row justify-center self-center gap-1">
          {imageUrls.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-[999px] ${
                index === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-white/70"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

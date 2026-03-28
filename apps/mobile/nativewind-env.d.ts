/// <reference types="nativewind/types" />

// Augment ScrollView / FlatList to accept contentContainerClassName
// NativeWind v5 supports this at runtime but the type declarations
// haven't shipped yet in the preview packages.
import "react-native";

declare module "react-native" {
  interface ScrollViewProps {
    contentContainerClassName?: string;
  }
  interface FlatListProps<ItemT> {
    contentContainerClassName?: string;
  }
}

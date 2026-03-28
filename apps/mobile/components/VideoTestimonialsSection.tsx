import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video, ResizeMode } from "expo-av";
import { Play, X } from "lucide-react-native";
import {
  VIDEO_TESTIMONIALS,
  type VideoTestimonial,
} from "@/lib/videoTestimonials";

const CARD_WIDTH = 150;
const CARD_ASPECT = 4 / 5;

function VideoCard({
  testimonial,
  onPress,
}: {
  testimonial: VideoTestimonial;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        width: CARD_WIDTH,
        aspectRatio: CARD_ASPECT,
      })}
      className="overflow-hidden rounded-xl"
    >
      {/* Background gradient (poster fallback) */}
      <LinearGradient
        colors={["#dbeafe", "#e0e7ff"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Dark overlay for contrast */}
      <View
        className="absolute inset-0 bg-black/20"
        style={{ zIndex: 1 }}
      />

      {/* Play button */}
      <View
        className="absolute inset-0 items-center justify-center"
        style={{ zIndex: 2 }}
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-white/90"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Play
            size={20}
            color="#2563eb"
            fill="#2563eb"
            style={{ marginLeft: 2 }}
          />
        </View>
      </View>

      {/* Label overlay at bottom */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          paddingTop: 32,
          paddingBottom: 12,
          paddingHorizontal: 12,
        }}
      >
        <Text className="text-xs font-medium text-white">
          {testimonial.name || "Student Testimonial"}
        </Text>
        {testimonial.role && (
          <Text className="text-[10px] text-white/80">{testimonial.role}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function VideoModal({
  testimonial,
  visible,
  onClose,
}: {
  testimonial: VideoTestimonial | null;
  visible: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<Video>(null);
  const { width, height } = Dimensions.get("window");

  const handleClose = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
      await videoRef.current.unloadAsync();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black items-center justify-center">
        {/* Close button */}
        <Pressable
          onPress={handleClose}
          className="absolute top-14 right-5 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/20"
        >
          <X size={20} color="#ffffff" />
        </Pressable>

        {testimonial && (
          <Video
            ref={videoRef}
            source={{ uri: testimonial.videoUrl }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            style={{ width, height: height * 0.85 }}
          />
        )}
      </View>
    </Modal>
  );
}

export default function VideoTestimonialsSection() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = (testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedVideo(null), 200);
  };

  if (VIDEO_TESTIMONIALS.length === 0) return null;

  return (
    <View className="mt-8">
      <Text className="mb-2 text-center text-2xl font-bold text-foreground">
        Hear From Our Students
      </Text>
      <Text className="mb-5 text-center text-sm text-muted-foreground">
        Real stories from students who transformed their understanding of mental
        health with The Mind Point
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
      >
        {VIDEO_TESTIMONIALS.map((testimonial) => (
          <VideoCard
            key={testimonial.id}
            testimonial={testimonial}
            onPress={() => handleCardPress(testimonial)}
          />
        ))}
      </ScrollView>

      <VideoModal
        testimonial={selectedVideo}
        visible={modalVisible}
        onClose={handleClose}
      />
    </View>
  );
}

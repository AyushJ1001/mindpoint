import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, X } from "lucide-react-native";
import {
  VIDEO_TESTIMONIALS,
  type VideoTestimonial,
} from "@/lib/videoTestimonials";

const CARD_WIDTH = 140;
const CARD_HEIGHT = 175;

function VideoCard({
  testimonial,
  onPress,
}: {
  testimonial: VideoTestimonial;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#dbeafe",
        }}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={["#dbeafe", "#c7d2fe", "#e0e7ff"]}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        />

        {/* Dark overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        />

        {/* Play button centered */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 40,
              width: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.9)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Play
              size={16}
              color="#2563eb"
              fill="#2563eb"
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>

        {/* Label at bottom */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: 28,
            paddingBottom: 8,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "500", color: "white" }}>
            {testimonial.name || "Student Testimonial"}
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
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
  const { width, height } = Dimensions.get("window");

  const player = useVideoPlayer(testimonial?.videoUrl ?? null, (p) => {
    if (testimonial) {
      p.play();
    }
  });

  const handleClose = useCallback(() => {
    player.pause();
    onClose();
  }, [player, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.7}
          style={{
            position: "absolute",
            top: 56,
            right: 20,
            zIndex: 10,
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          <X size={20} color="#ffffff" />
        </TouchableOpacity>

        {testimonial && (
          <VideoView
            player={player}
            style={{ width, height: height * 0.85 }}
            contentFit="contain"
            nativeControls
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
    <View style={{ marginTop: 32 }}>
      <Text
        style={{
          marginBottom: 8,
          textAlign: "center",
          fontSize: 20,
          fontWeight: "700",
          color: "#303853",
        }}
      >
        Hear From Our Students
      </Text>
      <Text
        style={{
          marginBottom: 20,
          textAlign: "center",
          fontSize: 13,
          color: "#717a93",
          paddingHorizontal: 16,
        }}
      >
        Real stories from students who transformed their understanding of mental
        health with The Mind Point
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        style={{ minHeight: CARD_HEIGHT + 8 }}
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

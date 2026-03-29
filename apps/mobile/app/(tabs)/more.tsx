import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Mail,
  Briefcase,
  Info,
  Shield,
  FileText,
  ScrollText,
  ChevronRight,
} from "lucide-react-native";
import { Separator } from "@/components/ui/separator";

const SITE_URL = "https://www.themindpoint.org";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {icon}
      <Text className="ml-4 flex-1 text-base text-foreground">{label}</Text>
      <ChevronRight size={18} color="#6b7280" />
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();

  const openInBrowser = (path: string) => {
    WebBrowser.openBrowserAsync(`${SITE_URL}${path}`);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="mt-4 rounded-xl bg-card mx-4">
        <MenuItem
          icon={<Mail size={20} color="#4338ca" />}
          label="Contact Us"
          onPress={() => router.push("/contact" as never)}
        />
        <Separator className="ml-14" />
        <MenuItem
          icon={<Briefcase size={20} color="#4338ca" />}
          label="Careers"
          onPress={() => router.push("/careers" as never)}
        />
      </View>

      <View className="mt-4 rounded-xl bg-card mx-4">
        <MenuItem
          icon={<Info size={20} color="#6b7280" />}
          label="About Us"
          onPress={() => openInBrowser("/about")}
        />
        <Separator className="ml-14" />
        <MenuItem
          icon={<Shield size={20} color="#6b7280" />}
          label="Privacy Policy"
          onPress={() => openInBrowser("/privacy")}
        />
        <Separator className="ml-14" />
        <MenuItem
          icon={<FileText size={20} color="#6b7280" />}
          label="Refund Policy"
          onPress={() => openInBrowser("/refund")}
        />
        <Separator className="ml-14" />
        <MenuItem
          icon={<ScrollText size={20} color="#6b7280" />}
          label="Terms & Conditions"
          onPress={() => openInBrowser("/toc")}
        />
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

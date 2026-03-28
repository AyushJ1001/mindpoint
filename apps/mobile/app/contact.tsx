import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Phone, Mail, Clock, Send } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { postJson } from "@/lib/api-client";
import { showToast, showErrorToast } from "@/lib/toast";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

type ContactResult = {
  success: boolean;
  error?: string;
};

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setStatus("sending");

    try {
      await postJson<ContactFormValues, ContactResult>("/api/contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      showToast("Message sent!", "We'll get back to you as soon as possible.");
    } catch {
      setStatus("error");
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="bg-primary px-6 pb-8 pt-6">
          <Text className="text-center text-3xl font-bold text-white">
            Contact Us
          </Text>
          <Text className="mt-2 text-center text-base text-white/80">
            Get in touch with us for any questions, support, or to learn more
            about our programs
          </Text>
        </View>

        <View className="px-4 pt-6">
          {/* Contact Info Cards */}
          <View className="mb-6 gap-3">
            <Card>
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-12 w-12 items-center justify-center rounded-[999px] bg-primary/10">
                  <Phone size={24} color="#4338ca" />
                </View>
                <View>
                  <Text className="font-semibold text-foreground">Phone</Text>
                  <Text className="text-sm text-muted-foreground">
                    +91 97707 80086
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-12 w-12 items-center justify-center rounded-[999px] bg-primary/10">
                  <Mail size={24} color="#4338ca" />
                </View>
                <View>
                  <Text className="font-semibold text-foreground">Email</Text>
                  <Text className="text-sm text-muted-foreground">
                    info@themindpoint.org
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-12 w-12 items-center justify-center rounded-[999px] bg-primary/10">
                  <Clock size={24} color="#4338ca" />
                </View>
                <View>
                  <Text className="font-semibold text-foreground">
                    Business Hours
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Mon - Fri: 9:00 AM - 6:00 PM
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Sat: 10:00 AM - 4:00 PM
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>

          {/* Contact Form */}
          <Card>
            <CardContent className="gap-5 p-5">
              <Text className="text-xl font-bold text-foreground">
                Send us a Message
              </Text>

              <View className="gap-2">
                <Label>Name</Label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View className="gap-2">
                <Label>Email</Label>
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="gap-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Tell us how we can help you..."
                  value={message}
                  onChangeText={setMessage}
                  numberOfLines={5}
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={status === "sending"}
              >
                <View className="flex-row items-center gap-2">
                  <Send size={16} color="#ffffff" />
                  <Text className="font-semibold text-white">
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </Text>
                </View>
              </Button>

              {status === "success" && (
                <Text className="text-center text-sm text-green-600">
                  Message sent successfully!
                </Text>
              )}
              {status === "error" && (
                <Text className="text-center text-sm text-red-600">
                  Error sending message. Please try again.
                </Text>
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

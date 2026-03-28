import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  Upload,
  FileText,
  X,
  Briefcase,
  Users,
  Heart,
  Target,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { postFormData } from "@/lib/api-client";
import { showToast } from "@/lib/toast";

type CareersResult = {
  success: boolean;
  error?: string;
};

const ROLES = [
  "Administration",
  "Teaching Faculty",
  "Session Supervisor",
  "Counsellor/Therapist",
  "Social Media Intern",
];

const VALUES = [
  {
    icon: Heart,
    title: "Compassion",
    desc: "We care deeply about mental wellness",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Building supportive networks",
  },
  {
    icon: Target,
    title: "Impact",
    desc: "Creating meaningful change",
  },
  {
    icon: Briefcase,
    title: "Growth",
    desc: "Professional development focus",
  },
];

export default function CareersScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role],
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Missing field", "Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing field", "Please enter your phone number.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Missing field", "Please enter your location.");
      return;
    }
    if (!selectedFile) {
      Alert.alert("Missing resume", "Please upload your resume.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("location", location.trim());
      formData.append("linkedIn", linkedIn.trim());
      formData.append("coverLetter", coverLetter.trim());
      formData.append("roles", JSON.stringify(selectedRoles));

      // Append the file
      formData.append("resume", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      } as unknown as Blob);

      await postFormData<CareersResult>("/api/careers", formData);

      showToast(
        "Application submitted!",
        "We'll review your application and get back to you within 5-7 business days.",
      );

      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setLinkedIn("");
      setCoverLetter("");
      setSelectedRoles([]);
      setSelectedFile(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Please try again later.";
      Alert.alert("Submission failed", message);
    } finally {
      setIsSubmitting(false);
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
            Join Our Mission
          </Text>
          <Text className="mt-2 text-center text-base text-white/80">
            Help us empower minds through comprehensive mental health education
            and professional development.
          </Text>
        </View>

        {/* Values */}
        <View className="flex-row flex-wrap justify-center gap-4 px-4 py-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <View key={title} className="w-[44%] items-center">
              <View className="mb-2 h-14 w-14 items-center justify-center rounded-[999px] bg-primary/10">
                <Icon size={28} color="#4338ca" />
              </View>
              <Text className="font-semibold text-foreground">{title}</Text>
              <Text className="text-center text-xs text-muted-foreground">
                {desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Application Form */}
        <View className="px-4">
          <Card>
            <CardContent className="gap-5 p-5">
              <View>
                <Text className="text-xl font-bold text-foreground">
                  Apply Now
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Upload your resume and fill in your details to apply.
                </Text>
              </View>

              {/* Resume Upload */}
              <View className="gap-2">
                <Label>Resume/CV *</Label>
                {selectedFile ? (
                  <View className="flex-row items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <FileText size={28} color="#4338ca" />
                    <View className="flex-1">
                      <Text
                        className="font-medium text-foreground"
                        numberOfLines={1}
                      >
                        {selectedFile.name}
                      </Text>
                      {selectedFile.size && (
                        <Text className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      )}
                    </View>
                    <Pressable onPress={removeFile} className="p-1">
                      <X size={18} color="#64748b" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickDocument}
                    className="items-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8"
                  >
                    <Upload size={36} color="#64748b" />
                    <Text className="mt-3 text-base font-medium text-foreground">
                      Tap to upload your resume
                    </Text>
                    <Text className="mt-1 text-xs text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Personal Details */}
              <Text className="text-lg font-semibold text-foreground">
                Personal Details
              </Text>

              <View className="gap-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View className="gap-2">
                <Label>Email Address *</Label>
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="gap-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="gap-2">
                <Label>Location *</Label>
                <Input
                  placeholder="City, State/Country"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View className="gap-2">
                <Label>LinkedIn Profile (Optional)</Label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedIn}
                  onChangeText={setLinkedIn}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              {/* Role Selection */}
              <View className="gap-3">
                <Label>Which role are you interested in?</Label>
                {ROLES.map((role) => (
                  <Pressable
                    key={role}
                    onPress={() => toggleRole(role)}
                    className="flex-row items-center gap-3"
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Text className="text-sm text-foreground">{role}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Cover Letter */}
              <View className="gap-2">
                <Label>Cover Letter (Optional)</Label>
                <Textarea
                  placeholder="Tell us why you're interested in joining The Mind Point..."
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  numberOfLines={6}
                />
              </View>

              {/* Submit */}
              <Button
                onPress={handleSubmit}
                disabled={!selectedFile || isSubmitting}
              >
                <Text className="font-semibold text-white">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

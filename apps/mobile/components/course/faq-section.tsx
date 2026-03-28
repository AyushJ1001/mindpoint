import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react-native";

const FAQ_ITEMS = [
  {
    question: "How do I access the course materials?",
    answer:
      "Once enrolled, you'll get immediate access to all course materials through our platform. Materials include video lectures, reading resources, and practice exercises.",
  },
  {
    question: "Is there a certificate upon completion?",
    answer:
      "Yes! Upon successfully completing the course requirements, you will receive a certificate of completion that you can share on your professional profiles.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "We offer a refund policy as outlined on our website. Please refer to our refund policy page for detailed information about eligibility and the process.",
  },
  {
    question: "Can I access the course on mobile?",
    answer:
      "Yes, our courses are fully accessible on mobile devices. You can learn on-the-go with our mobile-optimized platform.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team through the Contact Us section in the app. We typically respond within 24 hours.",
  },
];

interface FAQSectionProps {
  title?: string;
  items?: Array<{ question: string; answer: string }>;
}

export function FAQSection({
  title = "Frequently Asked Questions",
  items = FAQ_ITEMS,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-2">
        <HelpCircle size={20} color="#4338ca" />
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
      </View>
      <View className="gap-2">
        {items.map((item, index) => (
          <Pressable
            key={index}
            onPress={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="rounded-xl border border-border bg-card p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm font-medium text-foreground">
                {item.question}
              </Text>
              {openIndex === index ? (
                <ChevronUp size={18} color="#6b7280" />
              ) : (
                <ChevronDown size={18} color="#6b7280" />
              )}
            </View>
            {openIndex === index && (
              <Text className="mt-3 text-sm leading-5 text-muted-foreground">
                {item.answer}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

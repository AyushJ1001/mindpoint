import { openGraphImage } from "@/lib/seo";
import ContactClient from "@/components/ContactClient";

export const metadata = {
  title: "Contact Us - The Mind Point",
  description:
    "Get in touch with The Mind Point for questions, support, or to learn more about our mental health education programs and courses.",
  keywords:
    "contact us, support, mental health education, psychology courses, help, inquiry",
  openGraph: {
    images: [openGraphImage],
    title: "Contact Us - The Mind Point",
    description: "Get in touch with The Mind Point for questions and support.",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

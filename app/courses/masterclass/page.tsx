import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Masterclass Programs - The Mind Point",
  description:
    "Join our exclusive masterclass programs led by industry experts in psychology and mental health. Intensive learning experiences for advanced professionals.",
  keywords:
    "masterclass programs, psychology masterclasses, expert-led training, intensive learning, mental health education",
  openGraph: {
    title: "Masterclass Programs - The Mind Point",
    description:
      "Join our exclusive masterclass programs led by industry experts.",
    type: "website",
  },
};

export default function MasterclassCoursesPage() {
  return (
    <CourseTypePage
      courseType="masterclass"
      title="MasterClass & Workshops"
      description="Elevate your psychology knowledge with our dynamic workshops and masterclasses, led by industry experts and renowned psychologists. These immersive sessions dive deep into trending topics like mindfulness, trauma-informed care, and leadership psychology. Engage in hands-on activities, live discussions, and Q&A sessions to gain practical insights you can apply immediately. Our workshops and masterclasses offer certificates of participation and networking opportunities. Join our vibrant community and stay ahead in the ever-evolving field of psychology with The Mind Point!"
      iconName="Lightbulb"
    />
  );
}

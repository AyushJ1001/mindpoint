import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Worksheets - The Mind Point",
  description:
    "Download comprehensive worksheets and resources in psychology and mental health. Practical tools and exercises for your learning journey.",
  keywords:
    "worksheets, psychology worksheets, mental health resources, downloadable PDFs, learning materials",
  openGraph: {
    title: "Worksheets - The Mind Point",
    description: "Download comprehensive worksheets and resources for your learning journey.",
    type: "website",
  },
};

export default function WorksheetPage() {
  return (
    <CourseTypePage
      courseType="worksheet"
      title="Worksheets"
      description="Access our collection of comprehensive worksheets and downloadable resources designed to enhance your learning experience. Each worksheet is carefully crafted by our expert faculty to provide practical tools, exercises, and insights that complement your psychology and mental health education. Download instantly after purchase and use these resources at your own pace to reinforce key concepts and apply what you've learned."
      iconName="FileText"
    />
  );
}


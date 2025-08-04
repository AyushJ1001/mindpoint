import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, GlobeIcon } from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <article className="prose prose-lg container mx-auto my-8">
      <p>
        At <b>The Mind Point</b>, we're more than just an organization — we're a
        compassionate, curious, and creative communitycommitted to transforming
        the way mental health education is experienced. We specialize in online
        psychological education, offering a rich blend of certificate courses,
        diploma programs, workshops, internships, and training experiences that
        are rooted in both scientific rigor and human warmth. Our platform is
        designed to be inclusive, accessible, and deeply engaging — where
        learning feels like a meaningful conversation over a cup of tea.
      </p>

      <h2 className="mt-8 text-2xl font-bold">What We Do:</h2>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Certificate & Diploma Programs in counselling, therapy, and
          psychology-related disciplines
        </li>
        <li>Live Online Classes led by trained mental health professionals</li>
        <li>
          Pre-recorded Self-Paced Courses for flexible, independent learning
        </li>
        <li>
          Supervised Internshi ps & Observerships to help students apply theory
          to practice
        </li>
        <li>
          Workshops, Webinars, and Masterclasses that explore therapeutic tools,
          trends, and innovations
        </li>
      </ul>
      <h2 className="mt-8 text-2xl font-bold">Our Learners:</h2>
      <p>
        Our learners range from psychology students to practicing professionals,
        as well as individuals curious about mental health, healing, and
        personal growth. Every course we offer is designed to be practical,
        experiential, and deeply relevant — with real-world skills that empower
        people to grow both personally and professionally.
      </p>

      <h2 className="mt-8 text-2xl font-bold">Our Core Beliefs:</h2>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Mental health education should be accessible and joyful</li>
        <li>Learning should feel safe, engaging, and inspiring</li>
        <li>
          Psychology isn't just something to study — it's something to live,
          explore, and celebrate
        </li>
      </ul>
      <p>
        With a sprinkle of humor, a dash of creativity, and a whole lot of
        heart, The Mind Point is here to guide you on a journey of
        transformation — one mindful step at a time.
      </p>

      <h2 className="mt-8 text-center text-5xl font-bold text-shadow-blue-300">
        Our Accreditations
      </h2>
      <div className="mt-8 flex items-center justify-center gap-6">
        <Card className="h-64">
          <CardHeader>
            <CardTitle className="text-center">MSME</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full items-center justify-center">
            <Image
              src="/accreditions/msme.avif"
              alt="MSME Logo"
              width={200}
              height={100}
              className="object-contain"
            />
          </CardContent>
        </Card>
        <Card className="h-64">
          <CardHeader>
            <CardTitle className="text-center">IAOTH</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full items-center justify-center">
            <Image
              src="/accreditions/iaoth.avif"
              alt="IAOTH Logo"
              width={200}
              height={100}
              className="object-contain"
            />
          </CardContent>
        </Card>
        <Card className="h-64">
          <CardHeader>
            <CardTitle className="text-center">ISO 9001:2015</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full items-center justify-center">
            <Image
              src="/accreditions/iso.avif"
              alt="ISO Logo"
              width={200}
              height={100}
              className="object-contain"
            />
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 text-center text-5xl font-bold text-shadow-blue-300">
        Why Choose The Mind Point?
      </h2>
      <div className="mt-8 grid grid-cols-4 gap-6 rounded-lg bg-gradient-to-tl from-blue-100 to-blue-300 p-6 shadow-lg">
        <div>
          <GlobeIcon />
          Certificates accepted globally
        </div>
        <div>Practical Application along with Theory</div>
        <div>Personal Attention</div>
        <div>Job Opportunities</div>
        <div>Affordable Prices & Discount Offers</div>
        <div>Case Studies</div>
        <div>Detailed Study Material</div>
        <div>Recording for the Lectures</div>
      </div>
    </article>
  );
}

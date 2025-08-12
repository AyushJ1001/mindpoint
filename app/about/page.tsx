import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Users,
  BookOpen,
  Award,
  Heart,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "About Us - The Mind Point",
  description:
    "Learn about The Mind Point's mission to transform mental health education through compassionate, evidence-based programs and professional development courses.",
  keywords:
    "about us, mental health education, psychology courses, professional development, The Mind Point mission",
  openGraph: {
    title: "About Us - The Mind Point",
    description:
      "Learn about The Mind Point's mission to transform mental health education.",
    type: "website",
  },
};

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              About The Mind Point
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              We&apos;re more than just an organization — we&apos;re a
              compassionate, curious, and creative community committed to
              transforming the way mental health education is experienced.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container max-w-6xl">
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We specialize in online psychological education, offering a rich
                blend of certificate courses, diploma programs, workshops,
                internships, and training experiences that are rooted in both
                scientific rigor and human warmth.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is designed to be inclusive, accessible, and deeply
                engaging — where learning feels like a meaningful conversation
                over a cup of tea.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card card-shadow rounded-lg p-6 text-center">
                <Users className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 font-semibold">10000+</h3>
                <p className="text-muted-foreground text-sm">
                  Students Enrolled
                </p>
              </div>
              <div className="bg-card card-shadow rounded-lg p-6 text-center">
                <BookOpen className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 font-semibold">50+</h3>
                <p className="text-muted-foreground text-sm">
                  Courses Available
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-16" />

          {/* What We Do */}
          <div className="mb-16">
            <h2 className="mb-12 text-center text-3xl font-bold">What We Do</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Award,
                  title: "Certificate & Diploma Programs",
                  description:
                    "Comprehensive programs in counselling, therapy, and psychology-related disciplines",
                },
                {
                  icon: Users,
                  title: "Live Online Classes",
                  description:
                    "Interactive sessions led by trained mental health professionals",
                },
                {
                  icon: BookOpen,
                  title: "Self-Paced Courses",
                  description:
                    "Pre-recorded courses for flexible, independent learning",
                },
                {
                  icon: Target,
                  title: "Supervised Internships",
                  description:
                    "Practical experience to help students apply theory to practice",
                },
                {
                  icon: Lightbulb,
                  title: "Workshops & Masterclasses",
                  description:
                    "Explore therapeutic tools, trends, and innovations",
                },
                {
                  icon: Heart,
                  title: "Personal Growth",
                  description:
                    "Programs focused on healing and personal development",
                },
              ].map((service, index) => (
                <Card
                  key={index}
                  className="card-shadow hover:card-shadow-lg transition-smooth"
                >
                  <CardContent className="p-6">
                    <service.icon className="text-primary mb-4 h-12 w-12" />
                    <h3 className="mb-2 font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-16" />

          {/* Core Beliefs */}
          <div className="mb-16">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Our Core Beliefs
            </h2>
            <div className="mx-auto max-w-3xl space-y-6">
              {[
                "Mental health education should be accessible and joyful",
                "Learning should feel safe, engaging, and inspiring",
                "Psychology isn't just something to study — it's something to live, explore, and celebrate",
              ].map((belief, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
                  <p className="text-muted-foreground">{belief}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-16" />

          {/* Accreditations */}
          <div className="mb-16">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Our Accreditations
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { name: "MSME", image: "/accreditions/msme.avif" },
                { name: "IAOTH", image: "/accreditions/iaoth.avif" },
                { name: "ISO 9001:2015", image: "/accreditions/iso.avif" },
              ].map((accreditation, index) => (
                <Card
                  key={index}
                  className="card-shadow hover:card-shadow-lg transition-smooth"
                >
                  <CardHeader>
                    <CardTitle className="text-center">
                      {accreditation.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-8">
                    <Image
                      src={accreditation.image}
                      alt={`${accreditation.name} Logo`}
                      width={200}
                      height={100}
                      className="object-contain"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="from-primary/5 to-accent/5 rounded-2xl bg-gradient-to-br p-8 md:p-12 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Why Choose The Mind Point?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Globe, text: "Certificates accepted globally" },
                {
                  icon: BookOpen,
                  text: "Practical Application along with Theory",
                },
                { icon: Users, text: "Personal Attention" },
                { icon: Target, text: "Job Opportunities" },
                { icon: Award, text: "Affordable Prices & Discount Offers" },
                { icon: Heart, text: "Case Studies" },
                { icon: Lightbulb, text: "Detailed Study Material" },
                { icon: CheckCircle, text: "Recording for the Lectures" },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                    <feature.icon className="text-primary h-8 w-8" />
                  </div>
                  <p className="font-medium">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

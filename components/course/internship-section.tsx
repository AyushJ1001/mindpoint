import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  Brain,
  CheckCircle,
  Star,
  Award,
  Calendar,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface CurriculumItem {
  week: string;
  topic: string;
  hours: number;
  focus: string;
  skills: string[];
}

const curriculum120: CurriculumItem[] = [
  {
    week: "Weeks 1-2",
    topic: "Foundations of Clinical Practice",
    hours: 20,
    focus: "Assessment & Ethics",
    skills: ["Clinical interviewing", "Ethical guidelines", "Documentation"],
  },
  {
    week: "Weeks 3-4",
    topic: "Psychological Assessment",
    hours: 20,
    focus: "Testing & Evaluation",
    skills: ["Cognitive assessments", "Personality testing", "Report writing"],
  },
  {
    week: "Weeks 5-6",
    topic: "Individual Therapy Basics",
    hours: 20,
    focus: "Therapeutic Techniques",
    skills: ["CBT fundamentals", "Active listening", "Treatment planning"],
  },
  {
    week: "Weeks 7-8",
    topic: "Group Dynamics",
    hours: 20,
    focus: "Group Therapy",
    skills: [
      "Group facilitation",
      "Interpersonal skills",
      "Conflict resolution",
    ],
  },
  {
    week: "Weeks 9-10",
    topic: "Crisis Intervention",
    hours: 20,
    focus: "Emergency Response",
    skills: ["Risk assessment", "Safety planning", "Crisis counseling"],
  },
  {
    week: "Weeks 11-12",
    topic: "Professional Development",
    hours: 20,
    focus: "Career Preparation",
    skills: ["Case presentation", "Supervision skills", "Self-care practices"],
  },
];

const curriculum240: CurriculumItem[] = [
  {
    week: "Weeks 1-3",
    topic: "Advanced Clinical Assessment",
    hours: 30,
    focus: "Comprehensive Evaluation",
    skills: [
      "Neuropsychological testing",
      "Diagnostic interviewing",
      "Differential diagnosis",
    ],
  },
  {
    week: "Weeks 4-6",
    topic: "Evidence-Based Therapies",
    hours: 30,
    focus: "Specialized Treatments",
    skills: ["DBT techniques", "EMDR therapy", "Trauma-informed care"],
  },
  {
    week: "Weeks 7-9",
    topic: "Family & Couples Therapy",
    hours: 30,
    focus: "Systems Approach",
    skills: ["Family dynamics", "Couples counseling", "Systemic interventions"],
  },
  {
    week: "Weeks 10-12",
    topic: "Specialized Populations",
    hours: 30,
    focus: "Diverse Client Groups",
    skills: ["Child psychology", "Geriatric care", "Cultural competency"],
  },
  {
    week: "Weeks 13-15",
    topic: "Advanced Group Work",
    hours: 30,
    focus: "Group Leadership",
    skills: ["Process groups", "Psychoeducational groups", "Group supervision"],
  },
  {
    week: "Weeks 16-18",
    topic: "Research & Evaluation",
    hours: 30,
    focus: "Clinical Research",
    skills: [
      "Outcome measurement",
      "Program evaluation",
      "Research methodology",
    ],
  },
  {
    week: "Weeks 19-21",
    topic: "Consultation & Collaboration",
    hours: 30,
    focus: "Professional Networking",
    skills: [
      "Interdisciplinary work",
      "Case consultation",
      "Community outreach",
    ],
  },
  {
    week: "Weeks 22-24",
    topic: "Advanced Practice Integration",
    hours: 30,
    focus: "Clinical Mastery",
    skills: [
      "Complex case management",
      "Supervision provision",
      "Professional identity",
    ],
  },
];

const features = [
  "Hands-on clinical experience",
  "Expert supervision and mentorship",
  "Comprehensive skill development",
  "Professional networking opportunities",
  "Certificate of completion",
  "Career placement assistance",
];

export default function Internship({
  internship,
}: {
  internship: Doc<"courses">;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Curriculum Breakdown Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Curriculum Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Comprehensive topics covered in our clinical psychology training
              programs
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Curriculum */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
                    120 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {internship.learningOutcomes
                  ?.slice(
                    0,
                    Math.ceil((internship.learningOutcomes?.length || 0) / 2),
                  )
                  .map((outcome, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                        <CheckCircle className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {outcome.title}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 240 Hours Curriculum */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
                    240 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                    <CheckCircle className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Everything in 120 hours
                  </span>
                </div>
                {internship.learningOutcomes
                  ?.slice(
                    Math.ceil((internship.learningOutcomes?.length || 0) / 2),
                  )
                  .map((outcome, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                        <CheckCircle className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {outcome.title}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Infographic Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Program Structure Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Detailed hourly allocation for each training component to ensure
              comprehensive skill development
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Infographic */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  THE MIND POINT'S
                </div>
                <div className="mb-4 text-sm font-medium text-slate-600">
                  <span className="font-semibold text-slate-800">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                    120
                  </span>
                  <span className="ml-2 text-4xl font-bold text-slate-700">
                    HOURS
                  </span>
                </div>
              </div>

              <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Orientation
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">1 hour</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Pre-reading Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">10 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Live Classes
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">9 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Ice-breaker Activity
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">1 hour</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Week 1 Resource Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">15 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Week 2 Resource Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">15 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Group Activities
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">6 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Learning from Videos
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">8 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Reflective Self Paced Learning
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">9 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Homework and Report Making
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">15 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    5 Case Studies Formulation
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">30 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Final Assessment
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-blue-600">1 hour</span>
                </div>
              </div>

              <div className="mb-6 border-t border-slate-200 pt-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-xl font-bold text-transparent">
                  120 hours
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                <h4 className="mb-3 text-center font-bold text-slate-800">
                  Beginner to Intermediate Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  Choose the{" "}
                  <span className="font-semibold text-blue-600">
                    120-hour program
                  </span>{" "}
                  if you're new to psychology, currently in high school, or in
                  your first year of a bachelor's degree and want to build a
                  strong foundation in the field.
                </p>
              </div>
            </div>

            {/* 240 Hours Infographic */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  THE MIND POINT'S
                </div>
                <div className="mb-4 text-sm font-medium text-slate-600">
                  <span className="font-semibold text-slate-800">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                    240
                  </span>
                  <span className="ml-2 text-4xl font-bold text-slate-700">
                    HOURS
                  </span>
                </div>
              </div>

              <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Orientation
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">1 hour</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Pre-reading Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    10 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Live Classes
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    18 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Ice-breaker Activity
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">1 hour</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Week 1-2 Resource Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    30 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Week 3-4 Resource Material and Quiz
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    30 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Group Activities
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">9 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Worksheets and Presentations
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    12 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Reflective Learning
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    31 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    10 Case Studies
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    60 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Homework and Report Making
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    16 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    5 Case Studies Formulation
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">
                    30 hours
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-slate-700">
                    Final Assessment
                  </span>
                  <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
                  <span className="font-semibold text-purple-600">2 hours</span>
                </div>
              </div>

              <div className="mb-6 border-t border-slate-200 pt-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-xl font-bold text-transparent">
                  240 hours
                </div>
              </div>

              <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
                <h4 className="mb-3 text-center font-bold text-slate-800">
                  Advanced Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  Choose the{" "}
                  <span className="font-semibold text-purple-600">
                    240-hour program
                  </span>{" "}
                  if you're pursuing a bachelor's or master's in psychology and
                  want an in-depth experience—this program includes everything
                  from the 120-hour course and much more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="mb-6 text-3xl font-bold">
              Ready to Start Your Clinical Psychology Journey?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-blue-100">
              Join hundreds of successful graduates who have launched their
              careers through our comprehensive training programs at Mind Point.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl">
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-blue-600"
              >
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

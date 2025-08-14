// components/AIQuiz.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const courses = [
  {
    id: "relationship",
    name: "Certificate in Relationship Psychology",
    desc: "Learn to build stronger connections and understand relational dynamics.",
    tags: ["relationships", "personal", "professional"],
  },
  {
    id: "aba",
    name: "Applied Behavioural Analysis",
    desc: "Master behavior modification techniques for practical applications.",
    tags: ["behavior", "clinical", "helping"],
  },
  {
    id: "family",
    name: "Family Therapy",
    desc: "Enhance family dynamics and communication skills.",
    tags: ["family", "relationships", "helping"],
  },
  {
    id: "art",
    name: "Certificate in Art Therapy",
    desc: "Explore healing through artistic expression.",
    tags: ["creative", "children", "personal"],
  },
  {
    id: "colour",
    name: "Certificate in Colour Therapy for Children",
    desc: "Use colors to support mental health in children with special needs.",
    tags: ["creative", "children", "helping"],
  },
  {
    id: "cbt",
    name: "Certificate in CBT",
    desc: "Cognitive Behavioral Therapy techniques for mental health improvement.",
    tags: ["therapeutic", "clinical", "professional"],
  },
  {
    id: "rebt",
    name: "Certificate in REBT",
    desc: "Rational Emotive Behavioral Therapy for emotional resilience.",
    tags: ["therapeutic", "behavior", "personal"],
  },
  {
    id: "body",
    name: "Certificate in Body Language",
    desc: "Understand and master nonverbal communication.",
    tags: ["nonverbal", "professional", "personal"],
  },
];

const therapies = [
  {
    id: "relationship",
    name: "Relationship Therapy",
    desc: "Personalized sessions for couples and individuals to improve relationships.",
    tags: ["relationships", "personal", "helping"],
  },
  {
    id: "behavioral",
    name: "Behavioral Therapy",
    desc: "Techniques to modify behaviors for better mental health outcomes.",
    tags: ["behavior", "clinical", "professional"],
  },
  {
    id: "family",
    name: "Family Therapy",
    desc: "Group sessions to improve family relationships and dynamics.",
    tags: ["family", "relationships", "helping"],
  },
  {
    id: "art",
    name: "Art Therapy",
    desc: "Therapeutic sessions using art for emotional expression.",
    tags: ["creative", "children", "personal"],
  },
  {
    id: "colour",
    name: "Colour Therapy",
    desc: "Color-based therapy for emotional and mental wellness.",
    tags: ["creative", "children", "helping"],
  },
  {
    id: "cbt",
    name: "CBT Sessions",
    desc: "Cognitive Behavioral Therapy in practice.",
    tags: ["therapeutic", "clinical", "professional"],
  },
  {
    id: "rebt",
    name: "REBT Sessions",
    desc: "Rational Emotive Behavioral Therapy sessions.",
    tags: ["therapeutic", "behavior", "personal"],
  },
  {
    id: "body",
    name: "Body Language Therapy",
    desc: "Sessions focused on nonverbal cues and communication.",
    tags: ["nonverbal", "professional", "personal"],
  },
];

const supervisedSessions = [
  {
    id: "relationship",
    name: "Supervised Relationship Psychology Sessions",
    desc: "Guided practice in relationship therapy under expert supervision.",
    tags: ["relationships", "professional", "clinical"],
  },
  {
    id: "aba",
    name: "Supervised Applied Behavioural Analysis",
    desc: "Supervised training in behavior analysis techniques.",
    tags: ["behavior", "clinical", "helping"],
  },
  {
    id: "family",
    name: "Supervised Family Therapy",
    desc: "Supervised sessions for family dynamics improvement.",
    tags: ["family", "relationships", "helping"],
  },
  {
    id: "art",
    name: "Supervised Art Therapy",
    desc: "Supervised art-based therapeutic practices.",
    tags: ["creative", "children", "professional"],
  },
  {
    id: "colour",
    name: "Supervised Colour Therapy",
    desc: "Guided colour therapy sessions for children.",
    tags: ["creative", "children", "helping"],
  },
  {
    id: "cbt",
    name: "Supervised CBT",
    desc: "Supervised Cognitive Behavioral Therapy practice.",
    tags: ["therapeutic", "clinical", "professional"],
  },
  {
    id: "rebt",
    name: "Supervised REBT",
    desc: "Supervised Rational Emotive Behavioral Therapy.",
    tags: ["therapeutic", "behavior", "personal"],
  },
  {
    id: "body",
    name: "Supervised Body Language Sessions",
    desc: "Supervised training in nonverbal communication.",
    tags: ["nonverbal", "professional", "clinical"],
  },
];

const quizQuestions = [
  {
    id: 1,
    question: "What area of psychology interests you most?",
    options: [
      "Relationships and Family",
      "Behavior and Cognition",
      "Creative Therapies (Art, Colour)",
      "Therapeutic Techniques (CBT, REBT)",
      "Nonverbal Communication",
      "Other",
    ],
  },
  {
    id: 2,
    question: "What is your experience level?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: 3,
    question: "What is your main goal?",
    options: [
      "Personal Growth",
      "Professional Development",
      "Helping Children",
      "Clinical Practice",
      "General Interest",
    ],
  },
];

const typeOptions = [
  {
    id: "courses",
    title: "Courses & Certifications",
    description: "Structured learning programs with certificates",
    icon: BookOpen,
    color: "bg-blue-500",
  },
];

function AIQuiz() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<"type" | "quiz" | "results">(
    "type",
  );

  const items =
    selectedType === "courses"
      ? courses
      : selectedType === "therapy"
        ? therapies
        : supervisedSessions;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentStep("quiz");
    setAnswers({});
    setRecommendations([]);
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getRecommendations = () => {
    const interest = answers[1]?.toLowerCase() || "";
    const goal = answers[3]?.toLowerCase() || "";

    const matched = items
      .map((item) => {
        let score = 0;
        if (item.tags.some((tag) => interest.includes(tag))) score += 2;
        if (item.tags.some((tag) => goal.includes(tag))) score += 1;
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (matched.length < 3) {
      const additional = items
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 - matched.length)
        .map((item) => ({ ...item, score: 0 }));
      matched.push(...additional);
    }

    setRecommendations(matched);
    setCurrentStep("results");

    // Scroll to results section after a brief delay to ensure DOM update
    setTimeout(() => {
      const resultsSection = document.getElementById("quiz-results");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const resetQuiz = () => {
    setSelectedType(null);
    setAnswers({});
    setRecommendations([]);
    setCurrentStep("type");
  };

  if (currentStep === "type") {
    return (
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Discover Your Perfect Match
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Take our AI-powered quiz to get personalized recommendations for
              courses and certifications that match your interests and goals.
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-1">
            {typeOptions.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer border-2 transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:shadow-lg"
                onClick={() => handleTypeSelect(option.id)}
              >
                <CardHeader className="pb-4 text-center">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center ${option.color} mb-4 rounded-full`}
                  >
                    <option.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4 text-gray-600">{option.description}</p>
                  <Button className="w-full" variant="outline">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (currentStep === "quiz") {
    const selectedOption = typeOptions.find((opt) => opt.id === selectedType);
    const IconComponent = selectedOption?.icon || BookOpen;

    return (
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <div
              className={`inline-flex h-16 w-16 items-center justify-center ${selectedOption?.color} mb-6 rounded-full`}
            >
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              {selectedOption?.title} Quiz
            </h2>
            <p className="text-gray-600">
              Answer a few questions to get personalized recommendations
            </p>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-8">
              {quizQuestions.map((q) => (
                <div key={q.id} className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    {q.question}
                  </h3>
                  <div className="grid gap-3">
                    {q.options.map((opt) => (
                      <Button
                        key={opt}
                        variant={answers[q.id] === opt ? "default" : "outline"}
                        className={`h-auto justify-start p-4 text-left ${
                          answers[q.id] === opt
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "hover:border-blue-300 hover:bg-blue-50"
                        }`}
                        onClick={() => handleAnswer(q.id, opt)}
                      >
                        {answers[q.id] === opt && (
                          <CheckCircle className="mr-3 h-5 w-5" />
                        )}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={resetQuiz}
                  className="flex-1"
                >
                  Back to Selection
                </Button>
                <Button
                  onClick={getRecommendations}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={Object.keys(answers).length < quizQuestions.length}
                >
                  Get Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (currentStep === "results") {
    const selectedOption = typeOptions.find((opt) => opt.id === selectedType);

    return (
      <section
        id="quiz-results"
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Your Personalized Recommendations
            </h2>
            <p className="text-xl text-gray-600">
              Based on your preferences, here are the best{" "}
              {selectedOption?.title.toLowerCase()} for you
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className="transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {rec.name}
                      </h3>
                      <p className="mb-4 text-gray-600">{rec.desc}</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {rec.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {rec.score > 0 && (
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {rec.score}
                        </div>
                        <div className="text-xs text-gray-500">match score</div>
                      </div>
                    )}
                  </div>
                  <Button className="w-full" asChild>
                    <a href="https://www.themindpoint.org/courses">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" onClick={resetQuiz} className="mr-4">
              Take Another Quiz
            </Button>
            <Button asChild>
              <a href="https://www.themindpoint.org/courses">
                Browse All Options
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export default AIQuiz;

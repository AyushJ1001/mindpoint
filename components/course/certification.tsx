"use client";

import React, { useState } from "react";
import { Award, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CertificationProps {
  title?: string;
  description?: string;
  courseType?: string;
  items?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export default function Certification({
  title = "Certification & Its Applications",
  description = "Understand the value and applications of your certification",
  courseType,
  items = [
    {
      icon: "🎯",
      title: "Professional Recognition",
      description:
        "Gain industry-recognized certification that validates your expertise.",
    },
    {
      icon: "💼",
      title: "Career Opportunities",
      description:
        "Open doors to new job opportunities and career advancement.",
    },
    {
      icon: "🌍",
      title: "Global Applicability",
      description:
        "Certification recognized and valued worldwide in the field.",
    },
    {
      icon: "📈",
      title: "Skill Validation",
      description:
        "Demonstrate your practical skills and theoretical knowledge.",
    },
  ],
}: CertificationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const certificates = [
    {
      src: "/certificate.png",
      alt: "Sample Certificate",
      title: "Certificate of Completion",
      description: "Official certificate recognizing your achievement",
    },
    {
      src: "/performance-letter.png",
      alt: "Performance Letter",
      title: "Performance Letter",
      description: "Detailed evaluation of your performance",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % certificates.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + certificates.length) % certificates.length,
    );
  };

  return (
    <section className="from-background to-muted/20 bg-gradient-to-br py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                  <Award className="text-primary h-10 w-10" />
                  {title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="group">
                      <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="mb-4 text-4xl">{item.icon}</div>
                        <h3 className="mb-2 text-xl font-semibold">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample Certificate Carousel for Certificate Courses */}
                {courseType === "certificate" && (
                  <div className="mt-12">
                    <div className="mb-8 text-center">
                      <h3 className="mb-4 text-2xl font-bold">
                        Sample Documents
                      </h3>
                      <p className="text-muted-foreground">
                        Preview what your documents will look like upon
                        completion
                      </p>
                    </div>

                    <div className="mx-auto max-w-2xl">
                      <div className="relative">
                        <Card className="border-primary/20 overflow-hidden border-2 shadow-lg">
                          <CardContent className="p-4">
                            <div className="relative">
                              <Image
                                src={certificates[currentSlide].src}
                                alt={certificates[currentSlide].alt}
                                width={800}
                                height={600}
                                className="h-auto w-full rounded-lg"
                              />

                              {/* Navigation buttons */}
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-background/80 absolute top-1/2 left-2 -translate-y-1/2 backdrop-blur-sm"
                                onClick={prevSlide}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-background/80 absolute top-1/2 right-2 -translate-y-1/2 backdrop-blur-sm"
                                onClick={nextSlide}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Slide indicators */}
                        <div className="mt-4 flex justify-center space-x-2">
                          {certificates.map((_, idx) => (
                            <button
                              key={idx}
                              className={`h-2 w-8 rounded-full transition-colors ${
                                idx === currentSlide
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              }`}
                              onClick={() => setCurrentSlide(idx)}
                            />
                          ))}
                        </div>

                        {/* Current slide info */}
                        <div className="mt-4 text-center">
                          <h4 className="text-lg font-semibold">
                            {certificates[currentSlide].title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {certificates[currentSlide].description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center space-x-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Full Size
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                {certificates[currentSlide].title}
                              </DialogTitle>
                              <DialogDescription>
                                {certificates[currentSlide].description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-auto">
                              <Image
                                src={certificates[currentSlide].src}
                                alt={certificates[currentSlide].alt}
                                width={1200}
                                height={900}
                                className="h-auto w-full rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download Sample
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

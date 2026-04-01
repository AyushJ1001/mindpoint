"use client";

import React, { useState } from "react";
import { Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollReveal } from "@/components/ScrollReveal";

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
      icon: "\uD83C\uDFAF",
      title: "Professional Recognition",
      description:
        "Gain industry-recognized certification that validates your expertise.",
    },
    {
      icon: "\uD83D\uDCBC",
      title: "Career Opportunities",
      description:
        "Open doors to new job opportunities and career advancement.",
    },
    {
      icon: "\uD83C\uDF0D",
      title: "Global Applicability",
      description:
        "Certification recognized and valued worldwide in the field.",
    },
    {
      icon: "\uD83D\uDCC8",
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
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">{description}</p>
        </ScrollReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((item, idx) => (
            <ScrollReveal key={idx}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sample Certificate Carousel for Certificate Courses */}
        {courseType === "certificate" && (
          <ScrollReveal>
            <div className="mt-12">
              <div className="mb-8 text-center">
                <h3 className="font-display text-foreground mb-4 text-2xl font-semibold">
                  Sample Documents
                </h3>
                <p className="text-muted-foreground">
                  Preview what your documents will look like upon completion
                </p>
              </div>

              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="p-4">
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
                    </div>
                  </div>

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
                    <h4 className="text-lg font-semibold text-foreground">
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
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

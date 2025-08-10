"use client";

import React, { useState } from "react";
import { Award, Download, Eye } from "lucide-react";
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

                {/* Sample Certificate Section for Certificate Courses */}
                {courseType === "certificate" && (
                  <div className="mt-12">
                    <div className="mb-8 text-center">
                      <h3 className="mb-4 text-2xl font-bold">
                        Sample Certificate
                      </h3>
                      <p className="text-muted-foreground">
                        Preview what your certificate will look like upon
                        completion
                      </p>
                    </div>

                    <div className="mx-auto max-w-2xl">
                      <Card className="border-primary/20 border-2 shadow-lg">
                        <CardContent className="p-8">
                          <div className="text-center">
                            <div className="mb-6">
                              <Award className="text-primary mx-auto h-16 w-16" />
                            </div>
                            <h4 className="mb-2 text-xl font-bold">
                              Certificate of Completion
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              This is to certify that
                            </p>
                            <p className="mb-4 text-lg font-semibold">
                              [Student Name]
                            </p>
                            <p className="text-muted-foreground mb-6">
                              has successfully completed the course requirements
                              and demonstrated proficiency in the subject
                              matter.
                            </p>
                            <div className="mb-6 flex justify-center space-x-4">
                              <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                  Date
                                </p>
                                <p className="font-semibold">
                                  [Completion Date]
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                  Certificate ID
                                </p>
                                <p className="font-semibold">[Unique ID]</p>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <p className="text-muted-foreground text-sm">
                                This certificate is issued by The Mind Point and
                                is valid for professional use.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

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
                              <DialogTitle>Sample Certificate</DialogTitle>
                              <DialogDescription>
                                This is a preview of your certificate upon
                                course completion
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-auto">
                              <Card className="border-primary/20 border-2">
                                <CardContent className="p-12">
                                  <div className="text-center">
                                    <div className="mb-8">
                                      <Award className="text-primary mx-auto h-20 w-20" />
                                    </div>
                                    <h4 className="mb-4 text-3xl font-bold">
                                      Certificate of Completion
                                    </h4>
                                    <p className="text-muted-foreground mb-6 text-lg">
                                      This is to certify that
                                    </p>
                                    <p className="mb-6 text-2xl font-semibold">
                                      [Student Name]
                                    </p>
                                    <p className="text-muted-foreground mb-8 text-lg">
                                      has successfully completed the course
                                      requirements and demonstrated proficiency
                                      in the subject matter.
                                    </p>
                                    <div className="mb-8 flex justify-center space-x-8">
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Date
                                        </p>
                                        <p className="font-semibold">
                                          [Completion Date]
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">
                                          Certificate ID
                                        </p>
                                        <p className="font-semibold">
                                          [Unique ID]
                                        </p>
                                      </div>
                                    </div>
                                    <div className="border-t pt-6">
                                      <p className="text-muted-foreground">
                                        This certificate is issued by The Mind
                                        Point and is valid for professional use.
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
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

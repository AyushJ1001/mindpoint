"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  Briefcase,
  Users,
  Heart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";

interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  experience: string;
  coverLetter: string;
}

interface JobPosition {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
}

const jobPositions: JobPosition[] = [
  {
    id: "1",
    title: "Clinical Psychologist",
    department: "Therapy & Counselling",
    type: "Full-time",
    location: "Remote/Hybrid",
    description:
      "Join our therapy team to provide mental health support and counselling services to our community.",
  },
  {
    id: "2",
    title: "Course Content Developer",
    department: "TMP Academy",
    type: "Full-time",
    location: "Remote",
    description:
      "Create engaging educational content for our mental health courses and certification programs.",
  },
  {
    id: "3",
    title: "Mental Health Educator",
    department: "TMP Academy",
    type: "Part-time",
    location: "Remote",
    description:
      "Deliver workshops and masterclasses on various mental health topics to diverse audiences.",
  },
  {
    id: "4",
    title: "Career Counselor",
    department: "Career Services",
    type: "Full-time",
    location: "Hybrid",
    description:
      "Guide individuals in their career development journey within the mental health field.",
  },
];

export default function CareersClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    experience: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx"))
    ) {
      setSelectedFile(file);
      // Simulate auto-fill from resume
      simulateAutoFill();
      toast.success("Resume uploaded successfully", {
        description: "We've auto-filled some fields based on your resume.",
      });
    } else {
      toast.error("Invalid file type", {
        description: "Please upload a PDF or Word document.",
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      simulateAutoFill();
      toast.success("Resume uploaded successfully", {
        description: "We've auto-filled some fields based on your resume.",
      });
    }
  };

  const simulateAutoFill = () => {
    // Simulate extracting data from resume
    setPersonalDetails((prev) => ({
      ...prev,
      fullName: prev.fullName || "John Doe",
      email: prev.email || "john.doe@email.com",
      phone: prev.phone || "+1 (555) 123-4567",
      location: prev.location || "New York, NY",
      experience:
        prev.experience ||
        "5+ years in clinical psychology with expertise in cognitive behavioral therapy and trauma counseling.",
    }));
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleInputChange = (field: keyof PersonalDetails, value: string) => {
    setPersonalDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Application submitted successfully!", {
      description:
        "We'll review your application and get back to you within 5-7 business days.",
    });

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-10% via-blue-50 to-blue-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-blue-950 md:text-5xl dark:text-white">
            Join Our Mission
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Help us empower minds through comprehensive mental health education
            and professional development. Be part of a team that's making a real
            difference in people's lives.
          </p>

          {/* Values */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-4">
            {[
              {
                icon: Heart,
                title: "Compassion",
                desc: "We care deeply about mental wellness",
              },
              {
                icon: Users,
                title: "Community",
                desc: "Building supportive networks",
              },
              {
                icon: Target,
                title: "Impact",
                desc: "Creating meaningful change",
              },
              {
                icon: Briefcase,
                title: "Growth",
                desc: "Professional development focus",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="bg-primary/10 mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
                  <Icon className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-1 font-semibold text-blue-950 dark:text-white">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-950 dark:text-white">
              Apply Now
            </CardTitle>
            <p className="text-muted-foreground">
              Upload your resume and fill in your details to apply for a
              position with us.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Resume Upload */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Resume/CV *</Label>
                <div
                  className={cn(
                    "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25",
                    selectedFile && "border-primary bg-primary/5",
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="text-primary h-8 w-8" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <p className="mb-2 text-lg font-medium">
                        Drop your resume here
                      </p>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Button type="button" variant="outline" asChild>
                        <label
                          htmlFor="resume-upload"
                          className="cursor-pointer"
                        >
                          Choose File
                        </label>
                      </Button>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Supported formats: PDF, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-950 dark:text-white">
                  Personal Details
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={personalDetails.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalDetails.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={personalDetails.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="City, State/Country"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedIn"
                    value={personalDetails.linkedIn}
                    onChange={(e) =>
                      handleInputChange("linkedIn", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Which role are you interested in?{" "}
                  </Label>
                  {[
                    "Administration",
                    "Teaching Faculty",
                    "Session Supervisor",
                    "Counsellor/Therapist",
                    "Social Media Intern",
                  ].map((role, idx) => (
                    <div className="flex items-center gap-2" key={idx}>
                      <Checkbox id={role} />
                      <Label htmlFor={role}>{role}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    value={personalDetails.coverLetter}
                    onChange={(e) =>
                      handleInputChange("coverLetter", e.target.value)
                    }
                    placeholder="Tell us why you're interested in joining The Mind Point..."
                    rows={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    !selectedFile ||
                    !personalDetails.fullName ||
                    !personalDetails.email ||
                    isSubmitting
                  }
                  className="min-w-[200px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

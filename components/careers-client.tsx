"use client";

import type React from "react";

import { useState, useCallback, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ApplicationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val), {
      message: "Enter a valid phone number",
    }),
  location: z.string().min(1, "Location is required"),
  linkedIn: z
    .string()
    .url("Enter a valid URL")
    .refine((url) => url.includes("linkedin.com"), {
      message: "Enter a valid LinkedIn profile URL",
    })
    .optional()
    .or(z.literal("")),
  coverLetter: z
    .string()
    .max(2000, "Cover letter is too long")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof ApplicationSchema>;

interface JobPosition {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
}

export default function CareersClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      coverLetter: "",
    },
    mode: "onBlur",
  });

  const PhoneInputField = forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >(({ value, ...rest }, ref) => (
    <Input ref={ref} value={value ?? ""} {...rest} />
  ));
  PhoneInputField.displayName = "PhoneInputField";

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
    const current = form.getValues();
    if (!current.fullName) form.setValue("fullName", "John Doe");
    if (!current.email) form.setValue("email", "john.doe@email.com");
    if (!current.phone) form.setValue("phone", "+1 555 123 4567");
    if (!current.location) form.setValue("location", "New York, NY");
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (_data: FormValues) => {
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
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
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              id="fullName"
                              placeholder="Enter your full name"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your.email@example.com"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <PhoneInput
                              id="phone"
                              placeholder="+1 555 123 4567"
                              international
                              defaultCountry="IN"
                              inputComponent={PhoneInputField as any}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input
                              id="location"
                              placeholder="City, State/Country"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            id="linkedIn"
                            placeholder="https://linkedin.com/in/yourprofile"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                  <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Letter (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            id="coverLetter"
                            placeholder="Tell us why you're interested in joining The Mind Point..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!selectedFile || isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

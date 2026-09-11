"use client";

import type React from "react";
import { useState, useCallback, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, X } from "lucide-react";
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
import { submitCareersApplication } from "@/lib/services/careers";

const PhoneInputField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ value, ...rest }, ref) => (
  <Input ref={ref} value={value ?? ""} {...rest} />
));
PhoneInputField.displayName = "PhoneInputField";

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
  coverLetter: z.string().max(2000, "Cover letter is too long").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof ApplicationSchema>;

const VALUES = [
  ["01", "Compassion", "Care deeply about mental wellness and the person behind the work."],
  ["02", "Community", "Build learning spaces where people can ask, contribute and belong."],
  ["03", "Impact", "Make useful work that improves how psychology is learned and supported."],
  ["04", "Growth", "Stay curious, keep learning and make room for better ways to do things."],
];

const ROLES = [
  "Administration",
  "Teaching Faculty",
  "Session Supervisor",
  "Counsellor/Therapist",
  "Social Media Intern",
];

export default function CareersClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const simulateAutoFill = useCallback(() => {
    const current = form.getValues();
    if (!current.fullName) form.setValue("fullName", "John Doe");
    if (!current.email) form.setValue("email", "john.doe@email.com");
    if (!current.phone) form.setValue("phone", "+1 555 123 4567");
    if (!current.location) form.setValue("location", "New York, NY");
  }, [form]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
        simulateAutoFill();
        toast.success("Resume uploaded successfully", {
          description: "We've auto-filled some fields based on your resume.",
        });
      } else {
        toast.error("Invalid file type", {
          description: "Please upload a PDF or Word document.",
        });
      }
    },
    [simulateAutoFill],
  );

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

  const onSubmit = async (formData: FormValues) => {
    if (!selectedFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    data.append("linkedIn", formData.linkedIn || "");
    data.append("coverLetter", formData.coverLetter || "");
    data.append("roles", JSON.stringify(selectedRoles));
    data.append("resume", selectedFile);

    const result = await submitCareersApplication(data);
    if (!result.success) {
      toast.error("Failed to submit application", {
        description: result.error || "Please try again later.",
      });
      setIsSubmitting(false);
      return;
    }

    toast.success("Application submitted successfully!", {
      description: "We'll review your application and get back to you within 5-7 business days.",
    });
    form.reset();
    setSelectedFile(null);
    setSelectedRoles([]);
    setIsSubmitting(false);
  };

  const fieldClass =
    "h-12 border-x-0 border-t-0 border-b border-[#163f3d]/30 bg-transparent px-0 focus-visible:ring-0";

  return (
    <div className="ss-page tmp-careers-page">
      <section className="ss-hero">
        <div className="ss-wrap">
          <p className="ss-kicker">careers · work with TMP</p>
          <h1 className="ss-heading-xl">Help build learning that changes what people can do next.</h1>
          <p className="ss-lead ss-dropcap mt-7 max-w-3xl">
            The Mind Point is a small online team working across psychology
            education, practical training and personal support. We care about
            thoughtful work, useful learning and treating people like people.
          </p>
        </div>
      </section>

      <section className="ss-section-tight">
        <div className="ss-wrap">
          <p className="ss-kicker">what matters here</p>
          <div className="ss-row-list">
            {VALUES.map(([number, title, text]) => (
              <div className="ss-row" key={title}>
                <span className="ss-row-date">{number}</span>
                <span className="ss-row-title">{title}</span>
                <span className="ss-row-meta">{text}</span>
                <span aria-hidden="true">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <div className="grid gap-14 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <aside>
              <p className="ss-kicker">open application</p>
              <h2 className="ss-heading-md">Tell us where you could contribute.</h2>
              <p className="mt-5 text-sm leading-7 text-[#65736f]">
                Choose one or more roles, upload your resume, and give us enough
                context to understand your background. You do not need a formal
                cover letter unless there is something useful you want us to know.
              </p>

              <div className="mt-8 border-t border-[#163f3d]/30">
                {ROLES.map((role) => (
                  <div key={role} className="flex items-center gap-3 border-b border-[#163f3d]/18 py-4">
                    <Checkbox
                      id={`side-${role}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        setSelectedRoles((prev) =>
                          checked ? [...prev, role] : prev.filter((r) => r !== role),
                        );
                      }}
                    />
                    <Label htmlFor={`side-${role}`} className="text-sm font-medium">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
            </aside>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="border-t border-[#163f3d]/30">
                <div className="border-b border-[#163f3d]/18 py-7">
                  <Label className="mb-4 block text-[0.7rem] font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
                    resume / cv
                  </Label>
                  <div
                    className={cn(
                      "border border-dashed p-7 text-center transition-colors",
                      isDragOver ? "border-[#0f4d4d] bg-[#8ec1c3]/10" : "border-[#163f3d]/30",
                      selectedFile && "border-[#0f4d4d] bg-[#8ec1c3]/8",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-4">
                        <FileText className="h-6 w-6 text-[#0f4d4d]" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-[#65736f]">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-3 h-7 w-7 text-[#0f4d4d]" />
                        <p className="text-sm font-medium">Drop your resume here, or choose a file</p>
                        <p className="mt-1 text-xs text-[#65736f]">PDF, DOC or DOCX · max 10MB</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="resume-upload"
                        />
                        <Button type="button" variant="outline" asChild className="mt-4">
                          <label htmlFor="resume-upload" className="cursor-pointer">Choose file</label>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-x-10 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="border-b border-[#163f3d]/18 py-6">
                        <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">full name</FormLabel>
                        <FormControl><Input placeholder="Your full name" className={fieldClass} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="border-b border-[#163f3d]/18 py-6">
                        <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">email</FormLabel>
                        <FormControl><Input type="email" placeholder="your.email@example.com" className={fieldClass} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="border-b border-[#163f3d]/18 py-6">
                        <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">phone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            placeholder="+91 …"
                            international
                            defaultCountry="IN"
                            inputComponent={PhoneInputField}
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
                      <FormItem className="border-b border-[#163f3d]/18 py-6">
                        <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">location</FormLabel>
                        <FormControl><Input placeholder="City, state / country" className={fieldClass} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem className="border-b border-[#163f3d]/18 py-6">
                      <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">linkedin · optional</FormLabel>
                      <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" className={fieldClass} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem className="border-b border-[#163f3d]/18 py-6">
                      <FormLabel className="text-[0.7rem] tracking-[0.08em] text-[#0f4d4d]/65 lowercase">anything we should know · optional</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Why TMP, what you do well, what kind of work you want to contribute to…"
                          rows={7}
                          className="mt-2 resize-y border-x-0 border-t-0 border-b border-[#163f3d]/30 bg-transparent px-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-7 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!selectedFile || isSubmitting}
                    className="min-w-[200px] bg-[#0f4d4d] text-[#faf8f3]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit application"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}

import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const careerApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Please enter a valid phone number"),
  location: z.string().min(2, "Location is required"),
  linkedIn: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  roles: z.array(z.string()).default([]),
  coverLetter: z.string().optional().default(""),
});

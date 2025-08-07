"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [status, setStatus] = useState("");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setStatus("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      if (result.success) {
        setStatus("Message sent successfully!");
        form.reset();
      } else {
        setStatus("Error sending message.");
      }
    } catch (error) {
      setStatus("Error sending message.");
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-3/4 space-y-6">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Contact Us</h1>
        <div className="text-muted-foreground grid grid-cols-3 grid-rows-2 gap-4">
          <div className="text-center">Phone</div>
          <div className="text-center">Email</div>
          <div className="text-center">Social Media</div>
          <div className="text-center text-sm">+91 70576 28124</div>
          <div className="text-center text-sm break-words">
            admin@themindpoint.org
          </div>
          <div className="flex items-center justify-center gap-2">
            <Link href="https://www.facebook.com/themindpoint" target="_blank">
              <Facebook size={16} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/themindpoint"
              target="_blank"
            >
              <Linkedin size={16} />
            </Link>
            <Link
              href="https://www.instagram.com/themindpoint/"
              target="_blank"
            >
              <Instagram size={16} />
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your message here..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="mb-8 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </Button>

          {status && (
            <p
              className={`text-center text-sm ${
                status.includes("Error") ? "text-destructive" : "text-green-600"
              }`}
            >
              {status}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}

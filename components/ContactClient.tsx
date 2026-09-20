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
import { Phone, Mail, Clock } from "lucide-react";
import { submitContactForm } from "@/lib/services/contact";
import { eyebrowVariants } from "@/components/coastal/eyebrow";

import { contactFormSchema } from "@/lib/utils";

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 97707 80086"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@themindpoint.org"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    lines: [
      "Monday - Friday: 9:00 AM - 6:00 PM",
      "Saturday: 10:00 AM - 4:00 PM",
    ],
  },
];

export default function ContactClient() {
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

    const result = await submitContactForm(data);
    if (!result.success) {
      setStatus(result.error || "Error sending message.");
      return;
    }

    setStatus("Message sent successfully!");
    form.reset();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-14 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className={eyebrowVariants()}>Contact</span>
            <h1 className="font-display mt-4 mb-5 text-4xl tracking-[-0.03em] md:text-6xl">
              We&apos;re here to <em className="italic">help.</em>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed sm:text-xl">
              Questions, support, or just want to know more about our programs —
              reach out and we&apos;ll reply within 48–72 hours on working days.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding">
        <div className="container max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information – simple list items, no cards */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display mb-6 text-3xl tracking-tight">
                  Get in touch
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We&apos;d love to hear from you. Send us a message and
                  we&apos;ll respond as soon as possible.
                </p>
              </div>

              <div className="space-y-6">
                {CONTACT_INFO.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="bg-primary/8 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-foreground mb-1 font-semibold">
                          {item.title}
                        </h3>
                        {item.lines.map((line) => (
                          <p
                            key={line}
                            className="text-muted-foreground text-sm"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Form – subtle container, no heavy card */}
            <div className="bg-card/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h3 className="text-foreground mb-6 text-xl font-semibold">
                Send us a Message
              </h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                          />
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
                            placeholder="Tell us how we can help you..."
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
                    className="w-full"
                    disabled={status === "Sending..."}
                  >
                    {status === "Sending..." ? "Sending..." : "Send Message"}
                  </Button>

                  {status && (
                    <p
                      className={`text-center text-sm ${status.includes("successfully") ? "text-green-600" : "text-red-600"}`}
                    >
                      {status}
                    </p>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
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
import { Phone, Mail, Clock, Globe2 } from "lucide-react";
import { submitContactForm } from "@/lib/services/contact";
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
    lines: ["contact.themindpoint@gmail.com"],
  },
  {
    icon: Globe2,
    title: "Website",
    lines: ["www.themindpoint.org"],
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
    <div className="tmp-contact-page min-h-screen">
      <section className="brand-hero relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="brand-gold-rule" aria-hidden="true" />
              <span className="brand-kicker">Contact The Mind Point</span>
              <span className="brand-gold-rule" aria-hidden="true" />
            </div>
            <h1 className="font-display text-foreground mt-6 text-5xl leading-[1.02] font-medium tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Have a question? You can start
              <span className="text-primary block italic">with a simple message.</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              Ask about a program, enrollment, learning pathway, therapy option, or anything else you need help understanding before you decide.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section-md">
        <div className="container">
          <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <div className="brand-section-dark relative overflow-hidden rounded-[2.2rem] p-8 sm:p-10">
              <div className="relative z-10">
                <Image
                  src="/tmp-botanical-logo.svg"
                  alt="The Mind Point"
                  width={120}
                  height={120}
                  className="h-20 w-20 object-contain brightness-0 invert"
                />
                <span className="mt-8 block text-xs font-semibold tracking-[0.25em] text-[#9fd0cf] uppercase">
                  We are here to help you get oriented
                </span>
                <h2 className="font-display mt-4 text-4xl leading-tight font-medium text-[#faf8f3] sm:text-5xl">
                  Clear answers before you commit.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#d1dfdc]">
                  If you are unsure which program fits, what a batch includes, how recordings work, or where to begin, reach out. A question is a perfectly good first step.
                </p>

                <div className="mt-10 space-y-6">
                  {CONTACT_INFO.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#b9dedd]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold tracking-[0.14em] text-[#9fd0cf] uppercase">
                            {item.title}
                          </p>
                          {item.lines.map((line) => (
                            <p key={line} className="mt-1 text-sm leading-6 text-[#f2eee6]">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="brand-panel rounded-[2.2rem] p-7 sm:p-9 lg:p-10">
              <div className="mb-8">
                <span className="brand-kicker">Send a message</span>
                <h2 className="font-display text-foreground mt-3 text-4xl font-medium">
                  Tell us what you need help with.
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl leading-7">
                  You do not need to phrase it perfectly. Just share the question, course, or concern you have in mind.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary/75 text-xs font-semibold tracking-[0.12em] uppercase">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="h-12 rounded-2xl border-primary/10 bg-[#fffdf9] px-4"
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
                        <FormLabel className="text-primary/75 text-xs font-semibold tracking-[0.12em] uppercase">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            className="h-12 rounded-2xl border-primary/10 bg-[#fffdf9] px-4"
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
                        <FormLabel className="text-primary/75 text-xs font-semibold tracking-[0.12em] uppercase">
                          Message
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us how we can help you..."
                            className="min-h-[160px] rounded-2xl border-primary/10 bg-[#fffdf9] p-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full"
                    disabled={status === "Sending..."}
                  >
                    {status === "Sending..." ? "Sending..." : "Send Message"}
                  </Button>

                  {status && (
                    <p
                      className={`text-center text-sm ${
                        status.includes("successfully")
                          ? "text-[#54776d]"
                          : "text-red-600"
                      }`}
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

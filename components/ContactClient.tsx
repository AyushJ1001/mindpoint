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
import { submitContactForm } from "@/lib/services/contact";
import { contactFormSchema } from "@/lib/utils";

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CONTACT_INFO = [
  ["phone", "+91 97707 80086"],
  ["email", "contact.themindpoint@gmail.com"],
  ["website", "www.themindpoint.org"],
  ["hours", "Mon–Fri 9:00 AM–6:00 PM · Sat 10:00 AM–4:00 PM"],
];

export default function ContactClient() {
  const [status, setStatus] = useState("");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
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
    <div className="ss-page tmp-contact-page">
      <section className="ss-hero">
        <div className="ss-wrap">
          <p className="ss-kicker">contact · ask before you decide</p>
          <h1 className="ss-heading-xl">A question is a perfectly good first step.</h1>
          <p className="ss-lead ss-dropcap mt-7 max-w-3xl">
            Ask about a programme, a batch, recordings, enrolment, therapy, or
            where to begin. You do not need to know the exact words — tell us what
            you are trying to understand and we will help you get oriented.
          </p>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <aside>
              <p className="ss-kicker">the practical bits</p>
              <h2 className="ss-heading-md">How to reach us.</h2>
              <div className="mt-8 border-t border-[#163f3d]/30">
                {CONTACT_INFO.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-2 border-b border-[#163f3d]/18 py-5 sm:grid-cols-[7rem_1fr]"
                  >
                    <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
                      {label}
                    </span>
                    <span className="text-sm leading-6 text-[#425956]">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-7 max-w-sm text-sm leading-7 text-[#65736f]">
                If your question is about an existing registration, include the
                email address you enrolled with so we can identify it quickly.
              </p>
            </aside>

            <div>
              <p className="ss-kicker">send a message</p>
              <h2 className="ss-heading-md">Tell us what you need help with.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#65736f]">
                Short is fine. Specific is fine. Unsure is also fine.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-10 border-t border-[#163f3d]/30"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid gap-3 border-b border-[#163f3d]/18 py-6 md:grid-cols-[9rem_1fr] md:items-start">
                        <FormLabel className="pt-3 text-[0.7rem] font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
                          your name
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              className="h-12 border-x-0 border-t-0 border-b border-[#163f3d]/30 bg-transparent px-0 focus-visible:ring-0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-3 border-b border-[#163f3d]/18 py-6 md:grid-cols-[9rem_1fr] md:items-start">
                        <FormLabel className="pt-3 text-[0.7rem] font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
                          email
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              className="h-12 border-x-0 border-t-0 border-b border-[#163f3d]/30 bg-transparent px-0 focus-visible:ring-0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="grid gap-3 border-b border-[#163f3d]/18 py-6 md:grid-cols-[9rem_1fr] md:items-start">
                        <FormLabel className="pt-3 text-[0.7rem] font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
                          message
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help you..."
                              className="min-h-[180px] resize-y border-x-0 border-t-0 border-b border-[#163f3d]/30 bg-transparent px-0 py-3 focus-visible:ring-0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="submit"
                      size="lg"
                      className="min-w-44 bg-[#0f4d4d] text-[#faf8f3]"
                      disabled={status === "Sending..."}
                    >
                      {status === "Sending..." ? "Sending..." : "Send message"}
                    </Button>
                    {status && (
                      <p
                        className={`text-sm ${
                          status.includes("successfully") ? "text-[#54776d]" : "text-red-700"
                        }`}
                      >
                        {status}
                      </p>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

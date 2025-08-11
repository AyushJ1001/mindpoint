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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { contactFormSchema } from "@/lib/utils";

type ContactFormValues = z.infer<typeof contactFormSchema>;

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Contact Us
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Get in touch with us for any questions, support, or to learn more
              about our programs
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding">
        <div className="container max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-6 text-3xl font-bold">Get In Touch</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We&apos;d love to hear from you. Send us a message and
                  we&apos;ll respond as soon as possible.
                </p>
              </div>

              <div className="grid gap-6">
                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
                        <Phone className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold">Phone</h3>
                        <p className="text-muted-foreground">+91 97707 80086</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
                        <Mail className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold">Email</h3>
                        <p className="text-muted-foreground">
                          info@themindpointmhs.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
                        <Clock className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold">Business Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Friday: 9:00 AM - 6:00 PM
                        </p>
                        <p className="text-muted-foreground">
                          Saturday: 10:00 AM - 4:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
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
                        {status === "Sending..."
                          ? "Sending..."
                          : "Send Message"}
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

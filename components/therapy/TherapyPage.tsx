"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock3, Heart, Lock, MessageCircle } from "lucide-react";

import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { TherapyWaitlistForm } from "@/components/therapy/TherapyWaitlistForm";
import type { PublicCourse } from "@/lib/backend";

interface TherapyPageProps {
  courses: PublicCourse[];
}

const REASSURANCES = [
  {
    icon: Lock,
    title: "Confidential",
    body: "What you bring stays between you and your therapist. Nothing is shared without your consent.",
  },
  {
    icon: MessageCircle,
    title: "Online, from anywhere",
    body: "Every session is a private video call. No travel, no waiting rooms — join from a place you feel safe.",
  },
  {
    icon: Heart,
    title: "No diagnosis needed",
    body: "You don't have to name the problem to start. 'Something feels off' is reason enough.",
  },
];

const STEPS = [
  {
    title: "Join the waitlist",
    body: "Tell us what kind of support you're looking for and how to reach you. It takes a minute.",
  },
  {
    title: "A short fit call",
    body: "We offer a free 15-minute call to understand what you need and answer your questions.",
  },
  {
    title: "We match you",
    body: "We suggest a therapist and a time. If it doesn't feel right, we'll help you change.",
  },
];

const FAQ = [
  {
    q: "Is everything I say confidential?",
    a: "Yes. Sessions are private and your therapist will explain the few legal limits (for example, immediate risk of harm) before you begin. Nothing else leaves the room.",
  },
  {
    q: "Which kind of therapy should I choose?",
    a: "If you're not sure, choose 'I'm not sure yet'. We'll suggest the best fit on the fit call rather than leaving you to guess.",
  },
  {
    q: "How long is a session, and how often?",
    a: "Most individual sessions are 50 minutes; couples and pre-marital sessions run 75 minutes. Most people begin weekly or fortnightly, then space sessions out as things settle.",
  },
  {
    q: "Do you offer in-person sessions?",
    a: "No — everything at The Mind Point is online. You'll need a private space and a stable connection, not a commute.",
  },
  {
    q: "I'm not sure I 'need' therapy.",
    a: "You don't need a crisis to benefit. Many people come to think out loud, understand a pattern, or steady themselves through a hard season.",
  },
  {
    q: "Can I change therapists or pause?",
    a: "Yes. The fit matters more than the schedule. Tell us and we'll arrange a change or a pause — no awkwardness.",
  },
];

function sessionMinutes(name: string): number {
  return /couples|marital/i.test(name) ? 75 : 50;
}

export function TherapyPage({ courses }: TherapyPageProps) {
  const [offeringId, setOfferingId] = useState<string>(courses[0]?._id ?? "");
  const offerings = courses.map((course) => ({
    id: course._id as unknown as string,
    title: course.name,
  }));

  const chooseOffering = (id: string) => {
    setOfferingId(id);
    if (typeof document !== "undefined") {
      document
        .getElementById("therapy-waitlist")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-3xl">
          <span className={eyebrowVariants()}>Therapy &amp; Counselling</span>
          <h1 className="font-display mt-5 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            You don&rsquo;t have to carry it alone.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            One-to-one online therapy with a licensed professional.
            Confidential, unhurried, and shaped around you — not a course, not a
            programme. Just a steady hour that is yours, wherever you are.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => chooseOffering(offeringId)}
              className="bg-primary text-primary-foreground rounded-full px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase"
            >
              Join the waitlist
            </button>
            <span className="text-muted-foreground text-sm">
              We reply like people, within 48–72 hours on working days.
            </span>
          </div>
        </div>
      </section>

      {/* Reassurances */}
      <section className="bg-secondary py-16 sm:py-20">
        <div className="container grid gap-8 sm:grid-cols-3">
          {REASSURANCES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <Icon className="text-primary h-5 w-5" />
                <h3 className="font-display mt-4 text-xl">{item.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ways we can work together */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <span className={eyebrowVariants()}>Ways we can work together</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Find the shape that fits you.
            </h2>
            <p className="text-muted-foreground mt-4">
              Every session is one to one, online, and confidential. Choose the
              one that sounds most like you — or let us help you decide.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course._id}
                className="border-border bg-card flex flex-col rounded-2xl border p-6"
              >
                <h3 className="font-display text-xl leading-snug">
                  {course.name}
                </h3>
                <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
                  {course.description}
                </p>
                <div className="border-border mt-5 flex items-center justify-between border-t border-dashed pt-4">
                  <div>
                    <div className="font-display text-lg">
                      ₹{course.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock3 className="h-3 w-3" />
                      {sessionMinutes(course.name)} min · online
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      chooseOffering(course._id as unknown as string)
                    }
                    className="text-primary text-[0.7rem] font-semibold tracking-[0.16em] uppercase"
                  >
                    Join the waitlist →
                  </button>
                </div>
              </article>
            ))}
          </div>

          <p className="text-muted-foreground mt-8 max-w-3xl text-sm leading-relaxed">
            Therapy usually works best over time. If you&rsquo;d like to commit
            to a few sessions, we offer gentle packages: <b>4 sessions</b> at
            10% off, <b>6</b> at 15% off, and <b>10</b> at 20% off. Pre-marital
            counselling is also available as a package. We&rsquo;ll share exact
            pricing when registration opens.
          </p>
        </div>
      </section>

      {/* What happens next */}
      <section className="bg-secondary py-16 sm:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <span className={eyebrowVariants()}>What happens next</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Three small, unhurried steps.
            </h2>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="font-display text-primary text-3xl">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-3 text-xl">{step.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Waitlist */}
      <section id="therapy-waitlist" className="scroll-mt-24 py-16 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <span className={eyebrowVariants()}>Take the first step</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Join the waitlist.
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              We&rsquo;re taking a short pause before opening new therapy slots.
              Leave your details and we&rsquo;ll reach out, personally, as soon
              as we can offer you a time.
            </p>
            <div className="border-border bg-card mt-8 rounded border border-dashed p-6">
              <b>In crisis?</b> Please contact Tele-MANAS on 14416, or your
              local emergency service, right away. We are not an emergency
              service.
            </div>
          </div>
          <TherapyWaitlistForm
            offerings={offerings}
            offeringId={offeringId}
            onOfferingChange={setOfferingId}
          />
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary py-16 sm:py-24">
        <div className="container max-w-3xl">
          <span className={eyebrowVariants()}>
            In case you&rsquo;re wondering
          </span>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            A few gentle answers.
          </h2>
          <dl className="mt-10 space-y-8">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-display text-lg">{item.q}</dt>
                <dd className="text-muted-foreground mt-2 leading-relaxed">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-10 text-sm">
            Still unsure?{" "}
            <Link
              href="/contact"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Talk to us
            </Link>{" "}
            — a simple conversation, no commitment.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="py-16 sm:py-20">
        <div className="container flex max-w-2xl flex-col items-start gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-primary h-4 w-4" />
            Online, confidential, and led by a licensed professional.
          </div>
          <button
            type="button"
            onClick={() => chooseOffering(offeringId)}
            className="bg-primary text-primary-foreground rounded-full px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase"
          >
            Join the waitlist
          </button>
        </div>
      </section>
    </div>
  );
}

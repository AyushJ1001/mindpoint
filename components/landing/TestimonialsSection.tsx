"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VIDEO_TESTIMONIALS } from "@/lib/videoTestimonials";
import { Play } from "lucide-react";
import { GrowthIllustration, LeafAccent } from "@/components/illustrations";

const TEXT_TESTIMONIALS = [
  {
    quote:
      "I finally understood why my mind keeps overthinking everything. The tools I learned here actually work.",
    initials: "S.K.",
    context: "Intern",
  },
  {
    quote:
      "I came in confused about my career path. Now I'm a practicing counsellor.",
    initials: "R.M.",
    context: "Certificate Graduate",
  },
  {
    quote: "What sets TMP apart is the community. You're never learning alone.",
    initials: "A.P.",
    context: "Diploma Student",
  },
];

function FeaturedVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const featuredVideo = VIDEO_TESTIMONIALS[0];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "50px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoaded]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!featuredVideo) return null;

  return (
    <div
      ref={containerRef}
      className="brand-panel relative aspect-[9/16] overflow-hidden rounded-[2rem] p-2"
    >
      <div className="bg-muted relative h-full overflow-hidden rounded-[1.6rem]">
        {isLoaded && (
          <video
            ref={videoRef}
            src={featuredVideo.videoUrl}
            className="h-full w-full object-cover"
            playsInline
            controls={isPlaying}
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
          />
        )}
        {!isPlaying && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-[#0f4d4d]/15 transition-colors hover:bg-[#0f4d4d]/25"
            aria-label="Play testimonial video"
          >
            <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full shadow-xl">
              <Play className="ml-1 h-6 w-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="brand-section-tint home-section-md relative overflow-hidden border-y border-primary/5">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl">
            <div className="relative mb-12 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="brand-gold-rule" aria-hidden="true" />
                <span className="brand-kicker">Student voices</span>
                <span className="brand-gold-rule" aria-hidden="true" />
              </div>
              <h2 className="font-display text-foreground mt-4 text-4xl leading-tight font-medium sm:text-5xl">
                What learners carry with them
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-8">
                Real reflections from people who have learned, practised, and
                grown with The Mind Point.
              </p>
              <LeafAccent className="pointer-events-none absolute -top-3 right-[12%] hidden h-10 w-10 rotate-[25deg] opacity-25 lg:block" />
            </div>

            <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
              <div className="grid gap-5">
                {TEXT_TESTIMONIALS.map((t, index) => (
                  <ScrollReveal
                    key={t.initials}
                    transitionDelayMs={index * 90}
                  >
                    <blockquote className="brand-card relative overflow-hidden rounded-[1.7rem] px-6 py-6 sm:px-7">
                      <span
                        className="font-display text-primary/12 pointer-events-none absolute top-1 left-4 text-6xl leading-none select-none"
                        aria-hidden="true"
                      >
                        &ldquo;
                      </span>
                      <p className="text-foreground relative text-base leading-8 sm:text-lg">
                        {t.quote}
                      </p>
                      <footer className="mt-4 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-primary/70 uppercase">
                        <span className="h-px w-7 bg-[#b79755]" />
                        {t.initials} · {t.context}
                      </footer>
                    </blockquote>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal>
                <FeaturedVideo />
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="pointer-events-none absolute -top-6 left-[5%] hidden select-none opacity-[0.08] mix-blend-multiply lg:block dark:mix-blend-screen">
        <GrowthIllustration className="h-14 w-20 -rotate-[12deg]" />
      </div>
    </section>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VIDEO_TESTIMONIALS } from "@/lib/videoTestimonials";
import { Play } from "lucide-react";

const TEXT_TESTIMONIALS = [
  {
    quote:
      "The supervised sessions changed my practice completely. I finally felt confident enough to take on clients.",
    initials: "S.K.",
    context: "Intern",
  },
  {
    quote:
      "I joined as a hobbyist learner and ended up discovering a career I love.",
    initials: "R.M.",
    context: "Certificate Graduate",
  },
  {
    quote:
      "What sets TMP apart is the community. You're never learning alone.",
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
      className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-muted"
    >
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
          className="absolute inset-0 flex items-center justify-center bg-foreground/10 transition-colors hover:bg-foreground/20"
          aria-label="Play testimonial video"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="ml-1 h-6 w-6" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Trusted by 10,000+ learners
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Real experiences from people who&apos;ve walked this path
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {/* Text testimonial cards */}
          <div className="flex flex-col gap-6 md:col-span-2">
            {TEXT_TESTIMONIALS.map((t, index) => (
              <ScrollReveal key={t.initials}>
                <article
                  className="rounded-2xl border border-border bg-card p-6"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <blockquote className="text-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="text-muted-foreground mt-4 text-sm">
                    — {t.initials}, {t.context}
                  </footer>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {/* Featured video */}
          <ScrollReveal className="md:col-span-1">
            <FeaturedVideo />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

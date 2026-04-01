"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VIDEO_TESTIMONIALS } from "@/lib/videoTestimonials";
import { Play } from "lucide-react";

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
      className="border-border bg-muted relative aspect-[9/16] overflow-hidden rounded-2xl border"
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
          className="bg-foreground/10 hover:bg-foreground/20 absolute inset-0 flex items-center justify-center transition-colors"
          aria-label="Play testimonial video"
        >
          <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full shadow-lg">
            <Play className="ml-1 h-6 w-6" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="home-section-md">
      <div className="container">
        <ScrollReveal>
          <div className="home-shell mx-auto max-w-6xl px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-10 text-center">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Social proof, without the hard sell
              </span>
              <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Trusted by 10,000+ learners
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                Real experiences from people who&apos;ve walked this path
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-6 md:col-span-2">
                {TEXT_TESTIMONIALS.map((t, index) => (
                  <ScrollReveal key={t.initials}>
                    <article
                      className="home-subpanel rounded-[1.4rem] px-6 py-6"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <blockquote className="text-foreground leading-8">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                      <footer className="text-muted-foreground mt-4 text-sm tracking-[0.12em] uppercase">
                        {t.initials}, {t.context}
                      </footer>
                    </article>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal className="md:col-span-1">
                <FeaturedVideo />
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { ctaVariants } from "@/components/coastal/cta";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  VIDEO_TESTIMONIALS,
  type VideoTestimonial,
} from "@/lib/videoTestimonials";

// The five recordings are real student reflections, already used on the course
// pages. No names are attached, so every card is labelled plainly.
export default function CoastalVideoTestimonials() {
  const [selected, setSelected] = useState<VideoTestimonial | null>(null);
  const [open, setOpen] = useState(false);

  if (VIDEO_TESTIMONIALS.length === 0) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => setSelected(null), 200);
    }
  };

  return (
    <section className="water-band-mist py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className={eyebrowVariants()}>Hear it from them</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              The teaching, in their own voices.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Short, unedited reflections from students who finished a cohort.
          </p>
        </div>

        <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
          {VIDEO_TESTIMONIALS.map((testimonial, i) => (
            <li
              key={testimonial.id}
              className="w-[62%] shrink-0 snap-start sm:w-auto"
            >
              <ScrollReveal transitionDelayMs={i * 60}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(testimonial);
                    setOpen(true);
                  }}
                  className="water-glass group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#2b8585] focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label={`Play student reflection ${i + 1}`}
                >
                  <video
                    src={testimonial.videoUrl}
                    preload="metadata"
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#0f2a28]/75 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="text-primary flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 h-6 w-6" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-4 text-left text-[0.62rem] font-semibold tracking-[0.24em] text-white/90 uppercase">
                    Student story
                  </span>
                </button>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href="/programs" className={ctaVariants({ layout: "flex" })}>
            Find your programme <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-sm overflow-hidden p-0">
          <DialogTitle className="sr-only">
            Student video reflection
          </DialogTitle>
          <DialogDescription className="sr-only">
            A recorded reflection from a Mind Point student.
          </DialogDescription>
          {selected && (
            <div className="relative aspect-[9/16] max-h-[85vh] w-full bg-black">
              <video
                src={selected.videoUrl}
                controls
                playsInline
                autoPlay
                preload="metadata"
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

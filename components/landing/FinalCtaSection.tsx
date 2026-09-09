import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <Image
        src="/illustrations/hope.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0f4d4d]/95 via-[#173f3d]/90 to-[#0f4d4d]/72"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(142,193,195,0.22),transparent_28rem)]"
        aria-hidden="true"
      />

      <div className="relative z-10 container">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-[#c7a768]" aria-hidden="true" />
              <span className="text-[#9fd0cf] text-xs font-semibold tracking-[0.3em] uppercase">
                Your next point
              </span>
              <span className="h-px w-12 bg-[#c7a768]" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-5 text-4xl leading-tight font-medium text-[#faf8f3] sm:text-5xl lg:text-6xl">
              You do not have to know the whole path.
              <span className="block italic text-[#b9dedd]">
                Just choose the next meaningful step.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#d8e4e1]">
              Learn something new, find support, or begin building the skills
              that move you toward the work and life you want.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full bg-[#faf8f3] px-7 text-[#0f4d4d] hover:bg-white"
                asChild
              >
                <Link href="/courses">
                  Explore programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/courses/therapy">Explore personal support</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

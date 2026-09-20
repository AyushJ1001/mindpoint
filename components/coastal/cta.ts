import { cva } from "class-variance-authority";

export const ctaVariants = cva(
  "rounded-full bg-primary px-7 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase transition-transform hover:-translate-y-0.5",
  {
    variants: {
      layout: {
        inline: "inline-block",
        flex: "inline-flex items-center gap-2",
        self: "justify-self-start",
      },
    },
    defaultVariants: {
      layout: "inline",
    },
  },
);

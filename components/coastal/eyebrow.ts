import { cva } from "class-variance-authority";

export const eyebrowVariants = cva(
  "font-semibold uppercase tracking-[0.28em]",
  {
    variants: {
      size: {
        default: "text-[0.7rem]",
        micro: "text-[0.62rem]",
      },
      tone: {
        primary: "text-primary",
        sea: "text-sea",
        muted: "text-muted-foreground",
        light: "text-primary-foreground/60",
      },
      leading: {
        normal: "",
        relaxed: "leading-relaxed",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "primary",
      leading: "normal",
    },
  },
);

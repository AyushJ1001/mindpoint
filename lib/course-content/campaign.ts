import type { CampaignCopy } from "@/lib/course-content/types";

/** Site-wide January 2027 campaign copy (owner-supplied). */
export const januaryCampaign: CampaignCopy = {
  eyebrow: "January 2027",
  headline: "Learn differently this January.",
  supporting: "Four programmes. One thoughtful way of learning psychology.",
  lines: [
    "Build the foundations independently.",
    "Learn from faculty live.",
    "Work through real-world cases.",
    "Practise what you've learned.",
    "Leave understanding more than definitions.",
  ],
};

export interface LearningStage {
  key: string;
  label: string;
  description: string;
  part: "foundations" | "applied";
}

/**
 * The TMP learning model every certificate programme follows.
 * LEARN → UNDERSTAND → OBSERVE → APPLY → PRACTISE → INTEGRATE
 */
export const learningModel: LearningStage[] = [
  {
    key: "learn",
    label: "Learn",
    description: "Take in the frameworks, language and evidence at your own pace.",
    part: "foundations",
  },
  {
    key: "understand",
    label: "Understand",
    description: "Make sense of why each idea holds up, and where it breaks down.",
    part: "foundations",
  },
  {
    key: "observe",
    label: "Observe",
    description: "Watch experienced practitioners think through real material.",
    part: "applied",
  },
  {
    key: "apply",
    label: "Apply",
    description: "Bring the framework to cases and see how it behaves.",
    part: "applied",
  },
  {
    key: "practise",
    label: "Practise",
    description: "Rehearse the skills with feedback, in a safe setting.",
    part: "applied",
  },
  {
    key: "integrate",
    label: "Integrate",
    description: "Leave with something you can carry into your own work.",
    part: "applied",
  },
];

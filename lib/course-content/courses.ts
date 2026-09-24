import type { CourseContent } from "@/lib/course-content/types";
import { cbtRebtCbmt } from "@/lib/course-content/cbt-rebt-cbmt";
import { counsellingInternship } from "@/lib/course-content/counselling-internship";
import { innerChildHealing } from "@/lib/course-content/inner-child-healing";
import { personalityDisorders } from "@/lib/course-content/personality-disorders";

export const courses: CourseContent[] = [
  cbtRebtCbmt,
  innerChildHealing,
  personalityDisorders,
  counsellingInternship,
];

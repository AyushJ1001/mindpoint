import { Suspense } from "react";
import { CurriculumAuthoringPrototype } from "./curriculum-authoring-prototype";

export default function CurriculumAuthoringPrototypePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f3f8]" />}>
      <CurriculumAuthoringPrototype />
    </Suspense>
  );
}

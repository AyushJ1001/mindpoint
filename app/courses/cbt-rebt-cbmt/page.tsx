import { redirect } from "next/navigation";

// The CBT, REBT and CBMT programme now lives at /programs/cbt-rebt-cbmt.
export default function CbtCoursePage() {
  redirect("/programs/cbt-rebt-cbmt");
}

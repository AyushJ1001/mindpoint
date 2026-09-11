import StudentWorkspacePrototype from "./student-workspace-prototype";

export default function StudentWorkspacePrototypePage() {
  if (process.env.NODE_ENV === "production") return null;
  return <StudentWorkspacePrototype />;
}

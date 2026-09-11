import FacultyWorkspacePrototype from "./faculty-workspace-prototype";

export default function FacultyWorkspacePrototypePage() {
  if (process.env.NODE_ENV === "production") return null;
  return <FacultyWorkspacePrototype />;
}

import RoleDashboardsPrototype from "./role-dashboards-prototype";

export default function RoleDashboardsPrototypePage() {
  if (process.env.NODE_ENV === "production") return null;
  return <RoleDashboardsPrototype />;
}

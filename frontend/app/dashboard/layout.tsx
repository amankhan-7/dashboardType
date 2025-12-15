// app/dashboard/layout.tsx
import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">{children}</main>
    </div>
  );
}

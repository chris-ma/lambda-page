import { Nav } from "@/components/marketing/Nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Nav />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

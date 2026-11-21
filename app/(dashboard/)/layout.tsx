import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { getProfile } from "@/lib/queries/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar storeName={profile.storeName} />
      <main className="flex-1 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

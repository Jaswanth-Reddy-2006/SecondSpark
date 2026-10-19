import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side authentication check: unauthenticated requests are redirected immediately
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </Suspense>
  );
}

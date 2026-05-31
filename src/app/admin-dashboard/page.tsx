"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DashboardProvider, 
  useDashboardState 
} from "@/context/DashboardContext";
import AdminPanel from "@/components/dashboard/admin/AdminPanel";

function AdminPageContent() {
  const router = useRouter();
  const { isAdminMode, authLoading } = useDashboardState();

  useEffect(() => {
    if (!authLoading && !isAdminMode) {
      router.push("/admin-login");
    }
  }, [isAdminMode, authLoading, router]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary animate-spin" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse font-sans">Verifying credentials...</h2>
        </div>
      </div>
    );
  }

  if (!isAdminMode) {
    return null;
  }

  return <AdminPanel />;
}

export default function AdminPage() {
  return (
    <DashboardProvider>
      <AdminPageContent />
    </DashboardProvider>
  );
}

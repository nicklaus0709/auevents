import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import PublicidadTicker from "@/components/public/PublicidadTicker";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <PublicidadTicker />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
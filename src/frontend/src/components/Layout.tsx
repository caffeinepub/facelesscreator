import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Tv2,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/channels", icon: Tv2, label: "Channels" },
  { href: "/scripts", icon: FileText, label: "Scripts" },
  { href: "/ideas", icon: Lightbulb, label: "Ideas Vault" },
  { href: "/monetization", icon: DollarSign, label: "Monetization" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg btn-primary-gradient flex items-center justify-center glow-blue flex-shrink-0">
            <span className="text-white font-bold text-sm font-display">F</span>
          </div>
          <span className="font-bold font-display text-sidebar-foreground text-base">
            FacelessCreator
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              to={
                href as
                  | "/dashboard"
                  | "/channels"
                  | "/scripts"
                  | "/ideas"
                  | "/monetization"
                  | "/analytics"
              }
              onClick={() => setMobileOpen(false)}
              data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-sidebar-primary" : "",
                )}
              />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 text-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-56 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden nav-blur sticky top-0 z-30 flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg btn-primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">
                F
              </span>
            </div>
            <span className="font-bold font-display text-sm">
              FacelessCreator
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

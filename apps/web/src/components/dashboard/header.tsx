"use client";

import { usePathname } from "next/navigation";
import {
  IconMenu2,
  IconMoon,
  IconSun,
  IconChevronRight,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";

interface DashboardHeaderProps {
  user: typeof authClient.$Infer.Session.user;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const title =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    return { title, href, isLast };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1">
          <IconMenu2 className="size-4" />
          <span className="sr-only">Toggle sidebar</span>
        </SidebarTrigger>
        <Separator orientation="vertical" className="mr-2 h-4" />

        <nav className="flex items-center text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href}>
              {index > 0 && (
                <IconChevronRight className="mx-2 size-4 text-muted-foreground/50" />
              )}
              {item.isLast ? (
                <span className="text-foreground">{item.title}</span>
              ) : (
                <Link
                  href={item.href as any}
                  className="hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2 hover:bg-primary/10 hover:text-primary"
      >
        <IconSun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <IconMoon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}

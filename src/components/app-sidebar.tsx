"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/config/nav";
import Link from "next/link";
import { Building2Icon, ChevronRight } from "lucide-react";
import { AppFooter } from "./app-footer";
import { useHasPermission } from "@/hooks/use-permissions";
import { useSession } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";
import { RoleDisplay, roleMap } from "./role-display";
import { RoleKey } from "@/lib/permissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = (path?: string) =>
    pathname === path || pathname?.startsWith(`${path}/`);

  const roles = session?.user.role?.split(",").map((r) => r.trim()) || [];

  const firstValidRole = roles.find((role) => {
    return (
      role in roleMap && roleMap[role as RoleKey].label !== roleMap.user.label
    );
  });

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-grid border-b h-14 flex justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent hover:text-inherit active:bg-transparent active:text-inherit"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{siteConfig.name}</span>
                  <span className="font-semibold">
                    <RoleDisplay role={firstValidRole as RoleKey} />
                  </span>
                </div>
                <span className="truncate text-xs">
                  {siteConfig.description}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  isActive={isActive(item.link)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AppFooter />
    </Sidebar>
  );
}

function NavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { data: hasAccess } = useHasPermission({
    [item.permissions]: ["view"],
  });
  const [isOpenManually, setIsOpenManually] = useState(false);

  if (!hasAccess || !hasAccess.success) return null;

  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is active
  const isChildActive = item.children?.some(
    (child) => pathname === child.link || pathname === `${child.link}/`
  );

  // Parent is only active if exact path
  const isParentActive = pathname === item.link || pathname === `${item.link}/`;

  // Open if child is active or manually toggled
  const isOpen = isChildActive || isOpenManually;

  if (hasChildren) {
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setIsOpenManually((prev) => !prev)}
            isActive={isParentActive}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="size-4" />
                {open && <span>{item.label}</span>}
              </div>
              <span
                className={`transition-transform duration-200 ease-in-out ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                <ChevronRight className="size-3 text-muted-foreground" />
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {isOpen && open && (
          <div className="ml-4 space-y-1">
            {item.children!.map((child) => {
              const isChildCurrentlyActive =
                pathname === child.link || pathname === `${child.link}/`;
              return (
                <NavItem
                  key={child.label}
                  item={child}
                  isActive={isChildCurrentlyActive}
                />
              );
            })}
          </div>
        )}
      </>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.link!} className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Loader2Icon, Mail, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { useGetUserById } from "@/hooks/use-auth";
import { RoleDisplay, roleMap } from "./role-display";
import { RoleKey } from "@/lib/permissions";
import { username } from "better-auth/plugins";

export function UserInfoCard({
  userId,
  userName,
}: {
  userId: string;
  userName?: string;
}) {
  const { data, isLoading } = useGetUserById({ userId });
  // Generate a consistent color based on user ID for the banner
  const getBannerColor = (id: string) => {
    const colors = [
      "bg-rose-500",
      "bg-pink-500",
      "bg-fuchsia-500",
      "bg-purple-500",
      "bg-violet-500",
      "bg-indigo-500",
      "bg-sky-500",
      "bg-cyan-500",
      "bg-teal-500",
      "bg-emerald-500",
      "bg-green-500",
      "bg-lime-500",
      "bg-yellow-500",
      "bg-amber-500",
      "bg-orange-500",
      "bg-red-500",
    ];
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const roles = data?.role?.split(",").map((r) => r.trim()) || [];

  const firstValidRole = roles.find((role) => {
    return (
      role in roleMap && roleMap[role as RoleKey].label !== roleMap.user.label
    );
  });

  if (!firstValidRole || !(firstValidRole in roleMap)) return null;
  return (
    <HoverCard>
      <HoverCardTrigger className="underline-offset-4 hover:underline cursor-pointer">
        {userName}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2Icon className="animate-spin w-5 h-5 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Banner */}
            <div
              className={cn(
                "h-20",
                data?.id ? getBannerColor(data.id) : "bg-gray-500"
              )}
            />

            {/* Profile content */}
            <div className="px-4 pb-4 pt-6 relative">
              {/* Avatar - positioned to overlap banner */}
              <div className="absolute -top-10 left-4 rounded-full">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={data?.image ?? ""} />
                  <AvatarFallback className="text-lg">
                    {data?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User info */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{data?.name}</h3>

                    <RoleDisplay role={firstValidRole as RoleKey} />
                    {data?.role === "admin" && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{userName}</p>
                </div>

                {/* {roles.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{roles.map((role) => (
											<RoleDisplay key={role} role={role} />
										))}
									</div>
								)} */}
                {/* Separator */}
                {/* <div className="h-px bg-border" /> */}
                <Separator />

                {/* Additional info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    About Me
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{data?.email}</span>
                  </div>
                </div>

                {/* Member since */}
                {data?.createdAt && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                      Member Since
                    </h4>
                    <p className="text-xs">
                      {new Date(data.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

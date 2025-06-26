"use client";

import { RoleDisplay } from "@/components/role-display";
import { Badge } from "@/components/ui/badge";
import { UserInfoCard } from "@/components/user-info-card";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { ActionsCell } from "./actions-cell";
import { getFormattedDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { UserWithRole } from "better-auth/plugins";
import { RoleKey } from "@/lib/permissions";

export const columns: ColumnDef<UserWithRole>[] = [
  {
    header: "Name",
    accessorKey: "name",
    // cell: ({ row }) => {
    //   const { name, id } = row.original;
    //   return <UserInfoCard userId={id} userName={name} />;
    // },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="flex items-center gap-2">
          {user.email}{" "}
          {user.emailVerified ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : (
            <XCircleIcon className="w-4 h-4" />
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const roles =
        user.role?.split(",").map((role: string) => role.trim()) ?? [];

      return (
        <div className="flex flex-wrap gap-2">
          {roles.map((role: string, idx: number) => (
            <RoleDisplay key={idx} role={role as RoleKey} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return getFormattedDate(row.original.createdAt);
    },
  },
  {
    accessorKey: "banned",
    header: "Banned",
    cell: ({ row }) => {
      const user = row.original;

      if (!user.banned) {
        return <Badge variant="outline">No</Badge>;
      }

      const banExpires = user.banExpires ? new Date(user.banExpires) : null;
      const timeLeftText =
        banExpires && formatDistanceToNow(banExpires, { addSuffix: true });

      return (
        <HoverCard>
          <HoverCardTrigger>
            <Badge variant={user.banned ? "destructive" : "outline"}>
              {user.banned ? "Yes" : "No"}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent align="start">
            <p className="font-semibold mb-1">Reason</p>
            <p className="mb-2">{user.banReason || "No reason provided"}</p>
            <p className="font-semibold">Expires</p>
            <p>{timeLeftText}</p>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionsCell user={row.original} />;
    },
  },
];

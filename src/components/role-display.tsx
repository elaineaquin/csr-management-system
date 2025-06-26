import React from "react";
import {
  ShieldCheck,
  User,
  Users,
  Briefcase,
  DollarSign,
  Handshake,
  Heart,
  HelpCircle,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { RoleKey } from "@/lib/permissions";

export interface RoleDisplayProps {
  role: RoleKey;
}

export const roleMap: Record<
  RoleKey,
  { label: string; icon: React.ReactNode; description?: string }
> = {
  admin: {
    label: "Admin",
    icon: (
      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
    ),
    description: "Administrator with full system access",
  },
  user: {
    label: "User",
    icon: <User className="w-4 h-4 text-gray-600 dark:text-gray-300 mr-2" />,
    description: "Regular system user",
  },
  u1: {
    label: "CSR POC",
    icon: (
      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
    ),
    description: "Liaisons for CSR-related communication",
  },
  u2: {
    label: "Approvers",
    icon: (
      <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
    ),
    description: "Directors, CEOs, and decision makers",
  },
  u3: {
    label: "Finance",
    icon: (
      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
    ),
    description: "Handles financial and purchasing operations",
  },
  u4: {
    label: "Partner Org",
    icon: (
      <Handshake className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
    ),
    description: "External partners and collaborators",
  },
  u5: {
    label: "Volunteers",
    icon: <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400 mr-2" />,
    description: "Volunteers supporting the organization",
  },
};

export function RoleDisplay({ role }: RoleDisplayProps) {
  const roleInfo = roleMap[role] ?? {
    label: role,
    icon: <HelpCircle className="w-4 h-4 text-muted-foreground mr-2" />,
    description: "Unknown role",
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className="flex items-center cursor-pointer bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/60"
        >
          {roleInfo.icon}
          <span>{roleInfo.label}</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 text-sm text-muted-foreground bg-background border border-border shadow-md dark:bg-background dark:text-muted-foreground">
        {roleInfo.description}
      </HoverCardContent>
    </HoverCard>
  );
}

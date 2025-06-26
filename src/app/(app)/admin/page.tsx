"use client";

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { SectionWrapper } from "@/components/section-wrapper";
import { UserManagement } from "./_components/user-management";
import { AccessGuard } from "@/components/access-guard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function AdminPage() {
  return (
    <AccessGuard page="adminPanel">
      <PageHeader>
        <div className="flex flex-col items-start gap-2">
          <PageHeaderHeading>Admin Panel</PageHeaderHeading>
          <PageHeaderDescription>
            Manage your application settings and users
          </PageHeaderDescription>
        </div>
        <PageActions>
          <Button asChild>
            <Link href="/admin/add-users">
              <UserPlus /> Add Users
            </Link>
          </Button>
        </PageActions>
      </PageHeader>
      <SectionWrapper>
        <UserManagement />
      </SectionWrapper>
    </AccessGuard>
  );
}

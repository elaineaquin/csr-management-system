"use client";

import { Badge } from "@/components/ui/badge";
import { UserInfoCard } from "@/components/user-info-card";
import { CalendarIcon, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { VolunteerRequestType } from "@/server/volunteer";
import { ButtonGuard } from "@/components/button-guard";
import Link from "next/link";
import { VolunteerApplicationForm } from "@/components/application-form";

export function PostRequest({ request }: { request: VolunteerRequestType }) {
  const { data: session } = useSession();
  const isOwner = request.createdById === session?.user.id;

  return (
    <Card key={request.id} className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{request.project.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Created by
              <UserInfoCard
                userId={request.createdById}
                userName={request.createdBy.name}
              />
            </CardDescription>
          </div>
          <Badge variant={request.status === "Open" ? "default" : "secondary"}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-1">Request Message</h4>
        <p className="text-sm text-muted-foreground">{request.message}</p>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            Posted{" "}
            {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
            })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>
              Seeking {request.participantLimit} volunteer
              {request.participantLimit > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={"outline"} asChild>
            <Link href={`/project/participate/${request.id}`}>View More</Link>
          </Button>
          {!isOwner && (
            <ButtonGuard name="volunteer" actions={["participate"]}>
              <VolunteerApplicationForm
                requestId={request.id}
                requestStatus={request.status}
              />
            </ButtonGuard>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

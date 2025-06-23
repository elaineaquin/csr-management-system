"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserInfoCard } from "@/components/user-info-card";
import { getFormattedDate } from "@/lib/utils";
import { CalendarIcon, UserIcon, Eye, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ButtonGuard } from "@/components/button-guard";
import { VolunteerType } from "@/server/volunteer";

interface VolunteerCardProps {
  volunteer: VolunteerType;
  isCurrentUser: boolean;
  isOwner?: boolean;
  onApprove: (volunteerId: string) => void;
  onReject: (volunteerId: string) => void;
  onEditAvailability: () => void;
}

export function VolunteerCard({
  volunteer,
  isCurrentUser,
  isOwner = false,
  onApprove,
  onReject,
  onEditAvailability,
}: VolunteerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const [viewAnswersOpen, setViewAnswersOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow mb-2">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserInfoCard
              userId={volunteer.user.id}
              userName={volunteer.user.name}
            />
            <Badge className={`text-xs ${getStatusColor(volunteer.status)}`}>
              {volunteer.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Joined {getFormattedDate(volunteer.joinedAt)}
          </p>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Availability: </span>
            {volunteer.availability.length > 0 ? (
              <span className="text-foreground">
                {volunteer.availability.map((a) => a.day).join(", ")}
              </span>
            ) : (
              <span className="text-destructive">Not set</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewAnswersOpen(true)}
          className="flex items-center gap-1"
          title="View application answers"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {volunteer.status === "Pending" && (
          <ButtonGuard
            isOwner={isOwner}
            name="volunteer"
            actions={["approve", "reject"]}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => onApprove(volunteer.id)}
              title="Approve volunteer"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => onReject(volunteer.id)}
              title="Reject volunteer"
            >
              <X className="h-4 w-4" />
            </Button>
          </ButtonGuard>
        )}

        {isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditAvailability}
            className="flex items-center gap-1"
            title="Edit availability"
          >
            <CalendarIcon className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <Dialog open={viewAnswersOpen} onOpenChange={setViewAnswersOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Volunteer Application Answers</DialogTitle>
            <DialogDescription>
              {volunteer.user.name}&lsquo;s responses to the application form
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(volunteer.volunteerForm ?? []).length > 0 ? (
              volunteer.volunteerForm!.map((form, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Motivation
                    </h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {form.motivation || "No response provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Experience
                    </h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {form.experience || "No response provided"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No volunteer form submitted.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

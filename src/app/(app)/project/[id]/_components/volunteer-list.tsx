"use client";

import {
  useApproveVolunteer,
  useGetParicipantsByProjectId,
  useRejectVolunteer,
} from "@/hooks/use-volunteer";
import { VolunteerCard } from "../../_components/volunteer-card";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { EditAvailabilityDialog } from "@/components/edit-availability";

export function VolunteerList({ id }: { id: string }) {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useGetParicipantsByProjectId({
    projectId: id,
  });
  const [showAvailability, setShowAvailability] = useState(false);

  const { mutateAsync: approveVolunteer } = useApproveVolunteer();
  const { mutateAsync: rejectVolunteer } = useRejectVolunteer();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg bg-muted animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No volunteers yet.</p>;
  }

  const handleSaveAvailability = async () => {
    await refetch();
  };

  return (
    <div className="space-y-2">
      {data.map((volunteer) => {
        const isUser = volunteer.userId === session?.user.id;
        return (
          <div key={volunteer.id}>
            <VolunteerCard
              volunteer={volunteer}
              isCurrentUser={isUser}
              onEditAvailability={() => setShowAvailability(true)}
              onApprove={async (volunteerId) => {
                toast.promise(
                  approveVolunteer(volunteerId).then(() => refetch()),
                  {
                    loading: "Approving volunteer...",
                    success: "Volunteer approved!",
                    error: "Failed to approve volunteer.",
                  }
                );
              }}
              onReject={async (volunteerId) => {
                toast.promise(
                  rejectVolunteer(volunteerId).then(() => refetch()),
                  {
                    loading: "Rejecting volunteer...",
                    success: "Volunteer rejected!",
                    error: "Failed to reject volunteer.",
                  }
                );
              }}
            />{" "}
            <EditAvailabilityDialog
              volunteerId={volunteer.id}
              initialAvailability={volunteer.availability.map((a) => a.day)}
              onSave={handleSaveAvailability}
              open={showAvailability}
              onOpenChange={setShowAvailability}
            />
          </div>
        );
      })}
    </div>
  );
}

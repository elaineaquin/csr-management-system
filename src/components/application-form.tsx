"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useParticipateRequest } from "@/hooks/use-volunteer";
import { useSession } from "@/lib/auth-client";
import type { VolunteerRequestStatus } from "@prisma/client";
import {
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface VolunteerApplicationFormProps {
  requestId: string;
  requestStatus: VolunteerRequestStatus;
  title?: string;
  description?: string;
}

export function VolunteerApplicationForm({
  requestId,
  requestStatus,
  title = "Volunteer Application",
  description = "Please select the days you're available to volunteer. This information will be shared with the project team.",
}: VolunteerApplicationFormProps) {
  const [step, setStep] = useState(1); // 1 = day selection, 2 = extra questions
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: participate } = useParticipateRequest();
  const { data: session } = useSession();

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectAllDays = () => {
    setSelectedDays(daysOfWeek);
  };

  const clearAllDays = () => {
    setSelectedDays([]);
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      toast.warning("Selection Required", {
        description: "Please select at least one day you're available.",
      });
      return;
    }

    if (!session?.user.id) {
      toast.error("Authentication Required", {
        description: "Please log in to submit your application.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await participate({
        requestId: requestId,
        userId: session.user.id,
        availability: selectedDays,
        motivation: motivation.trim(),
        experience: experience.trim(),
      });

      handleClose();
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedDays([]);
    setMotivation("");
    setExperience("");
    setStep(1);
  };

  const isDisabled = requestStatus !== "Open" || !session?.user.id;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isDisabled}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
      >
        {requestStatus === "Open" ? (
          <>
            <Calendar className="mr-2 h-4 w-4" />
            Apply Now
          </>
        ) : (
          "Application Closed"
        )}
      </Button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {description}
            </p>

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllDays}
                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllDays}
                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Days Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500 dark:border-gray-600"
                      />
                      <Label
                        htmlFor={day}
                        className="text-sm font-medium cursor-pointer dark:text-gray-300"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Selection Summary */}
                {selectedDays.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {selectedDays.length} day
                        {selectedDays.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {selectedDays.join(", ")}
                    </div>
                  </div>
                )}

                {/* Validation Message */}
                {selectedDays.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm dark:text-amber-300">
                      Please select at least one day
                    </span>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="motivation" className="dark:text-white">
                    Why do you want to volunteer? *
                  </Label>
                  <textarea
                    id="motivation"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-2"
                    rows={4}
                    placeholder="Tell us about your motivation to volunteer..."
                  />
                </div>
                <div>
                  <Label htmlFor="experience" className="dark:text-white">
                    Do you have any relevant experience?
                  </Label>
                  <textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 mt-2"
                    rows={4}
                    placeholder="Share any relevant experience or skills..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t dark:border-gray-700 p-6">
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>

              {step === 1 ? (
                <Button
                  onClick={() => {
                    if (selectedDays.length === 0) {
                      toast.warning("Please select at least one day");
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={selectedDays.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!motivation.trim() || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

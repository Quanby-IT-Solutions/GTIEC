"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EVENT_DETAILS = {
  name: "Cyber Resilience Summit 2026",
  dates: "May 14–15, 2026",
  time: "10:00 AM – 5:00 PM",
};

interface EventAlertModalProps {
  defaultOpen?: boolean;
}

export function EventAlertModal({
  defaultOpen = true,
}: EventAlertModalProps = {}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    // Show modal every time component mounts
    setOpen(true);
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="border-2 border-chart-1 bg-gradient-to-br from-chart-3 to-chart-2 shadow-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-1 bg-gradient-to-b from-chart-1 via-chart-4 to-chart-2 rounded-full" />
            <AlertDialogTitle className="text-xl font-bold text-chart-5">
              Event Details
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4 py-2">
            {/* Event Name */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-chart-1/30">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">📌</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-chart-4 uppercase tracking-wide">
                  Event Name
                </p>
                <p className="text-sm font-bold text-chart-5 mt-1">
                  {EVENT_DETAILS.name}
                </p>
              </div>
            </div>

            {/* Event Dates */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-chart-2/30">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-2 to-chart-1 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">📅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-chart-1 uppercase tracking-wide">
                  Dates
                </p>
                <p className="text-sm font-bold text-chart-5 mt-1">
                  {EVENT_DETAILS.dates}
                </p>
              </div>
            </div>

            {/* Event Time */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-chart-4/30">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-chart-4 to-chart-2 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">⏰</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-chart-4 uppercase tracking-wide">
                  Time
                </p>
                <p className="text-sm font-bold text-chart-5 mt-1">
                  {EVENT_DETAILS.time}
                </p>
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogAction className="mt-4 w-full bg-gradient-to-r from-chart-1 to-chart-4 text-white hover:opacity-90 transition-opacity">
          Get Started
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}

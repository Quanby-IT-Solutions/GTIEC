"use client";

import { useState } from "react";
import { RegistrationBackgroundMotion } from "@/components/registration/registration-background-motion";
import { RegistrationForm } from "@/components/registration/registration-form";
import { EventAlertModal } from "@/components/event-alert-modal";

export default function RegistrationPage() {
  const [showEventModal, setShowEventModal] = useState(true);
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-chart-3 px-4 py-10 sm:px-6">
      <EventAlertModal />
      <RegistrationBackgroundMotion />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, white 10%, transparent), color-mix(in oklch, var(--chart-1) 12%, transparent))",
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
        <RegistrationForm onSuccessfulSubmit={() => setShowEventModal(true)} />
      </div>
    </main>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRegistrantRegistration } from "@/hooks/use-registrant-registration";

const EVENT_DETAILS = {
  name: "Cyber Resilience Summit 2026",
  dates: "May 14–15, 2026",
  time: "10:00 AM – 5:00 PM",
};

interface RegistrationFormProps {
  onSuccessfulSubmit?: () => void;
}

export function RegistrationForm({
  onSuccessfulSubmit,
}: RegistrationFormProps = {}) {
  const { form, setField, submit, isSubmitting, message, error } =
    useRegistrantRegistration();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsConfirmOpen(true);
  };

  const onConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    await submit();
  };

  useEffect(() => {
    if (!error) return;

    let displayMessage = "Something went wrong. Please try again.";

    if (error.includes("Failed to save")) {
      displayMessage = "We couldn't process your registration. Please try again.";
    } else if (error.includes("required")) {
      displayMessage = "Please fill in all required fields.";
    }

    toast.error(displayMessage, {
      style: {
        background: "var(--chart-5)",
        color: "white",
        border: "1px solid var(--chart-4)",
      },
      duration: 5000,
    });
  }, [error]);

  useEffect(() => {
    if (!message) return;
    toast.success(message, {
      style: {
        background: "var(--chart-1)",
        color: "white",
        border:
          "1px solid color-mix(in oklch, var(--chart-4) 45%, transparent)",
      },
      duration: 5000,
    });

    setIsEventDetailsOpen(true);
    onSuccessfulSubmit?.();
  }, [message, onSuccessfulSubmit]);

  return (
    <>
      <Card className="w-full max-w-xl border border-chart-1/30 bg-white/85 text-slate-800 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-3xl font-semibold text-chart-1">
              Sign Up
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEventDetailsOpen(true)}
              className="h-8 w-8 text-chart-4 hover:bg-chart-3/50 hover:text-chart-1"
              title="View event details"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription className="text-slate-600">
            Fill in your registration details below.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="full_name" className="text-slate-700">
                Full name
              </Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(event) => setField("full_name", event.target.value)}
                placeholder="Juan Dela Cruz"
                required
                className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="company_name" className="text-slate-700">
                Company name
              </Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(event) => setField("company_name", event.target.value)}
                placeholder="GTIEC"
                required
                className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-chart-1 text-white hover:bg-chart-1/90"
            >
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="border border-chart-1/25 bg-white text-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-chart-1">
              Confirm Registration
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Please confirm you want to submit your registration details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={onConfirmSubmit}
              className="bg-chart-1 text-white hover:bg-chart-1/90"
            >
              {isSubmitting ? "Submitting..." : "Yes, Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isEventDetailsOpen}
        onOpenChange={setIsEventDetailsOpen}
      >
        <AlertDialogContent className="border-2 border-chart-1 bg-gradient-to-br from-chart-3 to-chart-2 shadow-lg">
          <AlertDialogHeader>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-chart-1 via-chart-4 to-chart-2" />
              <AlertDialogTitle className="text-xl font-bold text-chart-5">
                Event Details
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription asChild>
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 rounded-lg border border-chart-1/30 bg-white/80 p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-4">
                  <span className="text-lg font-bold text-white">📌</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-chart-4">
                    Event Name
                  </p>
                  <p className="mt-1 text-sm font-bold text-chart-5">
                    {EVENT_DETAILS.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-chart-2/30 bg-white/80 p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2 to-chart-1">
                  <span className="text-lg font-bold text-white">📅</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-chart-1">
                    Dates
                  </p>
                  <p className="mt-1 text-sm font-bold text-chart-5">
                    {EVENT_DETAILS.dates}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-chart-4/30 bg-white/80 p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4 to-chart-2">
                  <span className="text-lg font-bold text-white">⏰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-chart-4">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-bold text-chart-5">
                    {EVENT_DETAILS.time}
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>

          <AlertDialogAction className="mt-4 w-full bg-gradient-to-r from-chart-1 to-chart-4 text-white transition-opacity hover:opacity-90">
            Close
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

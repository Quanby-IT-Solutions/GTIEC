"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

export function RegistrationForm() {
  const { form, setField, submit, isSubmitting, message, error } =
    useRegistrantRegistration();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    toast.error(error);
  }, [error]);

  useEffect(() => {
    if (!message) return;
    toast.success(message, {
      style: {
        background: "var(--chart-1)",
        color: "white",
        border: "1px solid color-mix(in oklch, var(--chart-4) 45%, transparent)",
      },
    });
  }, [message]);

  return (
    <>
      <Card className="w-full max-w-xl border border-chart-1/30 bg-white/85 text-slate-800 shadow-2xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-chart-1">
            Sign Up
          </CardTitle>
          <CardDescription className="text-slate-600">
            Fill in your registration details below.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex items-center gap-3 rounded-2xl border border-chart-1/25 bg-chart-3/70 px-3 py-2">
              <Checkbox
                id="allow_emails"
                checked={form.allow_emails}
                onCheckedChange={(checked) =>
                  setField("allow_emails", checked === true)
                }
              />
              <Label htmlFor="allow_emails" className="text-sm text-slate-700">
                I agree to receive updates by email
              </Label>
            </div>

          <Separator className="bg-chart-1/25" />

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
            <Label htmlFor="email" className="text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="name@company.com"
              required
              className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-3">
              <Label htmlFor="designation" className="text-slate-700">
                Designation
              </Label>
              <Input
                id="designation"
                value={form.designation}
                onChange={(event) =>
                  setField("designation", event.target.value)
                }
                placeholder="Operations Manager"
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
                onChange={(event) =>
                  setField("company_name", event.target.value)
                }
                placeholder="GTIEC"
                required
                className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="mobile_no" className="text-slate-700">
              Mobile number
            </Label>
            <Input
              id="mobile_no"
              value={form.mobile_no}
              onChange={(event) => setField("mobile_no", event.target.value)}
              placeholder="+63 912 345 6789"
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
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
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
    </>
  );
}

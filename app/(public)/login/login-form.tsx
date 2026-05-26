"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      toast.error("Invalid admin email or password.");
      return;
    }

    toast.success("Login successful.", {
      style: {
        background: "var(--chart-1)",
        color: "white",
        border:
          "1px solid color-mix(in oklch, var(--chart-4) 45%, transparent)",
      },
    });

    router.push(result.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <Card className="relative z-10 w-full max-w-md border-chart-1/30 bg-white/90 shadow-2xl backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-3xl font-semibold text-chart-1">
            Admin Login
          </CardTitle>
          <CardDescription className="text-slate-600">
            Sign in with your admin credentials.
          </CardDescription>
        </div>

        <img src="/images/qby.png" className="w-16 h-16" alt="" />
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="h-11 border-chart-1/30 bg-white text-slate-800 placeholder:text-slate-400"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-chart-1 text-white hover:bg-chart-1/90"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

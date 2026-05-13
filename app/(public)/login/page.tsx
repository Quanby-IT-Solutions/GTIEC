import { Suspense } from "react";

import { LoginForm } from "./login-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginFallback() {
  return (
    <Card className="relative z-10 w-full max-w-md border-chart-1/30 bg-white/90 shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold text-chart-1">
          Admin Login
        </CardTitle>
        <CardDescription className="text-slate-600">
          Sign in with your admin credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[172px]" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-chart-3 px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, color-mix(in oklch, var(--chart-1) 18%, white), color-mix(in oklch, var(--chart-2) 60%, white))",
        }}
      />
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

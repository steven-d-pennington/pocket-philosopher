"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: mode === "login" ? "signIn" : "signUp",
            email,
            password,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const errorMsg = payload?.error ?? "Request failed";
          toast.error(mode === "login" ? "Login failed" : "Signup failed", { description: errorMsg });
          throw new Error(errorMsg);
        }

        toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");
        router.replace("/today");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unexpected error. Please try again.");
        }
      }
    });
  };

  const onAnonymousSubmit = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "anonymous",
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const errorMsg = payload?.error ?? "Request failed";
          toast.error("Anonymous login failed", { description: errorMsg });
          throw new Error(errorMsg);
        }

        toast.success("Signed in anonymously!");
        router.replace("/today");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unexpected error. Please try again.");
        }
      }
    });
  };

  const heading = mode === "login" ? "Welcome back" : "Create your account";
  const subheading =
    mode === "login"
      ? "Sign in to continue your Pocket Philosopher practice."
      : "Set up access to the Pocket Philosopher rebuild environment.";

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-sm text-muted-foreground">{subheading}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={6}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={onAnonymousSubmit}
      >
        {isPending ? "Please wait…" : "Continue Anonymously"}
      </Button>
    </form>
  );
}

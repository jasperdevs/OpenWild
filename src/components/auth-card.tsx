"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";

import { useSession } from "@/components/providers/session-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type AuthCardProps = {
  mode: "login" | "register";
  title?: string;
  description?: string;
  nextPath?: string;
};

export function AuthCard({
  mode,
  title,
  description,
  nextPath = "/",
}: AuthCardProps) {
  const router = useRouter();
  const { signIn, register, signInWithGoogle } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setError(null);

    if (mode === "login") {
      signIn({ email, password, firstName, lastName, phone });
    } else {
      register({ email, password, firstName, lastName, phone });
    }

    router.push(nextPath);
  }

  function handleGoogle() {
    signInWithGoogle();
    router.push(nextPath);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {title || (mode === "login" ? "Welcome back" : "Create account")}
          </CardTitle>
          <CardDescription>
            {description ||
              (mode === "login"
                ? "Sign in to search flights and unlock premium tools."
                : "Join GoWilder to save searches, routes, and trip plans locally.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button variant="outline" className="w-full" onClick={handleGoogle}>
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </Button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <Separator className="flex-1" />
            <span>or</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="first-name">
                    First name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="first-name"
                      className="pl-9"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Jamie"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="last-name">
                    Last name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="last-name"
                      className="pl-9"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Rivera"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="traveler@example.com"
                  required
                />
              </div>
            </div>

            {mode === "register" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {mode === "register" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            ) : null}

            <Button className="w-full" type="submit">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Don&apos;t have an account?" : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/register" : "/login"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

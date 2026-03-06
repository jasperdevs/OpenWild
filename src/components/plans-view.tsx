"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { useSession } from "@/components/providers/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  {
    label: "Unlimited flight searches",
    free: "1 free search per week",
    premium: "Unlimited",
  },
  {
    label: "Interactive route maps",
    free: "No",
    premium: "Yes",
  },
  {
    label: "Inbound flight search",
    free: "No",
    premium: "Yes",
  },
  {
    label: "Day-trip builder",
    free: "No",
    premium: "Yes",
  },
  {
    label: "Planner support",
    free: "Basic",
    premium: "Prompt-based planner",
  },
];

export function PlansView() {
  const router = useRouter();
  const { user, upgrade } = useSession();
  const billing = user?.premium ? "yearly" : "monthly";

  function handleUpgrade() {
    if (!user) {
      router.push("/register?next=/plans");
      return;
    }

    upgrade();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Choose Your Plan</h1>
        <p className="text-sm text-muted-foreground">
          Start with the free search flow or unlock the full route-planning toolset.
        </p>
      </div>

      <Tabs value={billing}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic flight search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold">$0</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1 free search per week</p>
              <p>Access to all destinations</p>
              <p>Basic search results</p>
            </div>
            <Button variant="outline" className="w-full" disabled={!user || !user.premium}>
              {user?.premium ? "Previous plan" : "Current plan"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Premium</CardTitle>
              <Badge>Most popular</Badge>
            </div>
            <CardDescription>
              Unlimited searches, inbound routes, day trips, and planner support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-semibold">$5</p>
              <p className="pb-1 text-sm text-muted-foreground">per month on yearly billing</p>
            </div>
            <div className="space-y-2">
              {[
                "Unlimited search volume",
                "Interactive route exploration",
                "Inbound and return-flight workflows",
                "Day trips and local planner support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleUpgrade}>
              {user?.premium ? "Current plan" : "Get Started"}
            </Button>
            {!user ? (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Feature Breakdown</CardTitle>
          <CardDescription>
            The feature table mirrors the original sales page structure without reusing its styling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Free</TableHead>
                <TableHead>Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.label}>
                  <TableCell className="font-medium">{feature.label}</TableCell>
                  <TableCell>{feature.free}</TableCell>
                  <TableCell>{feature.premium}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

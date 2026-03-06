import Link from "next/link";
import { Lock, PlaneTakeoff, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PremiumFeatureTeaserProps = {
  title: string;
  description: string;
  points: string[];
};

export function PremiumFeatureTeaser({
  title,
  description,
  points,
}: PremiumFeatureTeaserProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Lock className="size-5" />
            </div>
            <div>
              <Badge variant="outline">Premium Feature</Badge>
              <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            {points.map((point, index) => (
              <div
                key={point}
                className="rounded-md border border-border/70 bg-background/40 p-4"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {index % 2 === 0 ? (
                    <PlaneTakeoff className="size-4 text-primary" />
                  ) : (
                    <Sparkles className="size-4 text-primary" />
                  )}
                  {point}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/plans">Upgrade to Premium</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { PremiumFeatureTeaser } from "@/components/premium-feature-teaser";
import { useSession } from "@/components/providers/session-provider";
import { FEATURED_METROS, buildPlannerSuggestions } from "@/lib/gowilder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const samplePrompts = [
  "Need a warm weekend escape with the shortest flight possible.",
  "Find me an international option with decent GoWild pricing.",
  "I want a quick mountain trip leaving from Washington D.C.",
];

export function TripPlannerView() {
  const { user } = useSession();
  const [prompt, setPrompt] = useState(samplePrompts[0]);
  const [submittedPrompt, setSubmittedPrompt] = useState(samplePrompts[0]);

  if (!user?.premium) {
    return (
      <PremiumFeatureTeaser
        title="Unlock AI-Powered Trip Planning"
        description="Use a local planning assistant to translate natural language into route suggestions and trip framing."
        points={[
          "Natural language prompt input",
          "GoWild-first route suggestions",
          "Trip summaries with seat posture",
          "Destination matching for quick planning",
        ]}
      />
    );
  }

  const suggestions = buildPlannerSuggestions(submittedPrompt, FEATURED_METROS[0].id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">AI Trip Planner</h1>
        <p className="text-sm text-muted-foreground">
          A local prompt-based planner that mirrors the original product intent without calling a hosted model.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planner prompt</CardTitle>
          <CardDescription>
            Describe the kind of trip you want and the planner will build route candidates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={5}
          />
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample) => (
              <Button
                key={sample}
                variant="outline"
                onClick={() => {
                  setPrompt(sample);
                  setSubmittedPrompt(sample);
                }}
              >
                {sample}
              </Button>
            ))}
          </div>
          <Button onClick={() => setSubmittedPrompt(prompt)} className="gap-2">
            <Sparkles className="size-4" />
            Plan trip
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <CardTitle>{suggestion.title}</CardTitle>
              <CardDescription>{suggestion.rationale}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{suggestion.summary}</p>
              {suggestion.flights.map((flight) => (
                <div
                  key={flight.id}
                  className="rounded-md border border-border/70 bg-background/40 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium">
                        {flight.originCity} ({flight.originCode}) to {flight.destinationCity} ({flight.destinationCode})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {flight.departDateLabel} · {flight.departTime} to {flight.arrivalTime} · {flight.duration}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{flight.passFare}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flight.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tag === "blackout" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

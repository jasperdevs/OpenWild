"use client";

import { useState } from "react";
import { format } from "date-fns";

import { PremiumFeatureTeaser } from "@/components/premium-feature-teaser";
import { useSession } from "@/components/providers/session-provider";
import { FEATURED_METROS, buildDateOptions, buildDayTrips } from "@/lib/gowilder-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function DayTripsView() {
  const { user } = useSession();
  const [metroId, setMetroId] = useState(FEATURED_METROS[0].id);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [overnight, setOvernight] = useState(false);
  const [dateChoices] = useState(() => buildDateOptions(8).map((option) => option.value));

  if (!user?.premium) {
    return (
      <PremiumFeatureTeaser
        title="Unlock Day Trips with Premium"
        description="Search roundtrip options to every destination from one origin cluster and compare time on the ground."
        points={[
          "Search all destinations from a selected origin",
          "Keep same-day and next-day returns in one view",
          "Compare time on the ground before you commit",
          "Prioritize GoWild-style fares first",
        ]}
      />
    );
  }

  const trips = buildDayTrips({ metroId, date, overnight });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Day Trips</h1>
        <p className="text-sm text-muted-foreground">
          Compare quick roundtrips by time on the ground and all-in fare posture.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip controls</CardTitle>
          <CardDescription>
            Pick an origin cluster and decide whether the return should happen the same day or the next morning.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr,1fr,auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Origin metro</label>
            <Select value={metroId} onValueChange={setMetroId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURED_METROS.map((metro) => (
                  <SelectItem key={metro.id} value={metro.id}>
                    {metro.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Select value={date} onValueChange={setDate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateChoices.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3 rounded-md border border-border/70 bg-card/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Next-day return</p>
              <p className="text-xs text-muted-foreground">
                Give yourself more time at the destination
              </p>
            </div>
            <Switch checked={overnight} onCheckedChange={setOvernight} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>
                    {trip.destinationCity} ({trip.destinationCode})
                  </CardTitle>
                  <CardDescription>{trip.note}</CardDescription>
                </div>
                <p className="text-sm font-medium">{trip.allInFare}</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Outbound
                </p>
                <p className="mt-2 font-medium">{trip.outboundTime}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Return
                </p>
                <p className="mt-2 font-medium">{trip.returnTime}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Time at destination
                </p>
                <p className="mt-2 font-medium">{trip.timeOnGround}</p>
              </div>
              <div className="md:col-span-3">
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag) => (
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

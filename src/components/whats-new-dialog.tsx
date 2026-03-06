"use client";

import Link from "next/link";
import { BellRing, PlaneLanding, Sparkles } from "lucide-react";

import { useSession } from "@/components/providers/session-provider";
import { APP_VERSION, RELEASE_NOTES } from "@/lib/gowilder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WhatsNewDialog() {
  const { releaseNotesOpen, dismissReleaseNotes } = useSession();

  return (
    <Dialog open={releaseNotesOpen} onOpenChange={(open) => !open && dismissReleaseNotes()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
              <BellRing className="size-5" />
            </div>
            <div>
              <DialogTitle>What&apos;s New</DialogTitle>
              <DialogDescription>Version {APP_VERSION}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {RELEASE_NOTES.map((note, index) => (
            <div key={note.title} className="rounded-md border border-border/70 bg-card/70 p-4">
              <div className="flex items-center gap-2">
                {index === 0 ? (
                  <PlaneLanding className="size-4 text-primary" />
                ) : (
                  <Sparkles className="size-4 text-primary" />
                )}
                <p className="font-medium">{note.title}</p>
                {index === 0 ? <Badge variant="secondary">New</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{note.body}</p>
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild>
            <Link href="/plans">Upgrade now</Link>
          </Button>
          <Button onClick={dismissReleaseNotes}>Got it, thanks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

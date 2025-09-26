"use client";

import { useMemo } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useUpdatePracticeMutation, usePractices } from "@/lib/hooks/use-practices";
import { usePracticeModalStore } from "@/lib/stores/practice-modal-store";
import {
  selectPractices,
  selectPracticesActions,
  selectPracticesFilter,
  usePracticesStore,
  type Practice,
} from "@/lib/stores/practices-store";

import { dayOptions, virtueOptions } from "./practice-form-constants";

const dayLabelMap = new Map(dayOptions.map((item) => [item.value, item.label]));

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const toActiveDaysLabel = (practice: Practice) => {
  if (!practice.activeDays || practice.activeDays.length === 0) {
    return "All days";
  }

  return [...practice.activeDays]
    .sort((a, b) => a - b)
    .map((day) => dayLabelMap.get(day) ?? `Day ${day}`)
    .join(" · ");
};

export function PracticeList() {
  usePractices();

  const practices = usePracticesStore(selectPractices);
  const filter = usePracticesStore(selectPracticesFilter);
  const actions = usePracticesStore(selectPracticesActions);
  const modalActions = usePracticeModalStore((state) => state.actions);

  const updateMutation = useUpdatePracticeMutation();
  const { capture: track } = useAnalytics();

  const filteredPractices = useMemo(() => {
    return practices.filter((practice) => {
      if (filter.status === "active" && practice.status !== "active") return false;
      if (filter.status === "archived" && practice.status !== "archived") return false;
      if (filter.virtue && practice.virtue !== filter.virtue) return false;
      return true;
    });
  }, [filter.status, filter.virtue, practices]);

  const handleArchiveToggle = (practice: Practice) => {
    const isArchiving = practice.status === "active";

    updateMutation.mutate(
      {
        id: practice.id,
        isArchived: isArchiving,
      },
      {
        onSuccess: (updated) => {
          toast.success(isArchiving ? "Practice archived" : "Practice restored");
          track(isArchiving ? "practice_archived" : "practice_restored", {
            practiceId: updated.id,
            virtue: updated.virtue,
          });
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Unable to update practice");
          track("practice_archive_failed", {
            practiceId: practice.id,
            action: isArchiving ? "archive" : "restore",
          });
        },
      },
    );
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Practice roster</h2>
          <p className="text-sm text-muted-foreground">
            Filter by virtue or status, then edit cadence, reminders, or archive routines.
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={modalActions.openCreate}>
          New practice
        </Button>
      </header>
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card/60 p-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Status</span>
          <select
            className="rounded-2xl border border-input bg-background px-3 py-2"
            value={filter.status}
            onChange={(event) => actions.setFilter({ status: event.target.value as Practice["status"] })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Virtue</span>
          <select
            className="rounded-2xl border border-input bg-background px-3 py-2"
            value={filter.virtue ?? ""}
            onChange={(event) =>
              actions.setFilter({ virtue: event.target.value.length ? event.target.value : undefined })
            }
          >
            <option value="">All virtues</option>
            {virtueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.26em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-medium">Practice</th>
              <th className="px-5 py-4 font-medium">Cadence</th>
              <th className="px-5 py-4 font-medium">Reminder</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPractices.length === 0 ? (
              <tr>
                <td className="px-5 py-5 text-sm text-muted-foreground" colSpan={5}>
                  No practices match this filter yet. Try another virtue or create a new routine.
                </td>
              </tr>
            ) : (
              filteredPractices.map((practice) => (
                <tr key={practice.id} className="border-t border-border/60">
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-foreground">{practice.name}</span>
                      {practice.description ? (
                        <span className="text-xs text-muted-foreground">{practice.description}</span>
                      ) : null}
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        {practice.virtue}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground capitalize">{practice.frequency}</span>
                      <span>{toActiveDaysLabel(practice)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {practice.reminderTime ? `At ${practice.reminderTime}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {practice.status === "active" ? "Active" : "Archived"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => modalActions.openEdit(practice)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={practice.status === "active" ? "ghost" : "default"}
                        onClick={() => handleArchiveToggle(practice)}
                        disabled={updateMutation.isPending}
                      >
                        {practice.status === "active" ? "Archive" : "Restore"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

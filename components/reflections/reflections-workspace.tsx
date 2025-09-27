"use client";

import { useMemo, useState } from "react";

import { useReflections, type Reflection, type ReflectionType } from "@/lib/hooks/use-reflections";

import { ReflectionComposer } from "./reflection-composer";
import { ReflectionTimeline } from "./reflection-timeline";

export function ReflectionsWorkspace() {
  const { data = [], reflectionsByType, targetDate, isFetching } = useReflections();
  const [selectedType, setSelectedType] = useState<ReflectionType>("morning");

  const handleTimelineSelect = (reflection: Reflection) => {
    setSelectedType(reflection.type);
  };

  const timelineReflections = useMemo(() => data, [data]);

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
      <ReflectionComposer
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        reflectionsByType={reflectionsByType}
        targetDate={targetDate}
        isFetching={isFetching}
      />
      <ReflectionTimeline reflections={timelineReflections} onSelect={handleTimelineSelect} />
    </div>
  );
}

"use client";

import { useMemo } from "react";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { type WidgetKey, type WidgetColumn } from "@/lib/stores/dashboard-preferences-store";

interface SortableWidgetItemProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
}

function SortableWidgetItem({ id, children, isEditMode }: SortableWidgetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 z-20 cursor-grab active:cursor-grabbing rounded-lg bg-persona/10 p-2 hover:bg-persona/20 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="size-4 text-persona" />
        </div>
      )}
      {children}
    </div>
  );
}

interface SortableWidgetColumnProps {
  columnId: WidgetColumn;
  widgets: WidgetKey[];
  isEditMode: boolean;
  onReorder: (columnId: WidgetColumn, newOrder: WidgetKey[]) => void;
  renderWidget: (widgetKey: WidgetKey) => React.ReactNode;
  className?: string;
}

export function SortableWidgetColumn({
  columnId,
  widgets,
  isEditMode,
  onReorder,
  renderWidget,
  className,
}: SortableWidgetColumnProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const items = useMemo(() => widgets, [widgets]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as WidgetKey);
      const newIndex = items.indexOf(over.id as WidgetKey);

      const newOrder = arrayMove(items, oldIndex, newIndex);
      onReorder(columnId, newOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((widgetKey) => (
            <SortableWidgetItem key={widgetKey} id={widgetKey} isEditMode={isEditMode}>
              {renderWidget(widgetKey)}
            </SortableWidgetItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

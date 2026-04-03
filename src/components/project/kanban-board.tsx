"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Ticket, TicketStatus } from "@/types/project";
import { useProjectStore } from "@/stores/project-store";
import { KanbanColumn } from "./kanban-column";
import { KanbanCardOverlay } from "./kanban-card";
import { TicketDetailDialog } from "./ticket-detail-dialog";
import { AddTicketDialog } from "./add-ticket-dialog";
const COLUMNS: TicketStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { epics, tickets: allTickets, moveTicket } = useProjectStore();
  const [mounted, setMounted] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState<TicketStatus>("backlog");

  useEffect(() => { setMounted(true); }, []);

  const projectEpics = epics[projectId] || [];
  const projectTickets = useMemo(() => {
    return projectEpics.flatMap((epic) => allTickets[epic.id] || []);
  }, [projectEpics, allTickets]);

  const ticketsByStatus = useMemo(() => {
    const grouped: Record<TicketStatus, Ticket[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const ticket of projectTickets) {
      grouped[ticket.status].push(ticket);
    }
    return grouped;
  }, [projectTickets]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findTicketById = useCallback(
    (id: string): Ticket | undefined => {
      return projectTickets.find((t) => t.id === id);
    },
    [projectTickets]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const ticket = findTicketById(event.active.id as string);
      if (ticket) setActiveTicket(ticket);
    },
    [findTicketById]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if dropping on a column
      if (overId.startsWith("column-")) {
        const newStatus = overId.replace("column-", "") as TicketStatus;
        const ticket = findTicketById(activeId);
        if (ticket && ticket.status !== newStatus) {
          moveTicket(activeId, newStatus);
        }
        return;
      }

      // Dropping on another ticket — move to that ticket's column
      const overTicket = findTicketById(overId);
      const activeTicketObj = findTicketById(activeId);
      if (overTicket && activeTicketObj && activeTicketObj.status !== overTicket.status) {
        moveTicket(activeId, overTicket.status);
      }
    },
    [findTicketById, moveTicket]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTicket(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (overId.startsWith("column-")) {
        const newStatus = overId.replace("column-", "") as TicketStatus;
        moveTicket(activeId, newStatus);
      } else {
        const overTicket = findTicketById(overId);
        if (overTicket) {
          moveTicket(activeId, overTicket.status);
        }
      }
    },
    [findTicketById, moveTicket]
  );

  const handleTicketClick = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSheetOpen(true);
  }, []);

  const handleAddTicket = useCallback((status: TicketStatus) => {
    setAddDialogStatus(status);
    setAddDialogOpen(true);
  }, []);

  const firstEpicId = projectEpics[0]?.id;

  if (!mounted) {
    return (
      <div className="flex gap-4 p-4 min-w-max overflow-x-auto">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={ticketsByStatus[status]}
            onTicketClick={handleTicketClick}
            onAddTicket={handleAddTicket}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 min-w-max overflow-x-auto">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={ticketsByStatus[status]}
              onTicketClick={handleTicketClick}
              onAddTicket={handleAddTicket}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTicket ? <KanbanCardOverlay ticket={activeTicket} /> : null}
        </DragOverlay>
      </DndContext>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {firstEpicId && (
        <AddTicketDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          epicId={firstEpicId}
          defaultStatus={addDialogStatus}
        />
      )}
    </>
  );
}

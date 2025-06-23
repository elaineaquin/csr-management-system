"use client";

import { KanbanBoardCardType, KanbanBoardColumnType } from "@/server/kanban";
import { useDndContext } from "@dnd-kit/core";
import React, { useMemo, useState } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { cva } from "class-variance-authority";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import {
  CircleIcon,
  EllipsisVerticalIcon,
  GripVertical,
  PaletteIcon,
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { TaskCard } from "./task-card";
import { KanbanColorType } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAddKanbanCardTask, useUpdateColumnColor } from "@/hooks/use-kanban";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AddTaskForm } from "./add-task-form";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { ButtonGuard } from "../button-guard";

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: KanbanBoardColumnType;
}

export function BoardColumn({
  tasks,
  column,
  isOverlay,
  deleteColumn,
  renameColumn,
  deleteTask,
  addTask,
  renameTask,
}: {
  column: KanbanBoardColumnType;
  isOverlay?: boolean;
  tasks: KanbanBoardCardType[];
  deleteColumn?: (params: { columnId: string }) => void;
  renameColumn?: (params: { columnId: string; title: string }) => void;
  deleteTask?: (params: { taskId: string }) => void;
  renameTask?: (params: { taskId: string; title: string }) => void;
  addTask?: (params: { task: KanbanBoardCardType }) => void;
}) {
  const { id } = useParams();
  const { mutateAsync } = useUpdateColumnColor();
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [color, setColor] = useState(column.color);
  const [renameValue, setRenameValue] = useState(column.title);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const { mutateAsync: addTaskCard } = useAddKanbanCardTask();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "w-[360px] h-[560px] max-h-[560px] max-w-full flex flex-col flex-shrink-0 snap-center pb-1 px-1 my-2",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        getColumnColorClass(color),
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        })
      )}
    >
      <CardHeader className="pb-4 px-2 font-semibold border-b-2 border-black/50 text-left flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" {...attributes} {...listeners}>
            <span className="sr-only">{`Move column: ${column.title}`}</span>
            <GripVertical />
          </Button>
          <span>{renameValue}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border">
            {tasks.length}
          </span>
          <DropdownMenu>
            <ButtonGuard name="kanban" actions={["edit", "delete"]}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                >
                  <span className="sr-only">Open column menu</span>
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </ButtonGuard>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpenRenameDialog(true)}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <PaletteIcon className="w-4 h-4 mr-2" />
                    Change Color
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(
                      [
                        "Red",
                        "Green",
                        "Blue",
                        "Violet",
                        "Orange",
                        "Yellow",
                        "Gray",
                      ] as KanbanColorType[]
                    ).map((color) => (
                      <DropdownMenuItem
                        key={color}
                        onClick={async () => {
                          await mutateAsync({ columnId: column.id, color });
                          setColor(color);
                        }}
                      >
                        <CircleIcon
                          className={`w-3 h-3 mr-2 text-${color.toLowerCase()}-500`}
                          fill="currentColor"
                        />
                        {color}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 overflow-hidden">
        <CardContent className="flex flex-col gap-2 p-2 px-4 h-full overflow-y-auto">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={deleteTask}
                renameTask={renameTask}
              />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
      <ButtonGuard name="kanban" actions={["create"]}>
        <Button
          className="w-full flex justify-between"
          variant={"ghost"}
          onClick={() => setAddTaskDialogOpen(true)}
        >
          Add Task
          <PlusCircleIcon />
        </Button>
      </ButtonGuard>
      <AlertDialog open={openRenameDialog} onOpenChange={setOpenRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Column</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for the column <strong>{column.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRenameValue(column.title);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                if (renameValue.trim()) {
                  renameColumn?.({
                    columnId: column.id,
                    title: renameValue.trim(),
                  });
                  setOpenRenameDialog(false);
                }
              }}
            >
              Save
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the column{" "}
              <strong>{column.title}</strong> and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant={"destructive"}
              onClick={() => {
                deleteColumn?.({ columnId: column.id });
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AddTaskForm
        addTaskDialogOpen={addTaskDialogOpen}
        setAddTaskDialogOpen={setAddTaskDialogOpen}
        initialColumn={column.id}
        projectId={id as string}
        onSave={async (data) => {
          const id = toast.loading("Saving task");
          try {
            const newTask = await addTaskCard(data);
            addTask?.({
              task: newTask,
            });
            toast.success("Task saved", { id });
            setAddTaskDialogOpen(false);
          } catch {
            toast.error("Something went wrong", { id });
          }
        }}
      />
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-start">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function getColumnColorClass(
  color: KanbanColorType | undefined | null
): string {
  if (!color) {
    return "bg-gradient-to-br from-gray-100 to-gray-200 text-black dark:from-gray-700 dark:to-gray-900 dark:text-white";
  }

  const gradientMap: Record<KanbanColorType, string> = {
    Red: "bg-gradient-to-br from-red-100 to-red-300 text-red-900 dark:from-red-600 dark:to-red-800 dark:text-red-100",
    Green:
      "bg-gradient-to-br from-green-100 to-green-300 text-green-900 dark:from-green-600 dark:to-green-800 dark:text-green-100",
    Blue: "bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 dark:from-blue-600 dark:to-blue-800 dark:text-blue-100",
    Violet:
      "bg-gradient-to-br from-violet-100 to-violet-300 text-violet-900 dark:from-violet-600 dark:to-violet-800 dark:text-violet-100",
    Orange:
      "bg-gradient-to-br from-orange-100 to-orange-300 text-orange-900 dark:from-orange-600 dark:to-orange-800 dark:text-orange-100",
    Yellow:
      "bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-900 dark:from-yellow-600 dark:to-yellow-800 dark:text-yellow-100",
    Gray: "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 dark:from-gray-600 dark:to-gray-800 dark:text-gray-100",
  };

  return gradientMap[color];
}

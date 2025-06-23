"use client";

import { KanbanBoardCardType } from "@/server/kanban";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical, PencilIcon, TrashIcon, XIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"; // Adjust path based on your shadcn setup
import { UserInfoCard } from "../user-info-card";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { ButtonGuard } from "../button-guard";

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: KanbanBoardCardType;
}
export function TaskCard({
  task,
  isOverlay,
  onDelete,
  renameTask,
}: {
  task: KanbanBoardCardType;
  isOverlay?: boolean;
  renameTask?: (params: { taskId: string; title: string }) => void;
  onDelete?: (params: { taskId: string }) => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditTitle, setOpenEditTitle] = useState(false);
  const [openTaskDrawer, setOpenTaskDrawer] = useState(false);
  const [renameValue, setRenameValue] = useState(task.title);
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("w-[320px]", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border border-white/20 backdrop-blur-md bg-white/10 shadow-md rounded-lg ${variants(
        {
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }
      )}`}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-transparent px-2 py-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" {...attributes} {...listeners}>
            <span className="sr-only">Move task</span>
            <GripVertical className="w-4 h-4" />
          </Button>
          <Badge
            variant="outline"
            className="bg-white/20 border-white/30 backdrop-blur-sm"
          >
            Task
          </Badge>
        </div>
        <ButtonGuard name="kanban" actions={["delete"]}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <span className="sr-only">Delete task</span>
            <TrashIcon />
          </Button>
        </ButtonGuard>
      </CardHeader>

      <CardContent className="p-3 flex flex-col gap-2 text-left bg-transparent">
        <div
          className="font-semibold text-sm hover:underline cursor-pointer"
          onClick={() => setOpenTaskDrawer(true)}
        >
          {task.title}
        </div>

        {task.description && (
          <div className="text-sm whitespace-pre-wrap line-clamp-3">
            {task.description}
          </div>
        )}

        <div className="flex items-center justify-between text-xs mt-2">
          {task.dueDate ? (
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          ) : (
            <span className="italic opacity-50">No due date</span>
          )}

          {task.assignees?.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="ml-auto underline cursor-pointer">
                  {task.assignees.length} assignee(s)
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-3 shadow-lg backdrop-blur-sm bg-white/10 border dark:border-white/10 rounded-md dark:text-white">
                <div className="mb-2 border-b pb-1 text-sm font-semibold">
                  Assigned to
                </div>
                <div className="flex flex-col gap-2">
                  {task.assignees.map((assignee) => (
                    <UserInfoCard
                      key={assignee.user.id}
                      userId={assignee.user.id}
                      userName={assignee.user.name}
                    />
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </CardContent>
      <Drawer
        open={openTaskDrawer}
        onOpenChange={setOpenTaskDrawer}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader className="border-b-2 relative">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-semibold">
                {task.title}
              </DrawerTitle>
              <div className="flex gap-2">
                <ButtonGuard name="kanban" actions={["edit"]}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenEditTitle(true)}
                    aria-label="Edit task title"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Button>
                </ButtonGuard>
                <ButtonGuard name="kanban" actions={["delete"]}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenDeleteDialog(true)}
                    aria-label="Delete task"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </ButtonGuard>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    <XIcon className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </div>

            <DrawerDescription>Discussions</DrawerDescription>
          </DrawerHeader>

          <div className="p-4">Comments</div>
        </DrawerContent>
      </Drawer>
      <AlertDialog open={openEditTitle} onOpenChange={setOpenEditTitle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Task</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for the task <strong>{task.title}</strong>.
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
                setRenameValue(task.title);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                if (renameValue.trim()) {
                  renameTask?.({ taskId: task.id, title: renameValue.trim() });
                  setOpenEditTitle(false);
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
              This will permanently delete the task{" "}
              <strong>{task.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant={"destructive"}
              onClick={() => {
                onDelete?.({ taskId: task.id });
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

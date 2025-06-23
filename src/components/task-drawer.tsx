"use client";

import { KanbanBoardCardType } from "@/server/kanban";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { PencilIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ButtonGuard } from "./button-guard";

export default function TaskDrawer({
  task,
  open,
  onOpenChange,
  openDeleteDialog,
  setOpenDeleteDialog,
  onRename,
  onDelete,
}: {
  task: KanbanBoardCardType;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  openDeleteDialog: boolean;
  setOpenDeleteDialog: (val: boolean) => void;
  onRename?: (params: { taskId: string; title: string }) => void;
  onDelete?: (params: { taskId: string }) => void;
}) {
  const [renameValue, setRenameValue] = useState(task.title);
  const [openEditTitle, setOpenEditTitle] = useState(false);

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
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
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Button>
                </ButtonGuard>
                <ButtonGuard name="kanban" actions={["delete"]}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenDeleteDialog(true)}
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

      {/* Rename Dialog */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRenameValue(task.title)}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                if (renameValue.trim()) {
                  onRename?.({ taskId: task.id, title: renameValue.trim() });
                  setOpenEditTitle(false);
                }
              }}
            >
              Save
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
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
              variant="destructive"
              onClick={() => {
                onDelete?.({ taskId: task.id });
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

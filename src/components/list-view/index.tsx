"use client";

import type { KanbanBoardType } from "@/server/kanban";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { getColumnColorClass } from "../kanban-board/board-column";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ButtonGuard } from "../button-guard";

type SortField = "title" | "column" | "dueDate";
type SortDirection = "asc" | "desc";

export function ListView({
  board,
  onDeleteTask,
}: {
  board: KanbanBoardType;
  onDeleteTask?: (params: { taskId: string }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilter, setColumnFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Extract all tasks from all columns
  const allTasks = useMemo(() => {
    return board.columns.flatMap((column) =>
      column.cards.map((card) => ({
        ...card,
        columnTitle: column.title,
        columnColor: column.color,
      }))
    );
  }, [board]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...allTasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply column filter
    if (columnFilter !== "all") {
      result = result.filter((task) => task.columnId === columnFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "column":
          comparison = a.columnTitle.localeCompare(b.columnTitle);
          break;
        case "dueDate":
          // Handle null/undefined dates
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else
            comparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [allTasks, searchQuery, columnFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={columnFilter} onValueChange={setColumnFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Columns</SelectItem>
              {board.columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[40%] cursor-pointer"
                onClick={() => toggleSort("title")}
              >
                <div className="flex items-center">
                  Task {renderSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                className="w-[20%] cursor-pointer"
                onClick={() => toggleSort("column")}
              >
                <div className="flex items-center">
                  Column {renderSortIcon("column")}
                </div>
              </TableHead>
              <TableHead
                className="w-[20%] cursor-pointer"
                onClick={() => toggleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due Date {renderSortIcon("dueDate")}
                </div>
              </TableHead>
              <TableHead className="w-[15%]">Assignees</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{task.title}</span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs",
                        getColumnColorClass(task.columnColor)
                      )}
                    >
                      {task.columnTitle}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <span className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No due date
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <Avatar
                            key={assignee.user.id}
                            className="h-6 w-6 border-2 border-background"
                          >
                            <AvatarFallback className="text-xs">
                              {assignee.user.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <ButtonGuard name="kanban" actions={["edit", "delete"]}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </ButtonGuard>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteTask?.({ taskId: task.id })}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { ProjectStatusType, VolunteerRequestStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  parseISO,
} from "date-fns";
import { twMerge } from "tailwind-merge";
import { Active, DataRef, Over } from "@dnd-kit/core";
import { ColumnDragData } from "@/components/kanban-board/board-column";
import { TaskDragData } from "@/components/kanban-board/task-card";

type DraggableData = ColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormattedDate(value: string | Date): string {
  const date = new Date(value);
  const daysDiff = differenceInDays(new Date(), date);
  return daysDiff > 7
    ? format(date, "MMM d, yyyy")
    : formatDistanceToNow(date, { addSuffix: true });
}

export function humanizeFieldName(str: string): string {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function getInputType(field: string): string {
  if (field.toLowerCase().includes("password")) return "password";
  if (field === "email") return "email";
  return "text";
}

export function parseUserAgent(ua?: string | null | undefined) {
  if (!ua) return "Unknown";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh")) os = "Mac";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Unknown Browser";
  let version = "";

  if (/Chrome\/([0-9.]+)/.test(ua) && !/Edge\/|OPR\//.test(ua)) {
    browser = "Chrome";
    version = ua.match(/Chrome\/([0-9]+)/)?.[1] || "";
  } else if (/Safari\/[0-9.]+/.test(ua) && /Version\/([0-9.]+)/.test(ua)) {
    browser = "Safari";
    version = ua.match(/Version\/([0-9]+)/)?.[1] || "";
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browser = "Firefox";
    version = ua.match(/Firefox\/([0-9]+)/)?.[1] || "";
  } else if (/Edg\/([0-9.]+)/.test(ua)) {
    browser = "Edge";
    version = ua.match(/Edg\/([0-9]+)/)?.[1] || "";
  }

  return `${os} - ${browser} ${version}`;
}

export function getTypeLabel(mime: string) {
  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "Excel";
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "Word";
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/")) return "Image";
  return mime; // fallback to raw MIME if unknown
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes"; // Use !+bytes to handle possible non-numeric input gracefully

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure index is within bounds
  const unit = sizes[i] || sizes[sizes.length - 1];

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${unit}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fil-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM d");
};

export const getVolunteerRequestStatusColor = (
  status: VolunteerRequestStatus
) => {
  switch (status) {
    case "Open":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Closed":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Filled":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Cancelled":
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export const getProposalStatusColor = (status: ProjectStatusType) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Ongoing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    case "HighRisk":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "Revision":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getInitials = (name: string, email: string) => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

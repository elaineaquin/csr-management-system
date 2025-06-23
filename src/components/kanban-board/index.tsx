'use state';

import {
	Announcements,
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BoardColumn, BoardContainer } from './board-column';
import { coordinateGetter } from './coordinate-getter';
import { KanbanBoardCardType, KanbanBoardColumnType, KanbanBoardType } from '@/server/kanban';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { hasDraggableData } from '@/lib/utils';
import { TaskCard } from './task-card';
import {
	useDeleteColumn,
	useDeleteTask,
	useRenameColumn,
	useUpdateKanbanCardTask,
	useUpdateKanbanColumn,
} from '@/hooks/use-kanban';

export function KanbanBoard({ board }: { board: KanbanBoardType }) {
	// hooks
	const pickedUpTaskColumn = useRef<string | null>(null);
	const [columns, setColumns] = useState<KanbanBoardColumnType[]>(() => board.columns);
	const [tasks, setTasks] = useState<KanbanBoardCardType[]>(() => board.columns.flatMap((col) => col.cards));
	const { mutateAsync: deleteTask } = useDeleteTask();
	const { mutateAsync: deleteColumn } = useDeleteColumn();
	const { mutateAsync: renameColumn } = useRenameColumn();
	const { mutate: updateKanbanCard } = useUpdateKanbanCardTask();
	const { mutate: updateColumnPosition } = useUpdateKanbanColumn();

	useEffect(() => {
		setColumns(board.columns);
		setTasks(board.columns.flatMap((col) => col.cards));
	}, [board]);

	const [activeColumn, setActiveColumn] = useState<KanbanBoardColumnType | null>(null);
	const [activeTask, setActiveTask] = useState<KanbanBoardCardType | null>(null);
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: coordinateGetter }),
	);

	function getDraggingTaskData(taskId: string, columnId: string) {
		const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
		const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
		const column = columns.find((col) => col.id === columnId);
		return {
			tasksInColumn,
			taskPosition,
			column,
		};
	}

	const announcements: Announcements = {
		onDragStart({ active }) {
			if (!hasDraggableData(active)) return;
			if (active.data.current?.type === 'Column') {
				const startColumnIdx = columnsId.findIndex((id) => id === active.id);
				const startColumn = columns[startColumnIdx];
				return `Picked up Column ${startColumn?.title} at position: ${startColumnIdx + 1} of ${columnsId.length}`;
			} else if (active.data.current?.type === 'Task') {
				pickedUpTaskColumn.current = active.data.current.task.columnId;
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
					active.id as string,
					pickedUpTaskColumn.current!,
				);
				return `Picked up Task ${active.data.current.task.title} at position: ${taskPosition + 1} of ${
					tasksInColumn.length
				} in column ${column?.title}`;
			}
		},
		onDragOver({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) return;

			if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
				const overColumnIdx = columnsId.findIndex((id) => id === over.id);
				return `Column ${active.data.current.column.title} was moved over ${
					over.data.current.column.title
				} at position ${overColumnIdx + 1} of ${columnsId.length}`;
			} else if (active.data.current?.type === 'Task' && over.data.current?.type === 'Task') {
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
					over.id as string,
					over.data.current.task.columnId,
				);
				if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
					return `Task ${active.data.current.task.title} was moved over column ${column?.title} in position ${
						taskPosition + 1
					} of ${tasksInColumn.length}`;
				}
				return `Task was moved over position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
		},
		onDragEnd({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) {
				pickedUpTaskColumn.current = null;
				return;
			}
			if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
				const overColumnPosition = columnsId.findIndex((id) => id === over.id);

				return `Column ${active.data.current.column.title} was dropped into position ${overColumnPosition + 1} of ${
					columnsId.length
				}`;
			} else if (active.data.current?.type === 'Task' && over.data.current?.type === 'Task') {
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
					over.id as string,
					over.data.current.task.columnId,
				);
				if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
					return `Task was dropped into column ${column?.title} in position ${taskPosition + 1} of ${
						tasksInColumn.length
					}`;
				}
				return `Task was dropped into position ${taskPosition + 1} of ${tasksInColumn.length} in column ${
					column?.title
				}`;
			}
			pickedUpTaskColumn.current = null;
		},
		onDragCancel({ active }) {
			pickedUpTaskColumn.current = null;
			if (!hasDraggableData(active)) return;
			return `Dragging ${active.data.current?.type} cancelled.`;
		},
	};

	const handleOnDelete = async ({ columnId }: { columnId: string }) => {
		await deleteColumn(
			{ columnId },
			{
				onSuccess: () => {
					setColumns((prev) => prev.filter((col) => col.id !== columnId));
					setTasks((prev) => prev.filter((task) => task.columnId !== columnId));
				},
			},
		);
	};

	const handleOnDeleteTask = async ({ taskId }: { taskId: string }) => {
		await deleteTask(
			{ taskId },
			{
				onSuccess: () => {
					setTasks((prev) => prev.filter((task) => task.id !== taskId));
				},
			},
		);
	};

	const handleAddTask = async ({ task }: { task: KanbanBoardCardType }) => {
		setTasks((prev) => {
			const tasksInTargetColumn = prev.filter((t) => t.columnId === task.columnId);
			const newPosition = tasksInTargetColumn.length;

			const newTask = {
				...task,
				position: newPosition,
			};
			return [...prev, newTask];
		});
	};

	return (
		<DndContext
			accessibility={{ announcements }}
			sensors={sensors}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
		>
			<BoardContainer>
				<SortableContext items={columnsId}>
					{[...columns]
						.sort((a, b) => a.position - b.position)
						.map((column) => (
							<BoardColumn
								key={column.id}
								column={column}
								tasks={tasks.filter((task) => task.columnId === column.id)}
								deleteColumn={handleOnDelete}
								renameColumn={renameColumn}
								deleteTask={handleOnDeleteTask}
								addTask={handleAddTask}
							/>
						))}
				</SortableContext>
			</BoardContainer>

			{'document' in window &&
				createPortal(
					<DragOverlay>
						{activeColumn && (
							<BoardColumn
								isOverlay
								column={activeColumn}
								tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
							/>
						)}
						{activeTask && <TaskCard task={activeTask} isOverlay />}
					</DragOverlay>,
					document.body,
				)}
		</DndContext>
	);

	function onDragStart(event: DragStartEvent) {
		if (!hasDraggableData(event.active)) return;
		const data = event.active.data.current;
		if (data?.type === 'Column') {
			setActiveColumn(data.column as KanbanBoardColumnType);
			return;
		}

		if (data?.type === 'Task') {
			setActiveTask(data.task as unknown as KanbanBoardCardType);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;
		if (!over || !hasDraggableData(active) || !hasDraggableData(over)) return;

		const activeId = active.id;
		const overId = over.id;

		const activeData = active.data.current;
		const overData = over.data.current;

		const isActiveAColumn = activeData?.type === 'Column';
		const isActiveATask = activeData?.type === 'Task';

		// 🟨 COLUMN MOVEMENT
		if (isActiveAColumn) {
			setColumns((columns) => {
				const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
				const overColumnIndex = columns.findIndex((col) => col.id === overId);

				const reordered = arrayMove(columns, activeColumnIndex, overColumnIndex);

				reordered.forEach((col, index) => {
					if (col.position !== index) {
						updateColumnPosition({ columnId: col.id, position: index });
					}
				});

				return reordered.map((col, i) => ({ ...col, position: i }));
			});
			return;
		}

		// 🟦 TASK MOVEMENT
		if (isActiveATask) {
			setTasks((prevTasks) => {
				const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
				const overIndex = prevTasks.findIndex((t) => t.id === overId);

				const activeTask = prevTasks[activeIndex];
				const overTask = prevTasks[overIndex];

				if (!activeTask || (!overTask && overData?.type !== 'Column')) return prevTasks;

				const updatedTasks = [...prevTasks];
				updatedTasks.splice(activeIndex, 1); // remove dragged task

				let targetColumnId: string;
				let insertIndex: number;

				if (overData && overData.type === 'Column') {
					targetColumnId = overId as string;
					const tasksInTarget = updatedTasks.filter((t) => t.columnId === targetColumnId);
					insertIndex = tasksInTarget.length;
				} else {
					targetColumnId = overTask.columnId;

					// Adjust if moving downwards within same column
					insertIndex = activeTask.columnId === targetColumnId && activeIndex < overIndex ? overIndex - 1 : overIndex;
				}

				const movedTask = {
					...activeTask,
					columnId: targetColumnId,
				};

				updatedTasks.splice(insertIndex, 0, movedTask);

				// 🔁 Normalize and update all tasks in affected column(s)
				const finalTasks: typeof updatedTasks = [];
				const allColumnsToUpdate = new Set([activeTask.columnId, targetColumnId]);

				for (const columnId of allColumnsToUpdate) {
					// 🧠 Get new visual order (not relying on .position)
					const tasksInColumn = updatedTasks.filter((t) => t.columnId === columnId);

					tasksInColumn.forEach((task, index) => {
						const updatedTask = { ...task, position: index };
						finalTasks.push(updatedTask);

						updateKanbanCard({
							taskId: task.id,
							columnId,
							position: index,
						});
					});
				}

				// Keep other untouched tasks
				const untouched = updatedTasks.filter((t) => !allColumnsToUpdate.has(t.columnId));
				return [...finalTasks, ...untouched];
			});
		}
	}

	// async function onDragEnd(event: DragEndEvent) {
	// 	setActiveColumn(null);
	// 	setActiveTask(null);

	// 	const { active, over } = event;
	// 	if (!over) return;

	// 	const activeId = active.id;
	// 	const overId = over.id;

	// 	if (!hasDraggableData(active)) return;

	// 	const activeData = active.data.current;
	// 	if (activeId === overId) return;

	// 	const isActiveAColumn = activeData?.type === 'Column';
	// 	if (!isActiveAColumn) return;

	// 	setColumns((columns) => {
	// 		const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
	// 		const overColumnIndex = columns.findIndex((col) => col.id === overId);
	// 		return arrayMove(columns, activeColumnIndex, overColumnIndex);
	// 	});
	// }

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		if (!hasDraggableData(active) || !hasDraggableData(over)) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		const isActiveATask = activeData?.type === 'Task';
		const isOverATask = overData?.type === 'Task';

		if (!isActiveATask) return;

		// Im dropping a Task over another Task
		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);
				const activeTask = tasks[activeIndex];
				const overTask = tasks[overIndex];
				if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
					activeTask.columnId = overTask.columnId;
					return arrayMove(tasks, activeIndex, overIndex - 1);
				}

				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		const isOverAColumn = overData?.type === 'Column';

		// Im dropping a Task over a column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const activeTask = tasks[activeIndex];
				if (activeTask) {
					activeTask.columnId = String(overId);
					return arrayMove(tasks, activeIndex, activeIndex);
				}
				return tasks;
			});
		}
	}
}

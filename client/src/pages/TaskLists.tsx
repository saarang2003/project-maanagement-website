import { useEffect, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task, Plan, TaskList } from "@/lib/types";

import { KanbanTask } from "@/components/kanban/KanbanTask";
import { useParams } from "react-router";
import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskListMutationDialog } from "@/components/kanban/TaskListMutationDialog";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/kanban/kanbanColumn";

export default function TaskLists() {
  let { plan_id } = useParams();
  const queryclient = useQueryClient();
  const { data: plan } = useQuery<Plan>({
    queryKey: ["plans", plan_id, "include_all"],
    queryFn: async () => {
      const res = await api.get(`/api/v1/plans/${plan_id}?include_all=true`);
      return res?.data;
    },
    retry: false,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTaskList, setEditTaskList] = useState<TaskList | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskListDialogOpen, setIsTaskListDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortMutation = useMutation({
    mutationFn: (
      data: {
        id: string;
        task_list_id: string;
        sort_number: number;
      }[]
    ) =>
      api
        .post(`/api/v1/plans/${plan_id}/task-lists/bulk-sorting-update`, {
          tasks: data,
        })
        .then((res) => res),
    onSuccess: async () => {
      toast.success("Task sorted successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeTaskId = active.id as string;
    const task = tasks.find((t) => t._id === activeTaskId);
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task._id === activeId);
    if (!activeTask) return;

    const isOverColumn = plan?.task_lists?.some((col) => col._id === overId);

    if (isOverColumn && activeTask.task_list_id !== overId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === activeId
            ? {
                ...task,
                task_list_id: overId,
              }
            : task
        )
      );
    }
  }

  // Drag handler
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex).map(
      (task, index) => ({
        ...task,
        sort_number: index,
      })
    );

    setTasks(newTasks);
    // Optionally update backend
    sortMutation.mutate(
      newTasks.map((task) => ({
        id: task._id,
        task_list_id: task.task_list_id,
        sort_number: task.sort_number,
      }))
    );
  }

  function handleEditTaskList(taskList: TaskList) {
    setEditTaskList(taskList);
    setIsTaskListDialogOpen(true);
  }

  const deleteMutation = useMutation({
    mutationFn: (taskListId: string) =>
      api
        .delete(`/api/v1/plans/${plan_id}/task-lists/${taskListId}`)
        .then((res) => res),
    onSuccess: async () => {
      toast.success("Task list deleted successfully");
      await queryclient.invalidateQueries({
        queryKey: ["plans", plan_id, "include_all"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "An error occurred");
    },
  });

  function handleTaskListDelete(taskListId: string) {
    deleteMutation.mutate(taskListId);
  }

  useEffect(() => {
    if (plan?.task_lists) {
      const allTasks = plan.task_lists.flatMap((list) => list.tasks);
      setTasks(allTasks);
    }
  }, [plan]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <h1 className="text-xl font-semibold">{plan?.title}</h1>
        <Button onClick={() => setIsTaskListDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task List
        </Button>
      </header>

      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4">
            {plan?.task_lists?.map((taskList) => (
              <KanbanColumn
                key={taskList._id}
                taskList={taskList}
                tasks={tasks.filter((t) => t.task_list_id === taskList._id)}
                plan_id={plan_id!}
                handleTaskListDelete={handleTaskListDelete}
                handleEditTaskList={handleEditTaskList}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <KanbanTask task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {plan_id && (
        <TaskListMutationDialog
          open={isTaskListDialogOpen}
          onOpenChange={setIsTaskListDialogOpen}
          plan_id={plan_id!}
          taskList={editTaskList}
        />
      )}
    </div>
  );
}